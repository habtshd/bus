import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/bookings/hold-seat (Hold seat with 10-minute TTL)
router.post('/hold-seat', async (req: Request, res: Response) => {
  try {
    const { tripId, seatNumbers, sessionId } = req.body;

    if (!tripId || !Array.isArray(seatNumbers) || seatNumbers.length === 0 || !sessionId) {
      return res.status(400).json({ error: 'Missing tripId, seatNumbers array, or sessionId' });
    }

    // Clean expired locks
    await prisma.seatLock.deleteMany({
      where: {
        tripId,
        expiresAt: { lt: new Date() }
      }
    });

    // Check if any seat is already booked
    const existingBookedTickets = await prisma.ticket.findMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers },
        status: { not: 'CANCELLED' }
      }
    });

    if (existingBookedTickets.length > 0) {
      return res.status(409).json({
        error: `Seats [${existingBookedTickets.map(t => t.seatNumber).join(', ')}] are already booked.`
      });
    }

    // Check if any seat is locked by another session
    const existingLocks = await prisma.seatLock.findMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers },
        lockedBySession: { not: sessionId },
        expiresAt: { gte: new Date() }
      }
    });

    if (existingLocks.length > 0) {
      return res.status(409).json({
        error: `Seats [${existingLocks.map(l => l.seatNumber).join(', ')}] are currently held by another passenger.`
      });
    }

    // Create 10-minute lock
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    for (const seatNumber of seatNumbers) {
      await prisma.seatLock.upsert({
        where: {
          tripId_seatNumber: { tripId, seatNumber }
        },
        update: {
          lockedBySession: sessionId,
          expiresAt
        },
        create: {
          tripId,
          seatNumber,
          lockedBySession: sessionId,
          expiresAt
        }
      });
    }

    return res.json({
      success: true,
      message: `${seatNumbers.length} seat(s) reserved for 10 minutes`,
      expiresAt: expiresAt.toISOString()
    });
  } catch (err: any) {
    console.error('Hold seat error:', err);
    return res.status(500).json({ error: 'Failed to hold seat' });
  }
});

// POST /api/bookings/counter-checkout (Branch / Ticket Agent Cash Sale)
router.post('/counter-checkout', async (req: AuthRequest, res: Response) => {
  try {
    const {
      tripId,
      branchId,
      agentId,
      customerName,
      customerPhone,
      passengers, // Array of { seatNumber, passengerName, passengerPhone, passengerIdNumber }
      cashTenderedETB
    } = req.body;

    if (!tripId || !passengers || passengers.length === 0) {
      return res.status(400).json({ error: 'Missing tripId or passengers details' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
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

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const seatNumbers = passengers.map((p: any) => p.seatNumber);

    // Verify seats are not already booked
    const booked = await prisma.ticket.findMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers },
        status: { not: 'CANCELLED' }
      }
    });

    if (booked.length > 0) {
      return res.status(409).json({
        error: `Seats [${booked.map(b => b.seatNumber).join(', ')}] are already booked.`
      });
    }

    const totalAmountETB = trip.fareETB * passengers.length;
    const changeETB = cashTenderedETB ? Math.max(0, Number(cashTenderedETB) - totalAmountETB) : 0;
    const bookingReference = `BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create booking and tickets in transaction
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        tripId,
        customerName: customerName || passengers[0].passengerName,
        customerPhone: customerPhone || passengers[0].passengerPhone,
        bookedByUserId: agentId || req.user?.userId,
        bookedByRole: 'TICKET_AGENT',
        branchId: branchId || req.user?.branchId,
        paymentMethod: 'CASH',
        paymentStatus: 'COMPLETED',
        totalAmountETB
      }
    });

    const generatedTickets = [];

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const qrPayload = JSON.stringify({
        tkt: ticketNumber,
        trip: trip.tripCode,
        seat: p.seatNumber,
        name: p.passengerName,
        id: p.passengerIdNumber
      });
      const qrHash = crypto.createHash('sha256').update(qrPayload).digest('hex');
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 220 });

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          bookingId: booking.id,
          tripId,
          seatNumber: p.seatNumber,
          passengerName: p.passengerName,
          passengerPhone: p.passengerPhone || customerPhone,
          passengerIdNumber: p.passengerIdNumber || 'N/A',
          fareETB: trip.fareETB,
          status: 'ISSUED',
          qrHash,
          boardingTerminal: trip.route.originStation.nameEn,
          dropoffTerminal: trip.route.destinationStation.nameEn
        }
      });

      generatedTickets.push({
        ...ticket,
        qrCodeDataUrl
      });
    }

    // Release any seat locks for these seats
    await prisma.seatLock.deleteMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers }
      }
    });

    // Update active cash shift if agent has one open
    if (agentId || req.user?.userId) {
      const openShift = await prisma.cashShift.findFirst({
        where: {
          agentId: agentId || req.user?.userId,
          status: 'OPEN'
        }
      });

      if (openShift) {
        await prisma.cashShift.update({
          where: { id: openShift.id },
          data: {
            cashSalesETB: openShift.cashSalesETB + totalAmountETB,
            ticketsCount: openShift.ticketsCount + passengers.length
          }
        });
      }
    }

    return res.status(201).json({
      success: true,
      bookingReference,
      totalAmountETB,
      cashTenderedETB: Number(cashTenderedETB) || totalAmountETB,
      changeETB,
      trip: {
        tripCode: trip.tripCode,
        busPlate: trip.bus.plateNumber,
        busSide: trip.bus.sideNumber,
        route: `${trip.route.originStation.nameEn} ➔ ${trip.route.destinationStation.nameEn}`,
        departureTime: trip.departureTime
      },
      tickets: generatedTickets
    });
  } catch (err: any) {
    console.error('Counter checkout error:', err);
    return res.status(500).json({ error: err.message || 'Counter checkout failed' });
  }
});

// POST /api/bookings/online-checkout (Chapa / Telebirr digital checkout)
router.post('/online-checkout', async (req: Request, res: Response) => {
  try {
    const {
      tripId,
      customerName,
      customerPhone,
      customerEmail,
      passengers,
      paymentMethod = 'CHAPA_GATEWAY' // CHAPA_GATEWAY or TELEBIRR or CBE_BIRR
    } = req.body;

    if (!tripId || !passengers || passengers.length === 0) {
      return res.status(400).json({ error: 'Missing tripId or passenger details' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
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

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const seatNumbers = passengers.map((p: any) => p.seatNumber);
    const booked = await prisma.ticket.findMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers },
        status: { not: 'CANCELLED' }
      }
    });

    if (booked.length > 0) {
      return res.status(409).json({
        error: `Seat(s) [${booked.map(b => b.seatNumber).join(', ')}] have already been purchased.`
      });
    }

    const totalAmountETB = trip.fareETB * passengers.length;
    const bookingReference = `BK-WEB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        tripId,
        customerName,
        customerPhone,
        customerEmail,
        bookedByRole: 'PASSENGER',
        paymentMethod,
        paymentStatus: 'COMPLETED', // Auto-completed in demo/MVP checkout flow
        totalAmountETB
      }
    });

    const generatedTickets = [];

    for (const p of passengers) {
      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const qrPayload = JSON.stringify({
        tkt: ticketNumber,
        trip: trip.tripCode,
        seat: p.seatNumber,
        name: p.passengerName,
        id: p.passengerIdNumber
      });
      const qrHash = crypto.createHash('sha256').update(qrPayload).digest('hex');
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 220 });

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          bookingId: booking.id,
          tripId,
          seatNumber: p.seatNumber,
          passengerName: p.passengerName,
          passengerPhone: p.passengerPhone || customerPhone,
          passengerIdNumber: p.passengerIdNumber || 'N/A',
          fareETB: trip.fareETB,
          status: 'ISSUED',
          qrHash,
          boardingTerminal: trip.route.originStation.nameEn,
          dropoffTerminal: trip.route.destinationStation.nameEn
        }
      });

      generatedTickets.push({
        ...ticket,
        qrCodeDataUrl
      });
    }

    // Clear locks
    await prisma.seatLock.deleteMany({
      where: {
        tripId,
        seatNumber: { in: seatNumbers }
      }
    });

    return res.status(201).json({
      success: true,
      bookingReference,
      paymentMethod,
      totalAmountETB,
      trip: {
        tripCode: trip.tripCode,
        busPlate: trip.bus.plateNumber,
        route: `${trip.route.originStation.nameEn} ➔ ${trip.route.destinationStation.nameEn}`,
        departureTime: trip.departureTime
      },
      tickets: generatedTickets
    });
  } catch (err: any) {
    console.error('Online checkout error:', err);
    return res.status(500).json({ error: err.message || 'Online checkout failed' });
  }
});

// GET /api/bookings/:reference
router.get('/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: {
        trip: {
          include: {
            route: {
              include: {
                originStation: true,
                destinationStation: true
              }
            },
            bus: true
          }
        },
        tickets: true,
        branch: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Attach QR data URLs to tickets
    const ticketsWithQR = await Promise.all(
      booking.tickets.map(async t => {
        const qrPayload = JSON.stringify({
          tkt: t.ticketNumber,
          trip: booking.trip.tripCode,
          seat: t.seatNumber,
          name: t.passengerName
        });
        const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 220 });
        return {
          ...t,
          qrCodeDataUrl
        };
      })
    );

    return res.json({
      ...booking,
      tickets: ticketsWithQR
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve booking' });
  }
});

export default router;
