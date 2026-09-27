import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { generateSeatLayout, BusType } from '@bus/shared';

const router = Router();

// GET /api/trips (List trips with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { originId, destinationId, date, status } = req.query;

    const whereClause: any = {};

    if (originId || destinationId) {
      whereClause.route = {};
      if (originId) whereClause.route.originStationId = String(originId);
      if (destinationId) whereClause.route.destinationStationId = String(destinationId);
    }

    if (status && status !== 'ALL') {
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

    const enrichedTrips = trips.map(t => {
      const bookedCount = t.tickets.length;
      const boardedCount = t.tickets.filter(tk => tk.status === 'BOARDED').length;
      const occupancyPercent = Math.round((bookedCount / (t.bus.totalSeats || 1)) * 100);

      return {
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
        bookedSeatsCount: bookedCount,
        boardedSeatsCount: boardedCount,
        availableSeatsCount: Math.max(0, t.bus.totalSeats - bookedCount),
        occupancyPercent
      };
    });

    return res.json(enrichedTrips);
  } catch (err: any) {
    console.error('Error fetching trips:', err);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// GET /api/trips/:id (Detailed trip with full seat layout matrix)
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

    // Clean up expired locks
    await prisma.seatLock.deleteMany({
      where: {
        tripId: id,
        expiresAt: { lt: new Date() }
      }
    });

    // Active seat locks
    const activeLocks = await prisma.seatLock.findMany({
      where: {
        tripId: id,
        expiresAt: { gte: new Date() }
      }
    });

    const bookedSeatNumbers = trip.tickets.map(t => t.seatNumber);
    const lockedSeatNumbers = activeLocks.map(l => l.seatNumber);

    const seatLayout = generateSeatLayout({
      busType: trip.bus.busType as BusType,
      totalSeats: trip.bus.totalSeats,
      baseFareETB: trip.fareETB,
      bookedSeatNumbers,
      lockedSeatNumbers
    });

    // Attach passenger info to seat layout for dispatchers/agents
    const ticketMap = new Map(trip.tickets.map(t => [t.seatNumber, t]));
    seatLayout.seats.forEach(s => {
      const ticket = ticketMap.get(s.seatNumber);
      if (ticket) {
        s.passengerName = ticket.passengerName;
        s.passengerPhone = ticket.passengerPhone;
        if (ticket.status === 'BOARDED') {
          s.status = 'BOARDED' as any;
        }
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

// POST /api/trips (Schedule new trip)
router.post('/', async (req: Request, res: Response) => {
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

    if (!routeId || !busId || !departureTime || !fareETB) {
      return res.status(400).json({ error: 'Missing required scheduling parameters' });
    }

    const generatedTripCode = tripCode || `ETB-${Date.now().toString().slice(-4)}`;

    const depDate = new Date(departureTime);
    const arrDate = estimatedArrivalTime ? new Date(estimatedArrivalTime) : new Date(depDate.getTime() + 5 * 3600 * 1000);

    const trip = await prisma.trip.create({
      data: {
        tripCode: generatedTripCode,
        routeId,
        busId,
        driverName: driverName || 'Assigned Driver',
        driverPhone: driverPhone || '+251 91 ...',
        conductorName: conductorName || 'Assigned Conductor',
        conductorPhone: conductorPhone || '+251 92 ...',
        departureTime: depDate,
        estimatedArrivalTime: arrDate,
        fareETB: Number(fareETB),
        status: 'SCHEDULED'
      },
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        },
        bus: true
      }
    });

    return res.status(201).json(trip);
  } catch (err: any) {
    console.error('Create trip error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create trip' });
  }
});

// PATCH /api/trips/:id/status (Trip lifecycle state transitions: SCHEDULED -> BOARDING -> DEPARTED -> IN_TRANSIT -> ARRIVED)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_TRANSIT', 'ARRIVED', 'CANCELLED', 'DELAYED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid trip status. Allowed: [${validStatuses.join(', ')}]` });
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: { status },
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        },
        bus: true
      }
    });

    return res.json({
      success: true,
      message: `Trip ${trip.tripCode} status updated to ${status}`,
      trip
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update trip status' });
  }
});

// PATCH /api/trips/:id/assign (Day 24 Dispatch: Management assigns/reassigns bus and driver)
router.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { busId, driverName, driverPhone, conductorName, conductorPhone } = req.body;

    const updateData: any = {};
    if (busId) updateData.busId = busId;
    if (driverName !== undefined) updateData.driverName = driverName;
    if (driverPhone !== undefined) updateData.driverPhone = driverPhone;
    if (conductorName !== undefined) updateData.conductorName = conductorName;
    if (conductorPhone !== undefined) updateData.conductorPhone = conductorPhone;

    const trip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        },
        bus: true
      }
    });

    return res.json({
      success: true,
      message: `Assignment updated for trip ${trip.tripCode}`,
      trip
    });
  } catch (err: any) {
    console.error('Assign trip error:', err);
    return res.status(500).json({ error: 'Failed to update trip assignment' });
  }
});

export default router;

