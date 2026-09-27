import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ScanTicketDto } from './dto/scan-ticket.dto';

@Injectable()
export class BoardingService {
  constructor(private readonly prisma: PrismaService) {}

  async scanTicket(dto: ScanTicketDto, currentUser?: any) {
    const raw = dto.qrPayload.trim();

    // Look up by qrHash or ticketNumber
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        OR: [{ qrHash: raw }, { ticketNumber: raw }],
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
        booking: true,
        boardings: {
          orderBy: { scannedAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return {
        valid: false,
        status: 'INVALID',
        message: 'No ticket found with this QR code or ticket number',
      };
    }

    if (ticket.status === 'CANCELLED') {
      return {
        valid: false,
        status: 'CANCELLED',
        message: 'Ticket has been cancelled and refunded',
        ticketNumber: ticket.ticketNumber,
        passengerName: ticket.passengerName,
      };
    }

    // Check if ticket already boarded
    if (ticket.status === 'BOARDED' || ticket.boardings.length > 0) {
      const lastBoarding = ticket.boardings[0];
      return {
        valid: false,
        status: 'DUPLICATE',
        message: `Ticket already scanned and boarded at ${lastBoarding.scannedAt.toLocaleTimeString()}`,
        ticketNumber: ticket.ticketNumber,
        passengerName: ticket.passengerName,
        seatNumber: ticket.seatNumber,
        boardedAt: lastBoarding.scannedAt,
      };
    }

    // Check trip mismatch if tripId supplied
    if (dto.currentTripId && ticket.tripId !== dto.currentTripId) {
      return {
        valid: false,
        status: 'WRONG_TRIP',
        message: `Ticket is for another trip: ${ticket.trip.route.originStop.name} -> ${ticket.trip.route.destinationStop.name}`,
        ticketNumber: ticket.ticketNumber,
        passengerName: ticket.passengerName,
      };
    }

    const conductorId = dto.conductorId || currentUser?.userId;

    // Approve boarding transactionally
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'BOARDED',
          boardedAt: now,
        },
      }),
      this.prisma.boarding.create({
        data: {
          ticketId: ticket.id,
          tripId: ticket.tripId,
          conductorId: conductorId || null,
          scannedAt: now,
          terminalLocation: dto.terminalLocation || ticket.boardingTerminal || 'Autobis Tera Gate #1',
          status: 'APPROVED',
        },
      }),
    ]);

    return {
      valid: true,
      status: 'APPROVED',
      message: 'Boarding verified successfully',
      ticketNumber: ticket.ticketNumber,
      passengerName: ticket.passengerName,
      passengerPhone: ticket.passengerPhone,
      passengerIdNumber: ticket.passengerIdNumber,
      seatNumber: ticket.seatNumber,
      busPlate: ticket.trip.bus.plateNumber,
      route: `${ticket.trip.route.originStop.name} -> ${ticket.trip.route.destinationStop.name}`,
      boardedAt: now,
    };
  }

  async getTripManifest(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: {
          include: { originStop: true, destinationStop: true },
        },
        bus: true,
        tickets: {
          include: { boardings: true },
          orderBy: { seatNumber: 'asc' },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }

    const totalIssued = trip.tickets.filter((t) => t.status !== 'CANCELLED').length;
    const totalBoarded = trip.tickets.filter((t) => t.status === 'BOARDED').length;

    return {
      tripId: trip.id,
      route: `${trip.route.originStop.name} -> ${trip.route.destinationStop.name}`,
      departure: trip.scheduledDeparture,
      busPlate: trip.bus.plateNumber,
      capacity: trip.bus.totalSeats,
      totalIssued,
      totalBoarded,
      occupancyPercent: Math.round((totalIssued / trip.bus.totalSeats) * 100),
      passengers: trip.tickets.map((t) => ({
        ticketNumber: t.ticketNumber,
        seatNumber: t.seatNumber,
        passengerName: t.passengerName,
        passengerPhone: t.passengerPhone,
        passengerIdNumber: t.passengerIdNumber,
        status: t.status,
        boardedAt: t.boardedAt,
      })),
    };
  }
}
