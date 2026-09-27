import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/database/prisma.service';
import { CancelBookingDto, RescheduleBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: CreateBookingDto, currentUser?: any) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
      include: {
        route: {
          include: {
            originStop: true,
            destinationStop: true,
          },
        },
        bus: {
          include: { seats: true },
        },
        tripSegments: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            fromStop: true,
            toStop: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Determine traversed segments
    const fromIndex = trip.tripSegments.findIndex(
      (s) => s.fromStopId === dto.fromStopId,
    );
    const toIndex = trip.tripSegments.findIndex(
      (s) => s.toStopId === dto.toStopId,
    );

    if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
      throw new BadRequestException('Invalid journey stop sequence');
    }

    const traversedSegments = trip.tripSegments.filter(
      (_, idx) => idx >= fromIndex && idx <= toIndex,
    );

    const totalAmount = trip.price * dto.passengers.length;
    const cashTendered = dto.cashTenderedETB ?? totalAmount;
    const changeReturned = Math.max(0, cashTendered - totalAmount);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingReference = `BK-${dateStr}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const agentId = dto.agentId || currentUser?.userId;
    const branchId = dto.branchId || currentUser?.branchId;

    return this.prisma.$transaction(async (tx) => {
      // 1. Verify seat availability or hold validity
      for (const passenger of dto.passengers) {
        // Resolve busSeatId
        const physicalSeat = trip.bus.seats.find(
          (s) => s.id === passenger.seatId || s.seatNumber === passenger.seatNumber,
        );

        if (!physicalSeat) {
          throw new BadRequestException(`Seat ${passenger.seatNumber} not found on bus`);
        }

        for (const seg of traversedSegments) {
          const segSeat = await tx.tripSegmentSeat.findUnique({
            where: {
              tripSegmentId_busSeatId: {
                tripSegmentId: seg.id,
                busSeatId: physicalSeat.id,
              },
            },
          });

          if (!segSeat) {
            throw new BadRequestException(`Seat ${passenger.seatNumber} not configured on segment`);
          }

          // If reservationId provided, seat should be HELD by this reservation
          if (dto.reservationId) {
            if (segSeat.status !== 'HELD' || segSeat.reservationId !== dto.reservationId) {
              throw new BadRequestException(`Seat ${passenger.seatNumber} reservation has expired or is invalid`);
            }
          } else {
            // Instant direct purchase (counter agent walk-in)
            if (segSeat.status !== 'AVAILABLE') {
              throw new BadRequestException(`Seat ${passenger.seatNumber} is no longer available`);
            }
          }
        }
      }

      // 2. Create Master Booking Record
      const booking = await tx.booking.create({
        data: {
          bookingReference,
          tripId: dto.tripId,
          reservationId: dto.reservationId || null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail || null,
          bookedByUserId: agentId || null,
          bookedByRole: currentUser?.role || 'TICKET_AGENT',
          branchId: branchId || null,
          totalAmountETB: totalAmount,
          paymentStatus: 'COMPLETED',
        },
      });

      // 3. Create Passengers and Tickets
      const createdTickets = [];

      for (const passenger of dto.passengers) {
        const physicalSeat = trip.bus.seats.find(
          (s) => s.id === passenger.seatId || s.seatNumber === passenger.seatNumber,
        )!;

        // Upsert Passenger registry
        let passengerRecord = await tx.passenger.findUnique({
          where: { phone: passenger.passengerPhone },
        });

        if (!passengerRecord) {
          passengerRecord = await tx.passenger.create({
            data: {
              fullName: passenger.passengerName,
              phone: passenger.passengerPhone,
              nationalIdNumber: passenger.passengerIdNumber || null,
            },
          });
        }

        const bookingPassenger = await tx.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            passengerId: passengerRecord.id,
            seatNumber: physicalSeat.seatNumber,
            passengerName: passenger.passengerName,
            passengerPhone: passenger.passengerPhone,
            passengerIdNumber: passenger.passengerIdNumber || 'N/A',
          },
        });

        const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const qrHash = crypto
          .createHash('sha256')
          .update(`${ticketNumber}:${booking.bookingReference}:${physicalSeat.seatNumber}:${trip.id}`)
          .digest('hex');

        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            bookingId: booking.id,
            bookingPassengerId: bookingPassenger.id,
            tripId: trip.id,
            seatNumber: physicalSeat.seatNumber,
            passengerName: passenger.passengerName,
            passengerPhone: passenger.passengerPhone,
            passengerIdNumber: passenger.passengerIdNumber || 'N/A',
            fareETB: totalAmount / dto.passengers.length,
            qrHash,
            status: 'ISSUED',
            boardingTerminal: traversedSegments[0].fromStop.name,
            dropoffTerminal: traversedSegments[traversedSegments.length - 1].toStop.name,
          },
        });

        createdTickets.push(ticket);

        // Update all traversed segment seats to BOOKED
        for (const seg of traversedSegments) {
          await tx.tripSegmentSeat.update({
            where: {
              tripSegmentId_busSeatId: {
                tripSegmentId: seg.id,
                busSeatId: physicalSeat.id,
              },
            },
            data: {
              status: 'BOOKED',
              reservationId: null,
              heldUntil: null,
            },
          });
        }
      }

      // 4. Link Booking to Traversed Segments
      for (const seg of traversedSegments) {
        await tx.bookingSegment.create({
          data: {
            bookingId: booking.id,
            tripSegmentId: seg.id,
          },
        });
      }

      // 5. Create Payment Record
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amountETB: totalAmount,
          paymentMethod: dto.paymentMethod,
          transactionReference: dto.transactionReference || `TXN-${Date.now()}`,
          cashTenderedETB: dto.paymentMethod === 'CASH' ? cashTendered : null,
          changeReturnedETB: dto.paymentMethod === 'CASH' ? changeReturned : null,
          status: 'COMPLETED',
        },
      });

      // 6. Confirm Reservation if applicable
      if (dto.reservationId) {
        await tx.reservation.update({
          where: { id: dto.reservationId },
          data: { status: 'CONFIRMED' },
        });
      }

      // 7. Update Agent Cash Shift if active
      if (agentId) {
        const activeShift = await tx.cashShift.findFirst({
          where: {
            agentId,
            status: 'OPEN',
          },
        });

        if (activeShift) {
          await tx.cashShift.update({
            where: { id: activeShift.id },
            data: {
              cashSalesETB:
                dto.paymentMethod === 'CASH'
                  ? { increment: totalAmount }
                  : undefined,
              ticketsCount: { increment: dto.passengers.length },
            },
          });
        }
      }

      // 8. Log Audit
      await tx.auditLog.create({
        data: {
          userId: agentId || null,
          action: 'BOOKING_CREATE',
          entityName: 'Booking',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            bookingReference,
            totalAmount,
            passengersCount: dto.passengers.length,
            seats: dto.passengers.map((p) => p.seatNumber),
            method: dto.paymentMethod,
          }),
        },
      });

      // 9. Format Print Layouts (Thermal Receipt & Boarding Pass)
      const thermalReceipt = this.generateThermalReceiptText({
        companyName: 'Abyssinia Bus S.C.',
        bookingReference,
        date: trip.scheduledDeparture.toISOString().slice(0, 10),
        time: trip.scheduledDeparture.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        origin: traversedSegments[0].fromStop.name,
        destination: traversedSegments[traversedSegments.length - 1].toStop.name,
        busPlate: trip.bus.plateNumber,
        tickets: createdTickets,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        cashTendered,
        changeReturned,
        agentName: currentUser?.fullName || 'Counter Agent',
      });

      return {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status: booking.paymentStatus,
        totalAmountETB: booking.totalAmountETB,
        cashTenderedETB: cashTendered,
        changeReturnedETB: changeReturned,
        tickets: createdTickets,
        thermalReceipt,
      };
    });
  }

  async searchBookings(query: string) {
    const q = query.trim();
    if (!q) return [];

    return this.prisma.booking.findMany({
      where: {
        OR: [
          { bookingReference: { contains: q } },
          { customerName: { contains: q } },
          { customerPhone: { contains: q } },
          { tickets: { some: { ticketNumber: { contains: q } } } },
          { passengers: { some: { passengerName: { contains: q } } } },
          { passengers: { some: { passengerIdNumber: { contains: q } } } },
        ],
      },
      include: {
        trip: {
          include: {
            route: {
              include: { originStop: true, destinationStop: true },
            },
            bus: true,
          },
        },
        passengers: true,
        tickets: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getBookingById(idOrRef: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrRef }, { bookingReference: idOrRef }],
      },
      include: {
        trip: {
          include: {
            route: {
              include: { originStop: true, destinationStop: true },
            },
            bus: {
              include: { seats: true },
            },
            tripSegments: {
              orderBy: { sequenceNumber: 'asc' },
              include: { fromStop: true, toStop: true },
            },
          },
        },
        passengers: true,
        tickets: {
          include: { boardings: true },
        },
        payments: true,
        bookedByUser: true,
        branch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking "${idOrRef}" not found`);
    }

    return booking;
  }

  async cancelBooking(idOrRef: string, dto: CancelBookingDto, currentUser?: any) {
    const booking = await this.getBookingById(idOrRef);

    if (booking.paymentStatus === 'REFUNDED') {
      throw new BadRequestException('Booking is already cancelled and refunded');
    }

    const refundPercent = dto.refundPercentage ?? 90; // Default 10% cancellation fee
    const cancellationFee = (booking.totalAmountETB * (100 - refundPercent)) / 100;
    const refundAmount = booking.totalAmountETB - cancellationFee;

    const agentId = dto.agentId || currentUser?.userId;

    return this.prisma.$transaction(async (tx) => {
      // 1. Release segment seats back to AVAILABLE
      const bookingSegments = await tx.bookingSegment.findMany({
        where: { bookingId: booking.id },
      });

      for (const ticket of booking.tickets) {
        const physicalSeat = booking.trip.bus.seats.find((s) => s.seatNumber === ticket.seatNumber);
        if (physicalSeat) {
          for (const bs of bookingSegments) {
            await tx.tripSegmentSeat.update({
              where: {
                tripSegmentId_busSeatId: {
                  tripSegmentId: bs.tripSegmentId,
                  busSeatId: physicalSeat.id,
                },
              },
              data: {
                status: 'AVAILABLE',
                reservationId: null,
                heldUntil: null,
              },
            });
          }
        }
      }

      // 2. Mark Tickets CANCELLED
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'CANCELLED' },
      });

      // 3. Mark Booking REFUNDED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'REFUNDED' },
      });

      // 4. Update CashShift if active
      if (agentId) {
        const activeShift = await tx.cashShift.findFirst({
          where: { agentId, status: 'OPEN' },
        });

        if (activeShift) {
          await tx.cashShift.update({
            where: { id: activeShift.id },
            data: {
              refundsETB: { increment: refundAmount },
              cancelledTicketsCount: { increment: booking.tickets.length },
            },
          });
        }
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: agentId || null,
          action: 'BOOKING_CANCEL',
          entityName: 'Booking',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            bookingReference: booking.bookingReference,
            total: booking.totalAmountETB,
            cancellationFee,
            refundAmount,
            reason: dto.reason || 'Customer cancellation',
          }),
        },
      });

      return {
        bookingId: updatedBooking.id,
        bookingReference: updatedBooking.bookingReference,
        status: 'REFUNDED',
        originalAmountETB: booking.totalAmountETB,
        cancellationFeeETB: cancellationFee,
        refundAmountETB: refundAmount,
        seatsReleased: booking.tickets.map((t) => t.seatNumber),
      };
    });
  }

  async rescheduleBooking(idOrRef: string, dto: RescheduleBookingDto, currentUser?: any) {
    const booking = await this.getBookingById(idOrRef);

    if (booking.paymentStatus === 'REFUNDED') {
      throw new BadRequestException('Cannot reschedule a cancelled/refunded booking');
    }

    const newTrip = await this.prisma.trip.findUnique({
      where: { id: dto.newTripId },
      include: {
        bus: { include: { seats: true } },
        tripSegments: { orderBy: { sequenceNumber: 'asc' } },
      },
    });

    if (!newTrip) {
      throw new NotFoundException('Target rescheduling trip not found');
    }

    const newSeat = newTrip.bus.seats.find((s) => s.seatNumber === dto.newSeatNumber);
    if (!newSeat) {
      throw new BadRequestException(`Seat ${dto.newSeatNumber} not found on new bus`);
    }

    // Verify new seat is available on all segments of new trip
    for (const seg of newTrip.tripSegments) {
      const segSeat = await this.prisma.tripSegmentSeat.findUnique({
        where: {
          tripSegmentId_busSeatId: {
            tripSegmentId: seg.id,
            busSeatId: newSeat.id,
          },
        },
      });

      if (!segSeat || segSeat.status !== 'AVAILABLE') {
        throw new BadRequestException(`Seat ${dto.newSeatNumber} is not available on target trip`);
      }
    }

    const agentId = dto.agentId || currentUser?.userId;

    return this.prisma.$transaction(async (tx) => {
      // 1. Release old seat from old segments
      const oldSeat = booking.trip.bus.seats.find((s) => s.seatNumber === dto.oldSeatNumber);
      if (oldSeat) {
        const oldBookingSegments = await tx.bookingSegment.findMany({
          where: { bookingId: booking.id },
        });

        for (const bs of oldBookingSegments) {
          await tx.tripSegmentSeat.update({
            where: {
              tripSegmentId_busSeatId: {
                tripSegmentId: bs.tripSegmentId,
                busSeatId: oldSeat.id,
              },
            },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      // 2. Book new seat on new trip segments
      for (const seg of newTrip.tripSegments) {
        await tx.tripSegmentSeat.update({
          where: {
            tripSegmentId_busSeatId: {
              tripSegmentId: seg.id,
              busSeatId: newSeat.id,
            },
          },
          data: { status: 'BOOKED' },
        });
      }

      // 3. Update booking tripId and BookingSegments
      await tx.bookingSegment.deleteMany({ where: { bookingId: booking.id } });
      for (const seg of newTrip.tripSegments) {
        await tx.bookingSegment.create({
          data: { bookingId: booking.id, tripSegmentId: seg.id },
        });
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: { tripId: newTrip.id },
      });

      // 4. Update Ticket
      const targetTicket = booking.tickets.find((t) => t.seatNumber === dto.oldSeatNumber) || booking.tickets[0];
      const newQrHash = crypto
        .createHash('sha256')
        .update(`${targetTicket.ticketNumber}:${booking.bookingReference}:${dto.newSeatNumber}:${newTrip.id}`)
        .digest('hex');

      const updatedTicket = await tx.ticket.update({
        where: { id: targetTicket.id },
        data: {
          tripId: newTrip.id,
          seatNumber: dto.newSeatNumber,
          qrHash: newQrHash,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: agentId || null,
          action: 'BOOKING_RESCHEDULE',
          entityName: 'Booking',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            oldTripId: booking.tripId,
            newTripId: newTrip.id,
            oldSeat: dto.oldSeatNumber,
            newSeat: dto.newSeatNumber,
            reason: dto.reason || 'Customer request',
          }),
        },
      });

      return {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        rescheduledTicketNumber: updatedTicket.ticketNumber,
        newSeatNumber: dto.newSeatNumber,
        newDeparture: newTrip.scheduledDeparture,
      };
    });
  }

  private generateThermalReceiptText(params: any): string {
    const divider = '----------------------------------------';
    let text = '';
    text += `          ${params.companyName}          \n`;
    text += `       INTERCITY BUS TRANSPORTATION      \n`;
    text += `           TICKET RECEIPT (POS)          \n`;
    text += `${divider}\n`;
    text += `BOOKING REF : ${params.bookingReference}\n`;
    text += `DATE        : ${params.date} | ${params.time}\n`;
    text += `ROUTE       : ${params.origin} -> ${params.destination}\n`;
    text += `BUS PLATE   : ${params.busPlate}\n`;
    text += `AGENT       : ${params.agentName}\n`;
    text += `${divider}\n`;
    text += `PASSENGER(S) & SEATS:\n`;
    for (const t of params.tickets) {
      text += ` * Seat ${t.seatNumber.padEnd(4)} : ${t.passengerName} (${t.ticketNumber})\n`;
    }
    text += `${divider}\n`;
    text += `TOTAL FARE  : ETB ${params.totalAmount.toFixed(2)}\n`;
    text += `PAY METHOD  : ${params.paymentMethod}\n`;
    if (params.paymentMethod === 'CASH') {
      text += `CASH TENDER : ETB ${params.cashTendered.toFixed(2)}\n`;
      text += `CHANGE DUE  : ETB ${params.changeReturned.toFixed(2)}\n`;
    }
    text += `${divider}\n`;
    text += `      Scan QR Code on Door Boarding     \n`;
    text += `        Safe Travels with Abyssinia!    \n\n`;
    return text;
  }
}
