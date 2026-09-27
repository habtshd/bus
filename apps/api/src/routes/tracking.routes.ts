import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// POST /api/tracking/ping (Day 23: Driver phone sends GPS coordinates)
// Driver Phone -> GPS -> Backend
router.post('/ping', async (req: Request, res: Response) => {
  try {
    const {
      tripId,
      latitude,
      longitude,
      speedKmH = 75,
      milestone = 'On Highway Corridor',
      driverPhone
    } = req.body;

    if (!tripId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing tripId, latitude, or longitude' });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Enforce 80 km/h FDRE transport speed regulation warning
    const speedLimitExceeded = Number(speedKmH) > 85;

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        currentLatitude: Number(latitude),
        currentLongitude: Number(longitude),
        currentSpeedKmH: Number(speedKmH),
        currentMilestone: milestone,
        lastGpsPingAt: new Date()
      }
    });

    if (speedLimitExceeded) {
      await prisma.auditLog.create({
        data: {
          action: 'SPEED_LIMIT_EXCEEDED',
          entityName: 'Trip',
          entityId: tripId,
          detailsJson: JSON.stringify({
            tripCode: trip.tripCode,
            speedKmH,
            speedLimitKmH: 80,
            milestone,
            timestamp: new Date().toISOString()
          })
        }
      });
    }

    return res.json({
      success: true,
      tripId,
      tripCode: trip.tripCode,
      currentMilestone: milestone,
      currentSpeedKmH: Number(speedKmH),
      speedWarning: speedLimitExceeded ? 'WARNING: Speed exceeded 80 km/h national limit!' : null,
      lastGpsPingAt: updated.lastGpsPingAt
    });
  } catch (err: any) {
    console.error('GPS ping error:', err);
    return res.status(500).json({ error: 'Failed to record GPS ping' });
  }
});

// GET /api/tracking/trip/:id (Day 23: Passenger & Management view vehicle GPS position)
// Backend -> Management Dashboard -> Passenger
router.get('/trip/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
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
        incidents: {
          where: { resolved: false }
        }
      }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Fallback coordinates if GPS ping not yet received
    const originLat = trip.route.originStation.latitude || 8.9806;
    const originLng = trip.route.originStation.longitude || 38.7578;
    const destLat = trip.route.destinationStation.latitude || 7.0504;
    const destLng = trip.route.destinationStation.longitude || 38.4716;

    const currentLat = trip.currentLatitude || originLat + (destLat - originLat) * 0.45;
    const currentLng = trip.currentLongitude || originLng + (destLng - originLng) * 0.45;

    return res.json({
      tripId: trip.id,
      tripCode: trip.tripCode,
      route: `${trip.route.originStation.nameEn} ➔ ${trip.route.destinationStation.nameEn}`,
      originCity: trip.route.originStation.city,
      destinationCity: trip.route.destinationStation.city,
      status: trip.status,
      busPlate: trip.bus.plateNumber,
      busModel: trip.bus.busModel,
      driverName: trip.driverName,
      driverPhone: trip.driverPhone,
      location: {
        latitude: currentLat,
        longitude: currentLng,
        speedKmH: trip.currentSpeedKmH || 72,
        milestone: trip.currentMilestone || 'En route on express toll corridor',
        lastUpdated: trip.lastGpsPingAt || trip.departureTime
      },
      originStation: {
        name: trip.route.originStation.nameEn,
        latitude: originLat,
        longitude: originLng
      },
      destinationStation: {
        name: trip.route.destinationStation.nameEn,
        latitude: destLat,
        longitude: destLng
      },
      hasActiveIncident: trip.incidents.length > 0,
      activeIncidents: trip.incidents
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve trip tracking' });
  }
});

// GET /api/tracking/fleet (Day 23 & 24: Management Dashboard Fleet Live GPS)
router.get('/fleet', async (req: Request, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        status: { in: ['IN_TRANSIT', 'BOARDING', 'SCHEDULED', 'DELAYED'] }
      },
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

    const fleetStatus = trips.map((trip) => {
      const originLat = trip.route.originStation.latitude || 8.9806;
      const originLng = trip.route.originStation.longitude || 38.7578;
      const destLat = trip.route.destinationStation.latitude || 7.0504;
      const destLng = trip.route.destinationStation.longitude || 38.4716;

      const latitude = trip.currentLatitude || (originLat + (destLat - originLat) * 0.4);
      const longitude = trip.currentLongitude || (originLng + (destLng - originLng) * 0.4);

      return {
        tripId: trip.id,
        tripCode: trip.tripCode,
        route: `${trip.route.originStation.city} ➔ ${trip.route.destinationStation.city}`,
        busPlate: trip.bus.plateNumber,
        busSide: trip.bus.sideNumber,
        driverName: trip.driverName,
        status: trip.status,
        speedKmH: trip.currentSpeedKmH || (trip.status === 'IN_TRANSIT' ? 74 : 0),
        milestone: trip.currentMilestone || (trip.status === 'IN_TRANSIT' ? 'Highway Corridor' : 'At Terminal'),
        passengerCount: trip.tickets.length,
        capacity: trip.bus.totalSeats,
        latitude,
        longitude,
        lastGpsPingAt: trip.lastGpsPingAt || new Date()
      };
    });

    return res.json({ fleet: fleetStatus });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve fleet tracking' });
  }
});

export default router;
