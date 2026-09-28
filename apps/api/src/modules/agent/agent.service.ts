import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class AgentService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayTrips(companyId?: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2); // Today + Tomorrow departures

    const trips = await this.prisma.trip.findMany({
      where: {
        scheduledDeparture: {
          gte: today,
          lte: tomorrow,
        },
        status: { notIn: ['CANCELLED'] },
        companyId: companyId || undefined,
      },
      include: {
        route: {
          include: { originStop: true, destinationStop: true },
        },
        bus: {
          include: { seats: true },
        },
        tripSegments: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            fromStop: true,
            toStop: true,
            seats: {
              where: { status: 'AVAILABLE' },
            },
          },
        },
      },
      orderBy: { scheduledDeparture: 'asc' },
    });

    return trips.map((trip) => {
      // Calculate available seats across first segment or entire route
      const minAvailableSeats = trip.tripSegments.reduce((min, seg) => {
        return Math.min(min, seg.seats.length);
      }, trip.bus.totalSeats);

      return {
        id: trip.id,
        routeCode: trip.route.routeCode,
        origin: trip.route.originStop.name,
        originCode: trip.route.originStop.code,
        destination: trip.route.destinationStop.name,
        destinationCode: trip.route.destinationStop.code,
        departureTime: trip.scheduledDeparture,
        arrivalTime: trip.scheduledArrival,
        price: trip.price,
        busPlate: trip.bus.plateNumber,
        busSideNumber: trip.bus.sideNumber,
        busModel: trip.bus.busModel,
        busType: trip.bus.busType,
        totalSeats: trip.bus.totalSeats,
        availableSeats: minAvailableSeats,
        status: trip.status,
      };
    });
  }

  async getAgentDailySales(agentId?: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: today },
        bookedByUserId: agentId || undefined,
        branchId: branchId || undefined,
      },
      include: {
        payments: true,
        passengers: true,
        tickets: true,
      },
    });

    let ticketsSold = 0;
    let passengersCount = 0;
    let cashSales = 0;
    let digitalSales = 0;
    let refunds = 0;

    for (const b of bookings) {
      if (b.paymentStatus === 'REFUNDED') {
        refunds += b.totalAmountETB;
      } else {
        ticketsSold += b.tickets.length;
        passengersCount += b.passengers.length;

        for (const p of b.payments) {
          if (p.paymentMethod === 'CASH') {
            cashSales += p.amountETB;
          } else {
            digitalSales += p.amountETB;
          }
        }
      }
    }

    const netRevenue = cashSales + digitalSales - refunds;

    return {
      date: today.toISOString().slice(0, 10),
      ticketsSold,
      passengersCount,
      cashRevenueETB: cashSales,
      digitalRevenueETB: digitalSales,
      refundsETB: refunds,
      netRevenueETB: netRevenue,
      bookingsCount: bookings.length,
    };
  }

  async getBranchSettlement(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    const shifts = await this.prisma.cashShift.findMany({
      where: {
        branchId,
        openedAt: { gte: today },
      },
      include: { agent: true },
    });

    let totalOpeningCash = 0;
    let totalCashSales = 0;
    let totalRefunds = 0;
    let totalTickets = 0;

    for (const s of shifts) {
      totalOpeningCash += s.openingCashETB;
      totalCashSales += s.cashSalesETB;
      totalRefunds += s.refundsETB;
      totalTickets += s.ticketsCount;
    }

    const expectedCashInBranch = totalOpeningCash + totalCashSales - totalRefunds;

    return {
      branchName: branch?.nameEn || 'Main Branch',
      date: today.toISOString().slice(0, 10),
      activeAgentsOnline: shifts.filter((s) => s.status === 'OPEN').length,
      totalShiftsRun: shifts.length,
      totalTicketsSold: totalTickets,
      openingFloatETB: totalOpeningCash,
      cashCollectedETB: totalCashSales,
      refundsPaidETB: totalRefunds,
      expectedCashDrawerETB: expectedCashInBranch,
      shifts: shifts.map((s) => ({
        shiftId: s.id,
        agentName: s.agent.fullName,
        status: s.status,
        openingCash: s.openingCashETB,
        cashSales: s.cashSalesETB,
        refunds: s.refundsETB,
        tickets: s.ticketsCount,
      })),
    };
  }

  async searchPassengers(query: string) {
    const q = query.trim();
    if (!q) return [];

    return this.prisma.passenger.findMany({
      where: {
        OR: [
          { fullName: { contains: q } },
          { phone: { contains: q } },
          { nationalIdNumber: { contains: q } },
        ],
      },
      take: 15,
    });
  }

  async getTripSeats(tripId: string, fromStopId?: string, toStopId?: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: {
          include: { originStop: true, destinationStop: true },
        },
        bus: {
          include: { seats: true },
        },
        tripSegments: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            fromStop: true,
            toStop: true,
            seats: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip "${tripId}" not found`);
    }

    const segments = trip.tripSegments;
    let traversedSegments = segments;

    if (fromStopId && toStopId) {
      const targetFrom = fromStopId.toUpperCase().trim();
      const targetTo = toStopId.toUpperCase().trim();

      const fromIndex = segments.findIndex(
        (s) =>
          s.fromStopId === fromStopId ||
          s.fromStop?.code?.toUpperCase() === targetFrom ||
          s.fromStopId === `stop_${targetFrom}`,
      );
      const toIndex = segments.findIndex(
        (s) =>
          s.toStopId === toStopId ||
          s.toStop?.code?.toUpperCase() === targetTo ||
          s.toStopId === `stop_${targetTo}`,
      );

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex <= toIndex) {
        traversedSegments = segments.slice(fromIndex, toIndex + 1);
      }
    }

    const now = new Date();
    const seats = trip.bus.seats.map((seat) => {
      let status: 'AVAILABLE' | 'HELD' | 'CONFIRMED' | 'BLOCKED' = 'AVAILABLE';
      let heldExpiresAt: Date | null = null;
      let reservationId: string | null = null;

      for (const seg of traversedSegments) {
        const segSeat = seg.seats.find((s: any) => s.busSeatId === seat.id);
        if (!segSeat) continue;

        if (segSeat.status === 'BLOCKED') {
          status = 'BLOCKED';
          break;
        } else if (
          segSeat.status === 'BOOKED' ||
          segSeat.status === 'CONFIRMED'
        ) {
          status = 'CONFIRMED';
          break;
        } else if (segSeat.status === 'HELD') {
          if (segSeat.heldUntil && new Date(segSeat.heldUntil) > now) {
            status = 'HELD';
            heldExpiresAt = segSeat.heldUntil;
            reservationId = segSeat.reservationId;
          }
        }
      }

      return {
        id: seat.id,
        seatNumber: seat.seatNumber,
        row: (seat as any).rowNumber ?? (seat as any).row ?? (parseInt(seat.seatNumber.slice(0, -1), 10) || 1),
        column: (seat as any).columnNumber ?? (seat as any).columnLetter ?? (seat.seatNumber.slice(-1) || 'A'),
        deck: (seat as any).deckNumber || 1,
        seatType: (seat as any).seatType || 'STANDARD',
        status,
        price: trip.price,
        heldExpiresAt,
        reservationId,
      };
    });

    const availableSeatsCount = seats.filter(
      (s) => s.status === 'AVAILABLE',
    ).length;
    const heldSeatsCount = seats.filter((s) => s.status === 'HELD').length;
    const confirmedSeatsCount = seats.filter(
      (s) => s.status === 'CONFIRMED',
    ).length;
    const blockedSeatsCount = seats.filter(
      (s) => s.status === 'BLOCKED',
    ).length;

    return {
      tripId: trip.id,
      routeCode: trip.route.routeCode,
      origin: trip.route.originStop.name,
      destination: trip.route.destinationStop.name,
      scheduledDeparture: trip.scheduledDeparture,
      busPlate: trip.bus.plateNumber,
      busModel: trip.bus.busModel,
      totalSeats: trip.bus.totalSeats,
      summary: {
        total: trip.bus.totalSeats,
        available: availableSeatsCount,
        held: heldSeatsCount,
        confirmed: confirmedSeatsCount,
        blocked: blockedSeatsCount,
      },
      seats,
    };
  }
}
