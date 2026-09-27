import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// POST /api/tickets/verify-qr (Conductor QR Scanner verification)
router.post('/verify-qr', async (req: Request, res: Response) => {
  try {
    const { qrPayloadRaw, currentTripId } = req.body;

    if (!qrPayloadRaw) {
      return res.status(400).json({ error: 'Missing QR payload data' });
    }

    let parsedPayload: any;
    try {
      parsedPayload = typeof qrPayloadRaw === 'string' ? JSON.parse(qrPayloadRaw) : qrPayloadRaw;
    } catch (e) {
      // If payload is plain ticket number string
      parsedPayload = { tkt: qrPayloadRaw };
    }

    const ticketNumber = parsedPayload.tkt;
    if (!ticketNumber) {
      return res.status(400).json({ error: 'Invalid QR ticket format' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        trip: {
          include: {
            bus: true,
            route: {
              include: {
                originStation: true,
                destinationStation: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        valid: false,
        code: 'NOT_FOUND',
        message: 'Invalid ticket. No record found in central database.'
      });
    }

    // Check if ticket is for this trip
    if (currentTripId && ticket.tripId !== currentTripId) {
      return res.status(400).json({
        valid: false,
        code: 'WRONG_TRIP',
        message: `Ticket is for trip ${ticket.trip.tripCode}, not the current trip!`,
        ticket
      });
    }

    // Check if already boarded
    if (ticket.status === 'BOARDED') {
      return res.status(409).json({
        valid: false,
        code: 'ALREADY_BOARDED',
        message: `Warning: This ticket was already boarded at ${new Date(ticket.boardedAt!).toLocaleTimeString()}! Duplicate boarding attempt.`,
        ticket
      });
    }

    if (ticket.status === 'CANCELLED') {
      return res.status(400).json({
        valid: false,
        code: 'CANCELLED',
        message: 'This ticket was cancelled or refunded.',
        ticket
      });
    }

    // Mark as BOARDED
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'BOARDED',
        boardedAt: new Date()
      }
    });

    return res.json({
      valid: true,
      code: 'BOARDING_SUCCESS',
      message: `Verified! Seat ${updatedTicket.seatNumber} boarded successfully.`,
      passenger: {
        name: updatedTicket.passengerName,
        seatNumber: updatedTicket.seatNumber,
        phone: updatedTicket.passengerPhone,
        idNumber: updatedTicket.passengerIdNumber,
        boardedAt: updatedTicket.boardedAt
      }
    });
  } catch (err: any) {
    console.error('QR verification error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
