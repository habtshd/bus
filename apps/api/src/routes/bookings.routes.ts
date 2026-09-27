import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/bookings/hold-seat (Transitions seat: AVAILABLE -> HELD with 10-minute TTL)
// Hardened with Prisma Database Transaction & Atomic Unique Constraint checks
router.post('/hold-seat', async (req: Request, res: Response) => {
  try {
    const { tripId, seatNumbers, sessionId } = req.body;

    if (!tripId || !Array.isArray(seatNumbers) || seatNumbers.length === 0 || !sessionId) {
      return res.status(400).json({ error: 'Missing tripId, seatNumbers array, or sessionId' });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Execute in atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Purge expired locks for this trip
      await tx.seatLock.deleteMany({
        where: {
          tripId,
          expiresAt: { lt: new Date() }
        }
      });

      // 2. Check if already purchased/PAID
      const existingPaidTickets = await tx.ticket.findMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers },
          status: { not: 'CANCELLED' }
        }
      });

      if (existingPaidTickets.length > 0) {
        throw {
          status: 409,
          message: `Seat(s) [${existingPaidTickets.map(t => t.seatNumber).join(', ')}] are already PAID / purchased.`
        };
      }

      // 3. Check if currently HELD by another user session
      const existingLocks = await tx.seatLock.findMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers },
          lockedBySession: { not: sessionId },
          expiresAt: { gte: new Date() }
        }
      });

      if (existingLocks.length > 0) {
        throw {
          status: 409,
          message: `Seat(s) [${existingLocks.map(l => l.seatNumber).join(', ')}] are currently HELD by another customer.`
        };
      }

      // 4. Atomically upsert locks
      for (const seatNumber of seatNumbers) {
        await tx.seatLock.upsert({
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

      return { seatNumbers, expiresAt };
    });

    return res.json({
      success: true,
      status: 'HELD',
      message: `Seat(s) [${result.seatNumbers.join(', ')}] successfully HELD for 10 minutes.`,
      expiresAt: result.expiresAt.toISOString()
    });
  } catch (err: any) {
    if (err.status === 409 || err.code === 'P2002') {
      return res.status(409).json({
        error: err.message || 'Concurrency Conflict: Seat was just grabbed by another simultaneous user.'
      });
    }
    console.error('Hold seat error:', err);
    return res.status(500).json({ error: 'Failed to hold seat' });
  }
});

// POST /api/bookings/release-seat (Releases HELD seat back to AVAILABLE)
router.post('/release-seat', async (req: Request, res: Response) => {
  try {
    const { tripId, seatNumbers, sessionId } = req.body;

    if (!tripId || !Array.isArray(seatNumbers)) {
      return res.status(400).json({ error: 'Missing tripId or seatNumbers' });
    }

    const whereClause: any = {
      tripId,
      seatNumber: { in: seatNumbers }
    };

    if (sessionId) {
      whereClause.lockedBySession = sessionId;
    }

    await prisma.seatLock.deleteMany({
      where: whereClause
    });

    return res.json({
      success: true,
      status: 'AVAILABLE',
      message: `Seat(s) [${seatNumbers.join(', ')}] released back to AVAILABLE.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to release seat' });
  }
});

// POST /api/bookings/counter-checkout (Branch Cash & Digital Sale: Transitions HELD/AVAILABLE -> PAID)
router.post('/counter-checkout', async (req: AuthRequest, res: Response) => {
  try {
    const {
      tripId,
      branchId,
      agentId,
      customerName,
      customerPhone,
      passengers, // Array of { seatNumber, passengerName, passengerPhone, passengerIdNumber }
      paymentMethod = 'CASH',
      transactionReference,
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
    const totalAmountETB = trip.fareETB * passengers.length;
    const changeETB = (paymentMethod === 'CASH' && cashTenderedETB)
      ? Math.max(0, Number(cashTenderedETB) - totalAmountETB)
      : 0;
    const bookingReference = `BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Execute atomic checkout transaction
    const checkoutResult = await prisma.$transaction(async (tx) => {
      // 1. Strict concurrency check
      const existingPaid = await tx.ticket.findMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers },
          status: { not: 'CANCELLED' }
        }
      });

      if (existingPaid.length > 0) {
        throw {
          status: 409,
          message: `Seats [${existingPaid.map(b => b.seatNumber).join(', ')}] are already PAID by another user.`
        };
      }

      // 2. Create Booking
      const booking = await tx.booking.create({
        data: {
          bookingReference,
          tripId,
          customerName: customerName || passengers[0].passengerName,
          customerPhone: customerPhone || passengers[0].passengerPhone,
          bookedByUserId: agentId || req.user?.userId,
          bookedByRole: 'TICKET_AGENT',
          branchId: branchId || req.user?.branchId,
          totalAmountETB,
          paymentStatus: 'COMPLETED'
        }
      });

      // 3. Create Payment record
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amountETB: totalAmountETB,
          paymentMethod: paymentMethod || 'CASH',
          transactionReference: transactionReference || undefined,
          cashTenderedETB: paymentMethod === 'CASH' ? (Number(cashTenderedETB) || totalAmountETB) : undefined,
          changeReturnedETB: paymentMethod === 'CASH' ? changeETB : 0,
          status: 'COMPLETED'
        }
      });

      // 3b. Update open CashShift if cash payment
      if (paymentMethod === 'CASH') {
        const actingAgentId = agentId || req.user?.userId;
        if (actingAgentId) {
          await tx.cashShift.updateMany({
            where: { agentId: actingAgentId, status: 'OPEN' },
            data: {
              cashSalesETB: { increment: totalAmountETB },
              ticketsCount: { increment: passengers.length }
            }
          });
        }
      }

      // 3c. Audit Log
      await tx.auditLog.create({
        data: {
          userId: agentId || req.user?.userId,
          action: 'COUNTER_SALE',
          entityName: 'Booking',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            bookingReference,
            totalAmountETB,
            seats: seatNumbers,
            paymentMethod,
            ticketsCount: passengers.length
          })
        }
      });

      const ticketsList = [];

      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

        // Master passenger registration
        const passengerRecord = await tx.passenger.upsert({
          where: { phone: p.passengerPhone || customerPhone },
          update: {
            fullName: p.passengerName,
            nationalIdNumber: p.passengerIdNumber
          },
          create: {
            fullName: p.passengerName,
            phone: p.passengerPhone || customerPhone,
            nationalIdNumber: p.passengerIdNumber
          }
        });

        // Booking Passenger junction
        const bp = await tx.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            passengerId: passengerRecord.id,
            seatNumber: p.seatNumber,
            passengerName: p.passengerName,
            passengerPhone: p.passengerPhone || customerPhone,
            passengerIdNumber: p.passengerIdNumber || 'N/A'
          }
        });

        const qrPayload = JSON.stringify({
          tkt: ticketNumber,
          trip: trip.tripCode,
          seat: p.seatNumber,
          name: p.passengerName,
          id: p.passengerIdNumber
        });
        const qrHash = crypto.createHash('sha256').update(qrPayload).digest('hex');

        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            bookingId: booking.id,
            bookingPassengerId: bp.id,
            tripId,
            seatNumber: p.seatNumber,
            passengerName: p.passengerName,
            passengerPhone: p.passengerPhone || customerPhone,
            passengerIdNumber: p.passengerIdNumber || 'N/A',
            fareETB: trip.fareETB,
            status: 'ISSUED', // PAID
            qrHash,
            boardingTerminal: trip.route.originStation.nameEn,
            dropoffTerminal: trip.route.destinationStation.nameEn
          }
        });

        ticketsList.push({
          ticket,
          qrPayload
        });
      }

      // 4. Release locks for these seats
      await tx.seatLock.deleteMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers }
        }
      });

      return { booking, ticketsList };
    });

    // Generate QR images outside transaction
    const enrichedTickets = await Promise.all(
      checkoutResult.ticketsList.map(async item => {
        const qrCodeDataUrl = await QRCode.toDataURL(item.qrPayload, { margin: 1, width: 220 });
        return {
          ...item.ticket,
          qrCodeDataUrl
        };
      })
    );

    return res.status(201).json({
      success: true,
      status: 'PAID',
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
      tickets: enrichedTickets
    });
  } catch (err: any) {
    if (err.status === 409 || err.code === 'P2002') {
      return res.status(409).json({ error: err.message || 'Double Booking Prevented: Seat already purchased.' });
    }
    console.error('Counter checkout error:', err);
    return res.status(500).json({ error: err.message || 'Counter checkout failed' });
  }
});

// POST /api/bookings/online-checkout (Transitions HELD/AVAILABLE -> PAID via Telebirr/Chapa)
router.post('/online-checkout', async (req: Request, res: Response) => {
  try {
    const {
      tripId,
      customerName,
      customerPhone,
      customerEmail,
      passengers,
      paymentMethod = 'TELEBIRR'
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
    const totalAmountETB = trip.fareETB * passengers.length;
    const bookingReference = `BK-WEB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Atomic execution with Prisma transaction
    const checkoutResult = await prisma.$transaction(async (tx) => {
      // Concurrency check
      const alreadyPaid = await tx.ticket.findMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers },
          status: { not: 'CANCELLED' }
        }
      });

      if (alreadyPaid.length > 0) {
        throw {
          status: 409,
          message: `Seat(s) [${alreadyPaid.map(b => b.seatNumber).join(', ')}] have already been purchased by another customer.`
        };
      }

      const booking = await tx.booking.create({
        data: {
          bookingReference,
          tripId,
          customerName,
          customerPhone,
          customerEmail,
          bookedByRole: 'PASSENGER',
          totalAmountETB,
          paymentStatus: 'COMPLETED'
        }
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amountETB: totalAmountETB,
          paymentMethod,
          transactionReference: `TX-${Date.now()}`,
          status: 'COMPLETED'
        }
      });

      const ticketsList = [];

      for (const p of passengers) {
        const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

        const passengerRecord = await tx.passenger.upsert({
          where: { phone: p.passengerPhone || customerPhone },
          update: {
            fullName: p.passengerName,
            nationalIdNumber: p.passengerIdNumber
          },
          create: {
            fullName: p.passengerName,
            phone: p.passengerPhone || customerPhone,
            nationalIdNumber: p.passengerIdNumber
          }
        });

        const bp = await tx.bookingPassenger.create({
          data: {
            bookingId: booking.id,
            passengerId: passengerRecord.id,
            seatNumber: p.seatNumber,
            passengerName: p.passengerName,
            passengerPhone: p.passengerPhone || customerPhone,
            passengerIdNumber: p.passengerIdNumber || 'N/A'
          }
        });

        const qrPayload = JSON.stringify({
          tkt: ticketNumber,
          trip: trip.tripCode,
          seat: p.seatNumber,
          name: p.passengerName,
          id: p.passengerIdNumber
        });
        const qrHash = crypto.createHash('sha256').update(qrPayload).digest('hex');

        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            bookingId: booking.id,
            bookingPassengerId: bp.id,
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

        ticketsList.push({ ticket, qrPayload });
      }

      // Delete locks
      await tx.seatLock.deleteMany({
        where: {
          tripId,
          seatNumber: { in: seatNumbers }
        }
      });

      return { booking, ticketsList };
    });

    const enrichedTickets = await Promise.all(
      checkoutResult.ticketsList.map(async item => {
        const qrCodeDataUrl = await QRCode.toDataURL(item.qrPayload, { margin: 1, width: 220 });
        return {
          ...item.ticket,
          qrCodeDataUrl
        };
      })
    );

    return res.status(201).json({
      success: true,
      status: 'PAID',
      bookingReference,
      paymentMethod,
      totalAmountETB,
      trip: {
        tripCode: trip.tripCode,
        busPlate: trip.bus.plateNumber,
        route: `${trip.route.originStation.nameEn} ➔ ${trip.route.destinationStation.nameEn}`,
        departureTime: trip.departureTime
      },
      tickets: enrichedTickets
    });
  } catch (err: any) {
    if (err.status === 409 || err.code === 'P2002') {
      return res.status(409).json({ error: err.message || 'Double Booking Prevented: Seat already taken.' });
    }
    console.error('Online checkout error:', err);
    return res.status(500).json({ error: err.message || 'Online checkout failed' });
  }
});

// POST /api/bookings/:reference/cancel (Implements: CANCELLED -> AVAILABLE)
router.post('/:reference/cancel', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: {
        tickets: true,
        trip: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Execute cancellation in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark tickets as CANCELLED
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'CANCELLED' }
      });

      // 2. Mark booking as REFUNDED
      await tx.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'REFUNDED' }
      });

      // 3. Clear any remnant seat locks
      const seatNumbers = booking.tickets.map(t => t.seatNumber);
      await tx.seatLock.deleteMany({
        where: {
          tripId: booking.tripId,
          seatNumber: { in: seatNumbers }
        }
      });
    });

    return res.json({
      success: true,
      status: 'AVAILABLE',
      message: `Booking ${reference} cancelled. Seats [${booking.tickets.map(t => t.seatNumber).join(', ')}] are now AVAILABLE again for booking.`,
      cancelledSeats: booking.tickets.map(t => t.seatNumber)
    });
  } catch (err: any) {
    console.error('Cancellation error:', err);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// GET /api/bookings/search (Day 13 & 15: Fast multi-field search)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ bookings: [] });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { bookingReference: { contains: q } },
          { customerPhone: { contains: q } },
          { customerName: { contains: q } },
          { tickets: { some: { ticketNumber: { contains: q } } } },
          { tickets: { some: { passengerName: { contains: q } } } },
          { tickets: { some: { passengerIdNumber: { contains: q } } } }
        ]
      },
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
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const ticketsWithQR = await Promise.all(
          b.tickets.map(async (t) => {
            const qrPayload = JSON.stringify({
              tkt: t.ticketNumber,
              trip: b.trip.tripCode,
              seat: t.seatNumber,
              name: t.passengerName
            });
            const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 180 });
            return { ...t, qrCodeDataUrl };
          })
        );
        return { ...b, tickets: ticketsWithQR };
      })
    );

    return res.json({ bookings: enriched });
  } catch (err: any) {
    console.error('Bookings search error:', err);
    return res.status(500).json({ error: 'Failed to search bookings' });
  }
});

// POST /api/bookings/reschedule (Day 15: Trip transfer & Seat re-selection)
router.post('/reschedule', async (req: Request, res: Response) => {
  try {
    const { bookingReference, ticketNumber, newTripId, newSeatNumber, agentId, changeReason } = req.body;

    if (!bookingReference || !ticketNumber || !newTripId || !newSeatNumber) {
      return res.status(400).json({ error: 'Missing bookingReference, ticketNumber, newTripId, or newSeatNumber' });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
      include: {
        tickets: true,
        trip: {
          include: { route: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Original booking not found' });
    }

    const ticketToMove = booking.tickets.find((t) => t.ticketNumber === ticketNumber);
    if (!ticketToMove) {
      return res.status(404).json({ error: `Ticket ${ticketNumber} not found in booking ${bookingReference}` });
    }

    if (ticketToMove.status === 'BOARDED') {
      return res.status(400).json({ error: 'Cannot reschedule an already BOARDED passenger ticket.' });
    }

    const newTrip = await prisma.trip.findUnique({
      where: { id: newTripId },
      include: {
        bus: true,
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        }
      }
    });

    if (!newTrip) {
      return res.status(404).json({ error: 'Target trip not found' });
    }

    // Atomic transaction for rescheduling
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify seat availability on new trip
      const existingPaid = await tx.ticket.findFirst({
        where: {
          tripId: newTripId,
          seatNumber: newSeatNumber,
          status: { not: 'CANCELLED' }
        }
      });
      if (existingPaid) {
        throw { status: 409, message: `Seat ${newSeatNumber} on trip ${newTrip.tripCode} is already booked.` };
      }

      const activeLock = await tx.seatLock.findFirst({
        where: {
          tripId: newTripId,
          seatNumber: newSeatNumber,
          expiresAt: { gte: new Date() }
        }
      });
      if (activeLock) {
        throw { status: 409, message: `Seat ${newSeatNumber} on trip ${newTrip.tripCode} is temporarily held.` };
      }

      // 2. Mark old ticket as CANCELLED (releasing old seat back to AVAILABLE)
      await tx.ticket.update({
        where: { id: ticketToMove.id },
        data: { status: 'CANCELLED' }
      });

      // 3. Calculate fare difference
      const fareDiffETB = newTrip.fareETB - ticketToMove.fareETB;

      // 4. Issue new Ticket on the new trip
      const newTicketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const qrPayload = JSON.stringify({
        tkt: newTicketNumber,
        trip: newTrip.tripCode,
        seat: newSeatNumber,
        name: ticketToMove.passengerName,
        id: ticketToMove.passengerIdNumber
      });
      const qrHash = crypto.createHash('sha256').update(qrPayload).digest('hex');

      const newTicket = await tx.ticket.create({
        data: {
          ticketNumber: newTicketNumber,
          bookingId: booking.id,
          bookingPassengerId: ticketToMove.bookingPassengerId,
          tripId: newTripId,
          seatNumber: newSeatNumber,
          passengerName: ticketToMove.passengerName,
          passengerPhone: ticketToMove.passengerPhone,
          passengerIdNumber: ticketToMove.passengerIdNumber,
          fareETB: newTrip.fareETB,
          status: 'ISSUED',
          qrHash,
          boardingTerminal: newTrip.route.originStation.nameEn,
          dropoffTerminal: newTrip.route.destinationStation.nameEn
        }
      });

      // 5. Update booking with new trip and fare adjustment if appropriate
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          tripId: newTripId,
          totalAmountETB: { increment: Math.max(0, fareDiffETB) }
        }
      });

      // 6. Audit Trail
      await tx.auditLog.create({
        data: {
          userId: agentId,
          action: 'TICKET_RESCHEDULE',
          entityName: 'Ticket',
          entityId: newTicket.id,
          detailsJson: JSON.stringify({
            bookingReference,
            oldTicketNumber: ticketToMove.ticketNumber,
            oldSeat: ticketToMove.seatNumber,
            newTicketNumber,
            newSeat: newSeatNumber,
            newTripCode: newTrip.tripCode,
            fareDiffETB,
            reason: changeReason || 'Customer requested travel date/time modification'
          })
        }
      });

      return { newTicket, qrPayload, fareDiffETB };
    });

    const qrCodeDataUrl = await QRCode.toDataURL(result.qrPayload, { margin: 1, width: 220 });

    return res.json({
      success: true,
      message: `Ticket successfully rescheduled from Seat ${ticketToMove.seatNumber} to Seat ${newSeatNumber} on trip ${newTrip.tripCode}.`,
      oldTicketNumber: ticketToMove.ticketNumber,
      newTicket: {
        ...result.newTicket,
        qrCodeDataUrl
      },
      fareDiffETB: result.fareDiffETB,
      newTrip: {
        tripCode: newTrip.tripCode,
        route: `${newTrip.route.originStation.nameEn} ➔ ${newTrip.route.destinationStation.nameEn}`,
        departureTime: newTrip.departureTime,
        busPlate: newTrip.bus.plateNumber
      }
    });
  } catch (err: any) {
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    console.error('Reschedule error:', err);
    return res.status(500).json({ error: err.message || 'Failed to reschedule ticket' });
  }
});

// POST /api/bookings/:reference/refund (Day 15: Structured refund policy & cash drawer adjustment)
router.post('/:reference/refund', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const {
      reason = 'Customer Request',
      refundPercentage = 80, // Default 80% (20% administrative deduction)
      deductionFeeETB = 0,
      agentId,
      notes
    } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: {
        tickets: true,
        trip: {
          include: {
            route: { include: { originStation: true, destinationStation: true } }
          }
        },
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.paymentStatus === 'REFUNDED') {
      return res.status(400).json({ error: 'This booking has already been refunded.' });
    }

    const originalAmountETB = booking.totalAmountETB;
    const calculatedRefundETB = Math.max(
      0,
      (originalAmountETB * (Number(refundPercentage) / 100)) - Number(deductionFeeETB)
    );
    const adminFeeETB = originalAmountETB - calculatedRefundETB;

    await prisma.$transaction(async (tx) => {
      // 1. Mark tickets CANCELLED (releases seats back to AVAILABLE)
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'CANCELLED' }
      });

      // 2. Mark booking REFUNDED
      await tx.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'REFUNDED' }
      });

      // 3. Delete any remnant locks
      const seatNumbers = booking.tickets.map((t) => t.seatNumber);
      await tx.seatLock.deleteMany({
        where: {
          tripId: booking.tripId,
          seatNumber: { in: seatNumbers }
        }
      });

      // 4. Record refund payment transaction
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amountETB: -calculatedRefundETB,
          paymentMethod: booking.payments[0]?.paymentMethod || 'CASH',
          status: 'REFUNDED'
        }
      });

      // 5. Update agent cash shift if cash refund
      if (agentId) {
        await tx.cashShift.updateMany({
          where: { agentId, status: 'OPEN' },
          data: {
            refundsETB: { increment: calculatedRefundETB },
            cancelledTicketsCount: { increment: booking.tickets.length }
          }
        });
      }

      // 6. Audit Trail
      await tx.auditLog.create({
        data: {
          userId: agentId,
          action: 'TICKET_REFUND',
          entityName: 'Booking',
          entityId: booking.id,
          detailsJson: JSON.stringify({
            bookingReference: reference,
            originalAmountETB,
            calculatedRefundETB,
            adminFeeETB,
            refundPercentage,
            reason,
            notes
          })
        }
      });
    });

    return res.json({
      success: true,
      status: 'REFUNDED',
      bookingReference: reference,
      originalAmountETB,
      refundAmountETB: calculatedRefundETB,
      adminFeeETB,
      refundPercentage,
      releasedSeats: booking.tickets.map((t) => t.seatNumber),
      reason,
      receiptNumber: `RFD-${Date.now().toString().slice(-6)}`,
      processedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Refund error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process refund' });
  }
});

// POST /api/bookings/send-sms (Day 18: Simulated SMS / Email confirmation dispatch)
router.post('/send-sms', async (req: Request, res: Response) => {
  try {
    const { phone, bookingReference, passengerName, tripCode, route, departureTime, seatNumber } = req.body;
    if (!phone || !bookingReference) {
      return res.status(400).json({ error: 'Missing phone or bookingReference' });
    }

    const message = `[Abyssinia Bus S.C.] Amesegenalehu ${passengerName || 'Passenger'}! Booking ${bookingReference} confirmed. Seat(s): ${seatNumber}, Trip: ${tripCode} (${route}). Departs: ${departureTime}. Show QR ticket at gate. 24/7 Hotline: 9444.`;

    const notification = await prisma.notification.create({
      data: {
        recipientPhone: phone,
        channel: 'SMS',
        message,
        status: 'SENT',
        providerResponse: JSON.stringify({
          messageId: `eth-sms-${Date.now()}`,
          carrier: 'Ethio Telecom SMS Gateway',
          status: 'DELIVERED'
        })
      }
    });

    return res.json({
      success: true,
      notificationId: notification.id,
      recipientPhone: phone,
      message,
      deliveredAt: notification.sentAt
    });
  } catch (err: any) {
    console.error('SMS notification error:', err);
    return res.status(500).json({ error: 'Failed to send SMS notification' });
  }
});

// GET /api/bookings/:reference (Lookup booking details)
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
