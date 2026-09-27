import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/driver/today-trips (Day 22: Driver sees today's assigned trips)
router.get('/today-trips', async (req: Request, res: Response) => {
  try {
    const { driverId, driverPhone } = req.query;

    const whereClause: any = {};
    if (driverId) {
      whereClause.driverId = String(driverId);
    } else if (driverPhone) {
      whereClause.driverPhone = String(driverPhone);
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        route: {
          include: {
            originStation: true,
            destinationStation: true,
            stops: {
              include: { station: true },
              orderBy: { stopOrder: 'asc' }
            }
          }
        },
        bus: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } }
        },
        incidents: true
      },
      orderBy: { departureTime: 'asc' }
    });

    const enriched = trips.map((trip) => {
      const totalPassengers = trip.tickets.length;
      const boardedPassengers = trip.tickets.filter((t) => t.status === 'BOARDED').length;
      return {
        id: trip.id,
        tripCode: trip.tripCode,
        route: `${trip.route.originStation.nameEn} ➔ ${trip.route.destinationStation.nameEn}`,
        routeAm: `${trip.route.originStation.nameAm} ➔ ${trip.route.destinationStation.nameAm}`,
        originCity: trip.route.originStation.city,
        destinationCity: trip.route.destinationStation.city,
        originTerminal: trip.route.originStation.terminalArea,
        destinationTerminal: trip.route.destinationStation.terminalArea,
        departureTime: trip.departureTime,
        estimatedArrivalTime: trip.estimatedArrivalTime,
        busPlate: trip.bus.plateNumber,
        busSide: trip.bus.sideNumber,
        busModel: trip.bus.busModel,
        busType: trip.bus.busType,
        totalSeats: trip.bus.totalSeats,
        totalPassengers,
        boardedPassengers,
        remainingToBoard: totalPassengers - boardedPassengers,
        fareETB: trip.fareETB,
        status: trip.status,
        delayReason: trip.delayReason,
        delayMinutes: trip.delayMinutes,
        currentMilestone: trip.currentMilestone,
        currentSpeedKmH: trip.currentSpeedKmH,
        lastGpsPingAt: trip.lastGpsPingAt,
        stops: trip.route.stops.map((s) => ({
          stopOrder: s.stopOrder,
          stationName: s.station.nameEn,
          stationCity: s.station.city,
          offsetMinutes: s.arrivalOffsetMinutes
        })),
        activeIncidentsCount: trip.incidents.filter((i) => !i.resolved).length
      };
    });

    return res.json({ trips: enriched });
  } catch (err: any) {
    console.error('Driver today trips error:', err);
    return res.status(500).json({ error: 'Failed to retrieve driver trips' });
  }
});

// GET /api/driver/trip/:id/passengers (Day 22: View passenger manifest for driver)
router.get('/trip/:id/passengers', async (req: Request, res: Response) => {
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
          where: { status: { not: 'CANCELLED' } },
          orderBy: { seatNumber: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.json({
      tripCode: trip.tripCode,
      route: `${trip.route.originStation.nameEn} ➔ ${trip.route.destinationStation.nameEn}`,
      departureTime: trip.departureTime,
      busPlate: trip.bus.plateNumber,
      totalBooked: trip.tickets.length,
      passengers: trip.tickets.map((t) => ({
        id: t.id,
        seatNumber: t.seatNumber,
        ticketNumber: t.ticketNumber,
        passengerName: t.passengerName,
        passengerPhone: t.passengerPhone,
        passengerIdNumber: t.passengerIdNumber,
        status: t.status,
        boardedAt: t.boardedAt,
        boardingTerminal: t.boardingTerminal
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve passenger manifest' });
  }
});

// POST /api/driver/trip/:id/start (Day 22: Driver starts trip -> IN_TRANSIT)
router.post('/trip/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startMilestone = 'Departed Terminal Gate' } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'IN_TRANSIT',
        currentMilestone: startMilestone,
        lastGpsPingAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TRIP_START',
        entityName: 'Trip',
        entityId: id,
        detailsJson: JSON.stringify({
          tripCode: trip.tripCode,
          startedAt: new Date().toISOString(),
          driverName: trip.driverName
        })
      }
    });

    return res.json({
      success: true,
      message: `Trip ${trip.tripCode} is now IN_TRANSIT on highway corridor.`,
      trip: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to start trip' });
  }
});

// POST /api/driver/trip/:id/end (Day 22: Driver marks trip completed -> ARRIVED)
router.post('/trip/:id/end', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { arrivalMilestone = 'Arrived Destination Terminal' } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'ARRIVED',
        currentMilestone: arrivalMilestone,
        currentSpeedKmH: 0,
        lastGpsPingAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TRIP_ARRIVED',
        entityName: 'Trip',
        entityId: id,
        detailsJson: JSON.stringify({
          tripCode: trip.tripCode,
          arrivedAt: new Date().toISOString(),
          driverName: trip.driverName
        })
      }
    });

    return res.json({
      success: true,
      message: `Trip ${trip.tripCode} successfully completed and ARRIVED.`,
      trip: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to end trip' });
  }
});

// POST /api/driver/trip/:id/delay (Day 22: Driver reports delay)
router.post('/trip/:id/delay', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { delayMinutes = 30, delayReason = 'Heavy highway congestion / checkpoint inspection' } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'DELAYED',
        delayMinutes: Number(delayMinutes),
        delayReason
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TRIP_DELAY_REPORTED',
        entityName: 'Trip',
        entityId: id,
        detailsJson: JSON.stringify({
          tripCode: trip.tripCode,
          delayMinutes,
          delayReason
        })
      }
    });

    return res.json({
      success: true,
      message: `Delay reported: +${delayMinutes} mins due to "${delayReason}".`,
      trip: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to report delay' });
  }
});

// POST /api/driver/trip/:id/incident (Day 22: Driver reports incident)
router.post('/trip/:id/incident', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      incidentType = 'MECHANICAL_BREAKDOWN',
      severity = 'MEDIUM',
      description,
      locationName = 'Near Mojo Toll Junction',
      latitude,
      longitude
    } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const incident = await prisma.incidentReport.create({
      data: {
        tripId: id,
        reportedByDriverId: trip.driverId,
        driverName: trip.driverName,
        incidentType,
        severity,
        description: description || `Reported ${incidentType} at ${locationName}`,
        locationName,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'INCIDENT_REPORTED',
        entityName: 'IncidentReport',
        entityId: incident.id,
        detailsJson: JSON.stringify({
          tripCode: trip.tripCode,
          incidentType,
          severity,
          locationName,
          description
        })
      }
    });

    return res.status(201).json({
      success: true,
      message: `Incident ${incidentType} recorded and flagged to Central Dispatch!`,
      incident
    });
  } catch (err: any) {
    console.error('Incident report error:', err);
    return res.status(500).json({ error: 'Failed to record incident' });
  }
});

export default router;
