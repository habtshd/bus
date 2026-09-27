import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/stations
router.get('/', async (req: Request, res: Response) => {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { city: 'asc' }
    });
    return res.json(stations);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// GET /api/routes
router.get('/routes', async (req: Request, res: Response) => {
  try {
    const routes = await prisma.route.findMany({
      where: { active: true },
      include: {
        originStation: true,
        destinationStation: true
      },
      orderBy: { distanceKm: 'asc' }
    });
    return res.json(routes);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

export default router;
