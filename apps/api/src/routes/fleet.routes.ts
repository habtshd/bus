import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/fleet (List all buses in fleet)
router.get('/', async (req: Request, res: Response) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        trips: {
          orderBy: { departureTime: 'desc' },
          take: 3,
          include: {
            route: {
              include: {
                originStation: true,
                destinationStation: true
              }
            }
          }
        }
      },
      orderBy: { sideNumber: 'asc' }
    });
    return res.json(buses);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch buses' });
  }
});

// POST /api/fleet (Register new bus in fleet)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { plateNumber, sideNumber, busModel, busType, totalSeats, amenities } = req.body;

    if (!plateNumber || !sideNumber || !busType || !totalSeats) {
      return res.status(400).json({ error: 'Plate number, side number, bus type, and total seats are required.' });
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      return res.status(400).json({ error: 'Company record must exist before adding buses.' });
    }

    const bus = await prisma.bus.create({
      data: {
        companyId: company.id,
        plateNumber: plateNumber.trim(),
        sideNumber: sideNumber.trim().toUpperCase(),
        busModel: busModel || 'Zhongtong Navigator Coach',
        busType: busType === 'STANDARD_2X3' ? 'STANDARD_2X3' : busType === 'VIP_FIRST_CLASS_1X2' ? 'VIP_FIRST_CLASS_1X2' : 'LUXURY_2X2',
        totalSeats: Number(totalSeats),
        amenities: amenities || 'AC,WiFi,Reclining Seats'
      }
    });

    return res.status(201).json(bus);
  } catch (err: any) {
    console.error('Create bus error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create bus' });
  }
});

// PATCH /api/fleet/:id/status (Set status: ACTIVE | MAINTENANCE | STANDBY)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'MAINTENANCE', 'STANDBY', 'OUT_OF_SERVICE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: [${validStatuses.join(', ')}]` });
    }

    const bus = await prisma.bus.update({
      where: { id },
      data: { status }
    });

    return res.json(bus);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update bus status' });
  }
});

export default router;
