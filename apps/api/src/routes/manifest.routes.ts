import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/manifest/trips/:id
router.get('/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bus: true,
        route: {
          include: {
            originStation: true,
            destinationStation: true
          }
        },
        tickets: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { seatNumber: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const entries = trip.tickets.map(t => ({
      seatNumber: t.seatNumber,
      passengerName: t.passengerName,
      passengerPhone: t.passengerPhone,
      nationalIdNumber: t.passengerIdNumber,
      boardingPoint: t.boardingTerminal || trip.route.originStation.nameEn,
      destination: t.dropoffTerminal || trip.route.destinationStation.nameEn,
      ticketNumber: t.ticketNumber,
      isBoarded: t.status === 'BOARDED',
      boardedAt: t.boardedAt
    }));

    const manifest = {
      header: {
        country: 'Federal Democratic Republic of Ethiopia (FDRE)',
        authority: 'Ministry of Transport and Logistics / Federal Police Checkpoint Manifest',
        operatorName: 'Abyssinia Intercity Bus Transportation S.C. (አቢሲኒያ የረጅም ርቀት አውቶቡስ)',
        operatorTin: '0054892110',
        issuedDate: new Date().toISOString()
      },
      tripDetails: {
        tripCode: trip.tripCode,
        busPlateNumber: trip.bus.plateNumber,
        busSideNumber: trip.bus.sideNumber,
        busModel: trip.bus.busModel,
        driverName: trip.driverName,
        driverPhone: trip.driverPhone,
        conductorName: trip.conductorName,
        conductorPhone: trip.conductorPhone,
        routeOrigin: trip.route.originStation.nameEn,
        routeOriginAm: trip.route.originStation.nameAm,
        routeDestination: trip.route.destinationStation.nameEn,
        routeDestinationAm: trip.route.destinationStation.nameAm,
        departureTime: trip.departureTime,
        status: trip.status
      },
      passengerStats: {
        totalCapacity: trip.bus.totalSeats,
        totalBooked: entries.length,
        boardedCount: entries.filter(e => e.isBoarded).length,
        occupancyRatePercent: Math.round((entries.length / trip.bus.totalSeats) * 100)
      },
      passengers: entries
    };

    return res.json(manifest);
  } catch (err: any) {
    console.error('Manifest error:', err);
    return res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

export default router;
