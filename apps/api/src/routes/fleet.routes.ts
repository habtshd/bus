import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/buses
router.get('/', async (req: Request, res: Response) => {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { sideNumber: 'asc' }
    });
    return res.json(buses);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch buses' });
  }
});

// POST /api/buses (Admin only)
router.post('/', requireAuth, requireRole(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { plateNumber, sideNumber, busModel, busType, totalSeats, amenities } = req.body;
    
    if (!plateNumber || !sideNumber || !busType || !totalSeats) {
      return res.status(400).json({ error: 'Missing required bus parameters' });
    }

    const bus = await prisma.bus.create({
      data: {
        plateNumber: plateNumber.trim(),
        sideNumber: sideNumber.trim().toUpperCase(),
        busModel: busModel || 'Standard Coach',
        busType,
        totalSeats: Number(totalSeats),
        amenities: amenities || 'AC,WiFi'
      }
    });

    return res.status(201).json(bus);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create bus' });
  }
});

export default router;
