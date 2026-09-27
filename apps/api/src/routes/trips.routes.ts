import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateSeatLayout, BusType } from '@bus/shared';

const router = Router();

// GET /api/trips
router.get('/', async (req: Request, res: Response) => {
  try {
    const { originId, destinationId, date, status } = req.query;

    const whereClause: any = {};

    if (originId || destinationId) {
      whereClause.route = {};
      if (originId) whereClause.route.originStationId = String(originId);
      if (destinationId) whereClause.route.destinationStationId = String(destinationId);
    }

    if (status) {
      whereClause.status = String(status);
    }

    if (date) {
      const searchDate = new Date(String(date));
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

      whereClause.departureTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        },
        bus: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } },
          select: { id: true, seatNumber: true, status: true }
        }
      },
      orderBy: { departureTime: 'asc' }
    });

    const enrichedTrips = trips.map(t => ({
      id: t.id,
      tripCode: t.tripCode,
      route: t.route,
      bus: t.bus,
      driverName: t.driverName,
      driverPhone: t.driverPhone,
      conductorName: t.conductorName,
      conductorPhone: t.conductorPhone,
      departureTime: t.departureTime,
      estimatedArrivalTime: t.estimatedArrivalTime,
      fareETB: t.fareETB,
      status: t.status,
      totalSeats: t.bus.totalSeats,
      bookedSeatsCount: t.tickets.length,
      availableSeatsCount: Math.max(0, t.bus.totalSeats - t.tickets.length)
    }));

    return res.json(enrichedTrips);
  } catch (err: any) {
    console.error('Error fetching trips:', err);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// GET /api/trips/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        },
        bus: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Clean up expired locks first
    await prisma.seatLock.deleteMany({
      where: {
        tripId: id,
        expiresAt: { lt: new Date() }
      }
    });

    // Fetch active seat locks
    const activeLocks = await prisma.seatLock.findMany({
      where: {
        tripId: id,
        expiresAt: { gte: new Date() }
      }
    });

    const bookedSeatNumbers = trip.tickets.map(t => t.seatNumber);
    const lockedSeatNumbers = activeLocks.map(l => l.seatNumber);

    // Generate dynamic seat layout matrix using @bus/shared engine
    const seatLayout = generateSeatLayout({
      busType: trip.bus.busType as BusType,
      totalSeats: trip.bus.totalSeats,
      baseFareETB: trip.fareETB,
      bookedSeatNumbers,
      lockedSeatNumbers
    });

    // Map booked ticket info to seat details
    const ticketMap = new Map(trip.tickets.map(t => [t.seatNumber, t]));
    seatLayout.seats.forEach(s => {
      const ticket = ticketMap.get(s.seatNumber);
      if (ticket) {
        s.passengerName = ticket.passengerName;
        s.passengerPhone = ticket.passengerPhone;
      }
    });

    return res.json({
      trip: {
        id: trip.id,
        tripCode: trip.tripCode,
        route: trip.route,
        bus: trip.bus,
        driverName: trip.driverName,
        driverPhone: trip.driverPhone,
        conductorName: trip.conductorName,
        conductorPhone: trip.conductorPhone,
        departureTime: trip.departureTime,
        estimatedArrivalTime: trip.estimatedArrivalTime,
        fareETB: trip.fareETB,
        status: trip.status
      },
      seatLayout
    });
  } catch (err: any) {
    console.error('Error fetching trip details:', err);
    return res.status(500).json({ error: 'Failed to fetch trip details' });
  }
});

// POST /api/trips (Admin only)
router.post('/', requireAuth, requireRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const {
      tripCode,
      routeId,
      busId,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      departureTime,
      estimatedArrivalTime,
      fareETB
    } = req.body;

    const trip = await prisma.trip.create({
      data: {
        tripCode,
        routeId,
        busId,
        driverName,
        driverPhone,
        conductorName,
        conductorPhone,
        departureTime: new Date(departureTime),
        estimatedArrivalTime: new Date(estimatedArrivalTime),
        fareETB: Number(fareETB),
        status: 'SCHEDULED'
      }
    });

    return res.status(201).json(trip);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create trip' });
  }
});

// PATCH /api/trips/:id/status
router.patch('/:id/status', requireAuth, requireRole(['SUPER_ADMIN', 'DISPATCHER', 'CONDUCTOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid trip status' });
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: { status }
    });

    return res.json(trip);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update trip status' });
  }
});

export default router;
