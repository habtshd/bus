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

// GET /api/trips/:id/inspection (Section 6: The Most Important Database Relationship)
// ROUTE -> TRIP -> BUS -> SEAT INVENTORY -> BOOKING -> PAYMENT -> TICKET -> BOARDING
router.get('/:id/inspection', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true,
            stops: { include: { station: true }, orderBy: { stopOrder: 'asc' } }
          }
        },
        bus: true,
        tickets: {
          include: {
            boardings: true,
            booking: {
              include: { payments: true }
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const totalSeats = trip.bus.totalSeats || 45;
    const activeTickets = trip.tickets.filter(t => t.status !== 'CANCELLED');
    const cancelledTickets = trip.tickets.filter(t => t.status === 'CANCELLED');
    const boardedTickets = trip.tickets.filter(t => t.status === 'BOARDED');
    const bookedCount = activeTickets.length;
    const availableCount = Math.max(0, totalSeats - bookedCount);

    // Group tickets by booking
    const bookingsMap = new Map<string, any>();
    trip.tickets.forEach(ticket => {
      const b = ticket.booking;
      if (!b) return;
      if (!bookingsMap.has(b.id)) {
        bookingsMap.set(b.id, {
          id: b.id,
          reference: b.bookingReference,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          paymentStatus: b.paymentStatus,
          totalAmountETB: b.totalAmountETB,
          payments: b.payments.map(p => ({
            id: p.id,
            method: p.paymentMethod,
            amountETB: p.amountETB,
            status: p.status,
            paidAt: p.paidAt
          })),
          tickets: []
        });
      }
      bookingsMap.get(b.id).tickets.push({
        ticketNumber: ticket.ticketNumber,
        seatNumber: ticket.seatNumber,
        passengerName: ticket.passengerName,
        passengerPhone: ticket.passengerPhone,
        status: ticket.status,
        fareETB: ticket.fareETB,
        boardedAt: ticket.boardedAt,
        boardingsCount: ticket.boardings.length
      });
    });

    return res.json({
      connectedChain: {
        route: {
          id: trip.route.id,
          name: `${trip.route.originStation.city} ➔ ${trip.route.destinationStation.city}`,
          origin: trip.route.originStation.nameEn,
          destination: trip.route.destinationStation.nameEn,
          distanceKm: trip.route.distanceKm
        },
        trip: {
          id: trip.id,
          tripCode: trip.tripCode,
          departureTime: trip.departureTime,
          estimatedArrivalTime: trip.estimatedArrivalTime,
          fareETB: trip.fareETB,
          status: trip.status,
          driverName: trip.driverName,
          conductorName: trip.conductorName
        },
        bus: {
          id: trip.bus.id,
          plateNumber: trip.bus.plateNumber,
          sideNumber: trip.bus.sideNumber,
          model: trip.bus.busModel,
          totalSeats: trip.bus.totalSeats,
          amenities: trip.bus.amenities
        },
        seatInventory: {
          totalSeats,
          booked: bookedCount,
          available: availableCount,
          cancelled: cancelledTickets.length,
          boarded: boardedTickets.length,
          occupancyPercent: Math.round((bookedCount / totalSeats) * 100)
        },
        bookings: Array.from(bookingsMap.values()),
        tickets: trip.tickets.map(t => ({
          ticketNumber: t.ticketNumber,
          seatNumber: t.seatNumber,
          passengerName: t.passengerName,
          passengerPhone: t.passengerPhone,
          passengerIdNumber: t.passengerIdNumber,
          fareETB: t.fareETB,
          status: t.status,
          qrHash: t.qrHash,
          boardedAt: t.boardedAt,
          paymentMethod: t.booking?.payments[0]?.paymentMethod || 'CASH'
        }))
      }
    });
  } catch (err: any) {
    console.error('Trip inspection error:', err);
    return res.status(500).json({ error: 'Failed to inspect trip relationship chain' });
  }
});

// POST /api/trips/pilot-seed (Day 29 Pilot Seed: Trip #501, Addis -> Bahir Dar, Bus 023, 45 seats)
router.post('/pilot-seed', async (req: Request, res: Response) => {
  try {
    // 1. Ensure Route Addis Ababa -> Bahir Dar
    let route: any = await prisma.route.findFirst({
      where: {
        originStation: { city: 'Addis Ababa' },
        destinationStation: { city: 'Bahir Dar' }
      },
      include: { originStation: true, destinationStation: true }
    });

    if (!route) {
      // Find or create stations
      let origin = await prisma.station.findFirst({ where: { city: 'Addis Ababa' } });
      let dest = await prisma.station.findFirst({ where: { city: 'Bahir Dar' } });
      if (!dest) {
        dest = await prisma.station.create({
          data: {
            nameEn: 'Bahir Dar - Central Terminal',
            nameAm: 'ባሕር ዳር - ማዕከላዊ ተርሚናል',
            city: 'Bahir Dar',
            terminalArea: 'Lake Tana Highway Terminal #02',
            latitude: 11.5742,
            longitude: 37.3614
          }
        });
      }
      route = await prisma.route.create({
        data: {
          originStationId: origin!.id,
          destinationStationId: dest.id,
          distanceKm: 565,
          estimatedDurationHours: 9,
          baseFareETB: 750
        },
        include: { originStation: true, destinationStation: true }
      });
    }

    // 2. Ensure Bus 023
    let bus023 = await prisma.bus.findFirst({ where: { sideNumber: 'BUS-023' } });
    if (!bus023) {
      const company = await prisma.company.findFirst();
      bus023 = await prisma.bus.create({
        data: {
          companyId: company!.id,
          plateNumber: '3-02345 ET',
          sideNumber: 'BUS-023',
          busModel: 'Zhongtong Navigator VIP Coach',
          busType: 'LUXURY_2X2',
          totalSeats: 45,
          amenities: 'AC,WiFi,Reclining Seats,Water,Charging Ports',
          status: 'ACTIVE'
        }
      });
    }

    // 3. Ensure Trip #501 (ETB-AA-BD-501)
    let trip501 = await prisma.trip.findFirst({ where: { tripCode: 'ETB-AA-BD-501' } });
    if (!trip501) {
      const depDate = new Date();
      depDate.setHours(5, 0, 0, 0); // 05:00 AM Departure

      trip501 = await prisma.trip.create({
        data: {
          tripCode: 'ETB-AA-BD-501',
          routeId: route.id,
          busId: bus023.id,
          driverName: 'Driver 17 (Kebede Worku)',
          driverPhone: '+251 91 199 8877',
          conductorName: 'Conductor Alemu Girma',
          conductorPhone: '+251 92 234 5678',
          departureTime: depDate,
          estimatedArrivalTime: new Date(depDate.getTime() + 9 * 3600 * 1000),
          fareETB: 750,
          status: 'IN_TRANSIT',
          currentLatitude: 9.6800,
          currentLongitude: 38.8500,
          currentSpeedKmH: 74,
          currentMilestone: 'Passing Debre Sina mountain pass'
        }
      });

      // 4. Seed: 17 booked, 2 boarded, 2 cancelled, leaving 24 available!
      // Seats 1A to 17A
      const seatNames = [
        '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
        '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B', '9A'
      ];

      const branch = await prisma.branch.findFirst();

      const booking = await prisma.booking.create({
        data: {
          bookingReference: 'BK-PILOT-501',
          tripId: trip501.id,
          customerName: 'Bahir Dar Pilot Delegation',
          customerPhone: '+251 91 555 0101',
          bookedByRole: 'TICKET_AGENT',
          branchId: branch?.id,
          totalAmountETB: 17 * 750,
          paymentStatus: 'COMPLETED'
        }
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amountETB: 17 * 750,
          paymentMethod: 'TELEBIRR',
          transactionReference: 'TB-PILOT-892110',
          status: 'COMPLETED'
        }
      });

      for (let i = 0; i < seatNames.length; i++) {
        const seat = seatNames[i];
        let status = 'ISSUED';
        if (i < 2) status = 'BOARDED'; // 2 boarded
        else if (i >= 15) status = 'CANCELLED'; // 2 cancelled

        await prisma.ticket.create({
          data: {
            ticketNumber: `TKT-501-${100 + i}`,
            bookingId: booking.id,
            tripId: trip501.id,
            seatNumber: seat,
            passengerName: `Passenger ${i + 1}`,
            passengerPhone: `+251 91 000 ${1000 + i}`,
            passengerIdNumber: `ETH-ID-99${i}`,
            fareETB: 750,
            status,
            qrHash: `QR-501-SEAT-${seat}`,
            boardedAt: status === 'BOARDED' ? new Date() : null
          }
        });
      }
    }

    return res.json({
      success: true,
      message: 'Pilot Trip #501 initialized successfully: Addis Ababa ➔ Bahir Dar (05:00 AM, Bus 023, 45 seats: 17 booked, 24 available, 2 cancelled, 2 boarded).',
      tripId: trip501.id,
      tripCode: trip501.tripCode
    });
  } catch (err: any) {
    console.error('Pilot seed error:', err);
    return res.status(500).json({ error: 'Failed to seed pilot trip' });
  }
});

export default router;


