import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTrip(dto: CreateTripDto, companyId: string) {
    const route = await this.prisma.route.findFirst({
      where: {
        id: dto.routeId,
        companyId,
        status: 'ACTIVE',
      },
      include: {
        routeStops: {
          orderBy: {
            sequenceNumber: 'asc',
          },
          include: {
            stop: true,
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    const bus = await this.prisma.bus.findFirst({
      where: {
        id: dto.busId,
        companyId,
        status: {
          in: ['AVAILABLE', 'ASSIGNED'],
        },
      },
      include: {
        seats: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });

    if (!bus) {
      throw new NotFoundException('Bus not found or unavailable');
    }

    if (bus.seats.length === 0) {
      throw new BadRequestException(
        'Bus has no available seats configured',
      );
    }

    const departure = new Date(dto.scheduledDeparture);

    const conflictingTrip = await this.prisma.trip.findFirst({
      where: {
        companyId,
        busId: dto.busId,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
        scheduledDeparture: {
          gte: new Date(departure.getTime() - 12 * 60 * 60 * 1000),
          lte: new Date(departure.getTime() + 12 * 60 * 60 * 1000),
        },
      },
    });

    if (conflictingTrip) {
      throw new BadRequestException(
        'Bus already has a conflicting trip',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          companyId,
          routeId: dto.routeId,
          scheduleId: dto.scheduleId,
          busId: dto.busId,
          tripDate: new Date(dto.tripDate),
          scheduledDeparture: departure,
          scheduledArrival: dto.scheduledArrival
            ? new Date(dto.scheduledArrival)
            : null,
          price: dto.price,
          status: 'SCHEDULED',
        },
      });

      // Create consecutive route segments.
      const segments = [];

      for (let i = 0; i < route.routeStops.length - 1; i++) {
        const current = route.routeStops[i];
        const next = route.routeStops[i + 1];

        const segment = await tx.tripSegment.create({
          data: {
            tripId: trip.id,
            fromStopId: current.stopId,
            toStopId: next.stopId,
            sequenceNumber: i + 1,
          },
        });

        segments.push(segment);
      }

      // Create seat inventory for every trip segment.
      for (const segment of segments) {
        await tx.tripSegmentSeat.createMany({
          data: bus.seats.map((seat) => ({
            tripSegmentId: segment.id,
            busSeatId: seat.id,
            status: 'AVAILABLE',
          })),
        });
      }

      return tx.trip.findUnique({
        where: { id: trip.id },
        include: {
          route: true,
          bus: true,
          tripSegments: {
            orderBy: {
              sequenceNumber: 'asc',
            },
            include: {
              fromStop: true,
              toStop: true,
            },
          },
        },
      });
    });
  }

  async getAvailableSeats(
    tripId: string,
    fromStopId: string,
    toStopId: string,
  ) {
    const segments = await this.prisma.tripSegment.findMany({
      where: {
        tripId,
      },
      orderBy: {
        sequenceNumber: 'asc',
      },
    });

    const fromIndex = segments.findIndex(
      (s) => s.fromStopId === fromStopId,
    );

    const toIndex = segments.findIndex(
      (s) => s.toStopId === toStopId,
    );

    if (
      fromIndex === -1 ||
      toIndex === -1 ||
      fromIndex > toIndex
    ) {
      throw new BadRequestException(
        'Invalid journey segment',
      );
    }

    const requiredSegments = segments.filter(
      (_, index) =>
        index >= fromIndex && index <= toIndex,
    );

    const seatRows =
      await this.prisma.tripSegmentSeat.findMany({
        where: {
          tripSegmentId: {
            in: requiredSegments.map((s) => s.id),
          },
        },
        include: {
          busSeat: true,
        },
      });

    const grouped = new Map<
      string,
      typeof seatRows
    >();

    for (const row of seatRows) {
      const existing = grouped.get(row.busSeatId) ?? [];
      existing.push(row);
      grouped.set(row.busSeatId, existing);
    }

    return [...grouped.values()]
      .filter((seatRows) =>
        seatRows.every(
          (seat) => seat.status === 'AVAILABLE',
        ),
      )
      .map((rows) => rows[0].busSeat);
  }

  async getAllTrips(companyId?: string) {
    return this.prisma.trip.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        route: {
          include: {
            originStop: true,
            destinationStop: true,
          },
        },
        bus: true,
        tripSegments: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            fromStop: true,
            toStop: true,
          },
        },
      },
      orderBy: { scheduledDeparture: 'asc' },
    });
  }

  async getTripById(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: {
          include: {
            originStop: true,
            destinationStop: true,
            routeStops: {
              orderBy: { sequenceNumber: 'asc' },
              include: { stop: true },
            },
          },
        },
        bus: {
          include: {
            seats: true,
          },
        },
        tripSegments: {
          orderBy: { sequenceNumber: 'asc' },
          include: {
            fromStop: true,
            toStop: true,
            seats: {
              include: { busSeat: true },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }

    return trip;
  }

  async searchTrips(from?: string, to?: string, date?: string, companyId?: string) {
    let dateFilter: any = undefined;
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const trips = await this.prisma.trip.findMany({
      where: {
        companyId: companyId || undefined,
        scheduledDeparture: dateFilter,
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
      },
      include: {
        route: {
          include: {
            originStop: true,
            destinationStop: true,
            routeStops: {
              orderBy: { sequenceNumber: 'asc' },
              include: { stop: true },
            },
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
            seats: true,
          },
        },
      },
      orderBy: { scheduledDeparture: 'asc' },
    });

    const results = [];
    for (const trip of trips) {
      let isMatch = true;
      let fromIdx = -1;
      let toIdx = -1;

      if (from || to) {
        fromIdx = trip.tripSegments.findIndex((seg) => {
          if (!from) return true;
          const target = from.toUpperCase().trim();
          return (
            seg.fromStopId === from ||
            seg.fromStop.code.toUpperCase() === target ||
            seg.fromStop.name.toUpperCase().includes(target)
          );
        });

        toIdx = trip.tripSegments.findIndex((seg) => {
          if (!to) return true;
          const target = to.toUpperCase().trim();
          return (
            seg.toStopId === to ||
            seg.toStop.code.toUpperCase() === target ||
            seg.toStop.name.toUpperCase().includes(target)
          );
        });

        if (from && fromIdx === -1) isMatch = false;
        if (to && toIdx === -1) isMatch = false;
        if (from && to && fromIdx > toIdx) isMatch = false;
      }

      if (!isMatch) continue;

      const traversed =
        fromIdx !== -1 && toIdx !== -1
          ? trip.tripSegments.slice(fromIdx, toIdx + 1)
          : trip.tripSegments;

      let minAvailable = trip.bus.totalSeats;
      if (traversed.length > 0) {
        minAvailable = traversed.reduce((min, seg) => {
          const avail = seg.seats.filter((s) => s.status === 'AVAILABLE').length;
          return Math.min(min, avail);
        }, trip.bus.totalSeats);
      }

      const depDate = trip.scheduledDeparture;
      const depTimeStr = depDate
        ? depDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : '05:00';
      const arrDate =
        trip.scheduledArrival ||
        new Date(depDate.getTime() + 9 * 60 * 60 * 1000);
      const arrTimeStr = arrDate
        ? arrDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : '14:00';

      results.push({
        id: trip.id,
        routeId: trip.routeId,
        routeCode: trip.route.routeCode,
        origin: trip.route.originStop.name,
        originCode: trip.route.originStop.code,
        destination: trip.route.destinationStop.name,
        destinationCode: trip.route.destinationStop.code,
        departure: depTimeStr,
        arrival: arrTimeStr,
        departureTime: trip.scheduledDeparture,
        arrivalTime: trip.scheduledArrival,
        price: trip.price,
        availableSeats: minAvailable,
        totalSeats: trip.bus.totalSeats,
        busPlate: trip.bus.plateNumber,
        busSideNumber: trip.bus.sideNumber,
        busType: trip.bus.busType,
        amenities: trip.bus.amenities
          ? trip.bus.amenities.split(',')
          : ['AC', 'WiFi'],
      });
    }

    return results;
  }
}
