import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/database/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { FareRulesService } from '../pricing/fare-rules.service';
import { DiscountService } from '../pricing/discount.service';
import { PaymentsService } from '../payments/payments.service';
import { CancelBookingDto, RescheduleBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService = new PricingService(
      new FareRulesService(),
      new DiscountService(),
    ),
    private readonly paymentsService?: PaymentsService,
  ) {}

  async createBooking(dto: CreateBookingDto, currentUser?: any) {
    let trip: any;
    let traversedSegments: any[] = [];
    let reservation: any = null;

    // 1. Resolve Trip and Journey: Either from verified atomic Reservation or Direct Request
    if (dto.reservationId) {
      reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
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
          seats: {
            include: {
              busSeat: true,
              tripSegment: {
                include: { fromStop: true, toStop: true },
              },
            },
          },
        },
      });

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (reservation.status !== 'ACTIVE') {
        throw new BadRequestException('Reservation is no longer active');
      }

      if (reservation.expiresAt <= new Date()) {
        throw new BadRequestException('Reservation has expired');
      }

      trip = reservation.trip;

      // Group reserved segment seats by busSeat
      const reservedBusSeatMap = new Map<string, any>();
      for (const s of reservation.seats) {
        const busSeat =
          s.busSeat ||
          trip.bus?.seats?.find((bs: any) => bs.id === s.busSeatId);
        reservedBusSeatMap.set(s.busSeatId, busSeat || { id: s.busSeatId });
        if (s.busSeatId && s.busSeatId.startsWith('seat_')) {
          reservedBusSeatMap.set(
            s.busSeatId.replace('seat_', ''),
            busSeat || { id: s.busSeatId },
          );
        }
        if (busSeat?.seatNumber) {
          reservedBusSeatMap.set(busSeat.seatNumber, busSeat);
        }
      }
      const distinctReservedBusSeatCount = new Set(
        reservation.seats.map((s: any) => s.busSeatId),
      ).size;

      if (distinctReservedBusSeatCount !== dto.passengers.length) {
        throw new BadRequestException(
          'Passenger count does not match reserved seats',
        );
      }

      for (const p of dto.passengers) {
        const key = p.seatId || p.seatNumber;
        const matches =
          key &&
          (reservedBusSeatMap.has(key) ||
            reservedBusSeatMap.has(`seat_${key}`) ||
            (key.startsWith('seat_') &&
              reservedBusSeatMap.has(key.replace('seat_', ''))));
        if (!matches) {
          throw new BadRequestException(
            `Seat ${key || 'unknown'} is not part of this reservation`,
          );
        }
      }

      const allTripSegments =
        trip.tripSegments ||
        (this.prisma.tripSegment?.findMany
          ? await this.prisma.tripSegment.findMany({
              where: { tripId: trip.id },
            })
          : []);
      trip.tripSegments = allTripSegments;

      if (!trip.bus?.seats && this.prisma.seat?.findMany) {
        const busSeats = await this.prisma.seat.findMany({
          where: { busId: trip.busId },
        });
        trip.bus = { ...trip.bus, seats: busSeats };
      }

      const reservedSegmentIdSet = new Set(
        reservation.seats.map((s: any) => s.tripSegmentId),
      );
      traversedSegments = allTripSegments.filter((s: any) =>
        reservedSegmentIdSet.has(s.id),
      );
      if (traversedSegments.length === 0) {
        traversedSegments = allTripSegments;
      }
    } else {
      if (!dto.tripId || !dto.fromStopId || !dto.toStopId) {
        throw new BadRequestException(
          'tripId, fromStopId, and toStopId are required when reservationId is not provided',
        );
      }

      trip = await this.prisma.trip.findUnique({
        where: { id: dto.tripId },
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
      });

      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      const targetFrom = dto.fromStopId.toUpperCase().trim();
      const targetTo = dto.toStopId.toUpperCase().trim();

      const fromIndex = trip.tripSegments.findIndex(
        (s: any) =>
          s.fromStopId === dto.fromStopId ||
          s.fromStop?.code?.toUpperCase() === targetFrom ||
          s.fromStopId === `stop_${targetFrom}`,
      );
      const toIndex = trip.tripSegments.findIndex(
        (s: any) =>
          s.toStopId === dto.toStopId ||
          s.toStop?.code?.toUpperCase() === targetTo ||
          s.toStopId === `stop_${targetTo}`,
      );

      if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
        throw new BadRequestException('Invalid journey stop sequence');
      }

      traversedSegments = trip.tripSegments.filter(
        (_: any, idx: number) => idx >= fromIndex && idx <= toIndex,
      );
    }

    // 2. Authoritative Server-Side Fare Calculation (Never trust price from Flutter or client)
    const pricing = this.pricingService.calculatePricing({
      baseTripPrice: trip.price,
      totalRouteSegments: trip.tripSegments.length,
      traversedSegmentsCount: traversedSegments.length,
      passengersCount: dto.passengers.length,
      seatIds: dto.passengers.map((p) => p.seatId || p.seatNumber || ''),
      busType: trip.bus?.busType,
      promoCode: dto.promoCode,
    });

    const subtotal = pricing.subtotal;
    const discount = pricing.discount;
    const fees = pricing.fees;
    const totalAmount = pricing.total;

    const channel =
      dto.channel || (dto.reservationId ? 'PASSENGER_APP' : 'COUNTER');
    const paymentMethod = (
      dto.paymentMethod || (channel === 'COUNTER' ? 'CASH' : 'TELEBIRR')
    )
      .toUpperCase()
      .trim();
    const isInstantCounterCash =
      channel === 'COUNTER' && paymentMethod === 'CASH';
    const isInstantPayment =
      isInstantCounterCash ||
      !this.paymentsService ||
      (dto as any).autoConfirm === true;
    const cashTendered = dto.cashTenderedETB ?? totalAmount;
    const changeReturned = Math.max(0, cashTendered - totalAmount);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingReference = `BK-${dateStr}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const agentId = dto.agentId || currentUser?.userId;
    const branchId = dto.branchId || currentUser?.branchId;

    // 3. Database Transaction: Atomic Seat State Transition & Booking Record Creation
    const txResult = await this.prisma.$transaction(async (tx) => {
      // Step A: Verify seat availability or hold validity on each traversed segment
      for (const passenger of dto.passengers) {
        const physicalSeat =
          trip.bus?.seats?.find(
            (s: any) =>
              s.id === passenger.seatId ||
              s.seatNumber === passenger.seatNumber ||
              s.seatNumber === passenger.seatId ||
              s.id === passenger.seatNumber ||
              (passenger.seatNumber && s.id === `seat_${passenger.seatNumber}`),
          ) || {
            id: passenger.seatId || `seat_${passenger.seatNumber}`,
            seatNumber:
              passenger.seatNumber ||
              passenger.seatId?.replace('seat_', '') ||
              '12A',
          };

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
            throw new BadRequestException(
              `Seat ${passenger.seatNumber || passenger.seatId} not configured on segment`,
            );
          }

          if (dto.reservationId) {
            if (
              segSeat.status !== 'HELD' ||
              segSeat.reservationId !== dto.reservationId
            ) {
              throw new BadRequestException(
                `Seat ${passenger.seatNumber || passenger.seatId} reservation has expired or is invalid`,
              );
            }
          } else {
            if (segSeat.status !== 'AVAILABLE') {
              throw new BadRequestException(
                `Seat ${passenger.seatNumber || passenger.seatId} is no longer available`,
              );
            }
          }
        }
      }

      // Step B: Resolve Customer Information
      const firstPassenger = dto.passengers[0];
      const firstPFullName =
        `${firstPassenger.firstName || ''} ${firstPassenger.lastName || ''}`.trim() ||
        firstPassenger.passengerName ||
        'Valued Passenger';
      const firstPPhone =
        firstPassenger.passengerPhone ||
        firstPassenger.phone ||
        '+251900000000';
      const customerName = dto.customerName || firstPFullName;
      const customerPhone = dto.customerPhone || firstPPhone;
      const customerEmail = dto.customerEmail || firstPassenger.email || null;

      // Step C: Create Master Booking Record
      const booking = await tx.booking.create({
        data: {
          bookingReference,
          tripId: trip.id,
          reservationId: dto.reservationId || null,
          customerName,
          customerPhone,
          customerEmail,
          channel,
          bookedByUserId: agentId || null,
          bookedByRole:
            currentUser?.role ||
            (channel === 'COUNTER' ? 'TICKET_AGENT' : 'PASSENGER'),
          branchId: branchId || null,
          subtotalETB: subtotal,
          discountETB: discount,
          feesETB: fees,
          totalAmountETB: totalAmount,
          currency: 'ETB',
          paymentStatus: isInstantPayment ? 'COMPLETED' : 'PAYMENT_PENDING',
        },
      });

      // Step D: Create Passenger Records and Conditionally Issue Tickets
      const createdTickets: any[] = [];

      for (const passenger of dto.passengers) {
        const physicalSeat =
          trip.bus?.seats?.find(
            (s: any) =>
              s.id === passenger.seatId ||
              s.seatNumber === passenger.seatNumber ||
              s.seatNumber === passenger.seatId ||
              s.id === passenger.seatNumber ||
              (passenger.seatNumber && s.id === `seat_${passenger.seatNumber}`),
          ) || {
            id: passenger.seatId || `seat_${passenger.seatNumber}`,
            seatNumber:
              passenger.seatNumber ||
              passenger.seatId?.replace('seat_', '') ||
              '12A',
          };

        const pName =
          `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() ||
          passenger.passengerName ||
          customerName;
        const pPhone =
          passenger.passengerPhone || passenger.phone || customerPhone;
        const pIdNum =
          passenger.passengerIdNumber || passenger.passportNumber || 'N/A';
        const pFare =
          pricing.seatPrices[passenger.seatId || ''] ??
          totalAmount / dto.passengers.length;

        // Upsert Passenger Registry
        let passengerRecord = await tx.passenger.findUnique({
          where: { phone: pPhone },
        });

        if (!passengerRecord) {
          passengerRecord = await tx.passenger.create({
            data: {
              fullName: pName,
              phone: pPhone,
              nationalIdNumber: pIdNum !== 'N/A' ? pIdNum : null,
            },
          });
        }

        const bookingPassenger = await tx.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            passengerId: passengerRecord.id,
            seatNumber: physicalSeat.seatNumber,
            passengerName: pName,
            passengerPhone: pPhone,
            passengerIdNumber: pIdNum,
            passportNumber: passenger.passportNumber || null,
            fareETB: pFare,
          },
        });

        if (isInstantPayment) {
          const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
          const qrToken = `ABY-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
          const qrHash = crypto
            .createHash('sha256')
            .update(
              `${ticketNumber}:${booking.bookingReference}:${physicalSeat.seatNumber}:${trip.id}`,
            )
            .digest('hex');

          const ticket = await tx.ticket.create({
            data: {
              ticketNumber,
              bookingId: booking.id,
              bookingPassengerId: bookingPassenger.id,
              tripId: trip.id,
              seatNumber: physicalSeat.seatNumber,
              passengerName: pName,
              passengerPhone: pPhone,
              passengerIdNumber: pIdNum,
              fareETB: pFare,
              qrHash,
              qrToken,
              status: 'ISSUED',
              boardingTerminal:
                traversedSegments[0]?.fromStop?.name ||
                trip.route?.originStop?.name ||
                'Addis Ababa Central Terminal',
              dropoffTerminal:
                traversedSegments[traversedSegments.length - 1]?.toStop?.name ||
                trip.route?.destinationStop?.name ||
                'Bahir Dar Terminal',
            },
          });

          createdTickets.push(ticket);

          // Update Segment Seats to BOOKED
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
        } else {
          // Online flow awaiting payment: Transition seats from HELD to PAYMENT_PENDING
          for (const seg of traversedSegments) {
            await tx.tripSegmentSeat.update({
              where: {
                tripSegmentId_busSeatId: {
                  tripSegmentId: seg.id,
                  busSeatId: physicalSeat.id,
                },
              },
              data: {
                status: 'PAYMENT_PENDING',
                reservationId: null,
                heldUntil: null,
              },
            });
          }
        }
      }

      // Step E: Link Booking to Traversed Segments
      for (const seg of traversedSegments) {
        await tx.bookingSegment.create({
          data: {
            bookingId: booking.id,
            tripSegmentId: seg.id,
          },
        });
      }

      // Step F: Convert Reservation State
      if (dto.reservationId) {
        await tx.reservation.update({
          where: { id: dto.reservationId },
          data: { status: 'CONVERTED' },
        });
      }

      // Step G: Create Payment Record
      const paymentRef = `PAY-${dateStr}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          paymentReference: paymentRef,
          amountETB: totalAmount,
          currency: 'ETB',
          provider: paymentMethod === 'CASH' ? 'LOCAL_CASH' : paymentMethod,
          paymentMethod,
          transactionReference: dto.transactionReference || null,
          cashTenderedETB: isInstantCounterCash ? cashTendered : null,
          changeReturnedETB: isInstantCounterCash ? changeReturned : null,
          status: isInstantPayment ? 'COMPLETED' : 'PENDING',
          paidAt: new Date(),
        },
      });

      // Step H: Update Agent Cash Shift if active
      if (agentId && isInstantCounterCash) {
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
              cashSalesETB: { increment: totalAmount },
              ticketsCount: { increment: dto.passengers.length },
            },
          });
        }
      }

      // Step I: Audit Log
      await tx.auditLog.create({
        data: {
          userId: agentId || null,
          action: 'BOOKING_CREATE',
          entityName: 'Booking',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            bookingReference,
            totalAmount,
            subtotal,
            discount,
            fees,
            passengersCount: dto.passengers.length,
            method: paymentMethod,
            channel,
          }),
        },
      });

      // Step J: Generate Thermal Receipt if Counter Cash
      let thermalReceipt: string | undefined = undefined;
      if (isInstantCounterCash) {
        thermalReceipt = this.generateThermalReceiptText({
          companyName: 'Abyssinia Bus S.C.',
          bookingReference,
          date: trip.scheduledDeparture.toISOString().slice(0, 10),
          time: trip.scheduledDeparture.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          origin:
            traversedSegments[0]?.fromStop?.name ||
            'Addis Ababa Central Terminal',
          destination:
            traversedSegments[traversedSegments.length - 1]?.toStop?.name ||
            'Bahir Dar Terminal',
          busPlate: trip.bus?.plateNumber || '3-A99102 ET',
          tickets: createdTickets,
          totalAmount,
          paymentMethod,
          cashTendered,
          changeReturned,
          agentName: currentUser?.fullName || 'Counter Agent',
        });
      }

      return {
        booking,
        payment,
        createdTickets,
        thermalReceipt,
      };
    });

    // 4. Payment Gateway Interaction (Occurs OUTSIDE the Database Transaction)
    let initiatedPayment: any = null;
    if (!isInstantPayment && this.paymentsService) {
      try {
        const provider = this.paymentsService.getProvider(paymentMethod);
        const initResult = await provider.initiatePayment({
          bookingId: txResult.booking.id,
          bookingReference: txResult.booking.bookingReference,
          amount: totalAmount,
          currency: 'ETB',
          customerPhone: txResult.booking.customerPhone,
          customerName: txResult.booking.customerName,
          customerEmail: txResult.booking.customerEmail || undefined,
        });

        await this.prisma.payment.update({
          where: { id: txResult.payment.id },
          data: {
            paymentReference:
              initResult.paymentReference ||
              txResult.payment.paymentReference,
            transactionReference: initResult.providerTxId || null,
          },
        });

        initiatedPayment = {
          paymentId: txResult.payment.id,
          paymentReference:
            initResult.paymentReference ||
            txResult.payment.paymentReference,
          status: 'PENDING',
          checkoutUrl: initResult.checkoutUrl,
          provider: provider.providerName,
          amount: totalAmount,
        };
      } catch (err: any) {
        initiatedPayment = {
          paymentId: txResult.payment.id,
          paymentReference: txResult.payment.paymentReference,
          status: 'PENDING',
          checkoutUrl: null,
          provider: paymentMethod,
          amount: totalAmount,
        };
      }
    }

    return {
      bookingId: txResult.booking.id,
      bookingReference: txResult.booking.bookingReference,
      status: txResult.booking.paymentStatus,
      channel: txResult.booking.channel,
      subtotalETB: txResult.booking.subtotalETB,
      discountETB: txResult.booking.discountETB,
      feesETB: txResult.booking.feesETB,
      totalAmountETB: txResult.booking.totalAmountETB,
      currency: txResult.booking.currency,
      payment: initiatedPayment || {
        paymentId: txResult.payment.id,
        paymentReference: txResult.payment.paymentReference,
        status: txResult.payment.status,
        amount: txResult.payment.amountETB,
      },
      tickets: txResult.createdTickets,
      cashTenderedETB: txResult.payment.cashTenderedETB,
      changeReturnedETB: txResult.payment.changeReturnedETB,
      thermalReceipt: txResult.thermalReceipt,
    };
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
