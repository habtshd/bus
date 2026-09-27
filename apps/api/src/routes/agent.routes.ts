import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/agent/shift-summary
router.get('/shift-summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.userId;

    const currentShift = await prisma.cashShift.findFirst({
      where: {
        agentId,
        status: 'OPEN'
      },
      include: {
        agent: true,
        branch: true
      },
      orderBy: { openedAt: 'desc' }
    });

    if (!currentShift) {
      return res.json({
        hasOpenShift: false,
        message: 'No open cash shift. Please open a shift with starting cash float.'
      });
    }

    const expectedDrawerCashETB = currentShift.openingCashETB + currentShift.cashSalesETB - currentShift.refundsETB;

    return res.json({
      hasOpenShift: true,
      shift: {
        id: currentShift.id,
        agentName: currentShift.agent.fullName,
        branchName: currentShift.branch.nameEn,
        branchNameAm: currentShift.branch.nameAm,
        openedAt: currentShift.openedAt,
        openingCashETB: currentShift.openingCashETB,
        cashSalesETB: currentShift.cashSalesETB,
        ticketsCount: currentShift.ticketsCount,
        cancelledTicketsCount: currentShift.cancelledTicketsCount,
        refundsETB: currentShift.refundsETB,
        expectedDrawerCashETB,
        status: currentShift.status,
        notes: currentShift.notes
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve shift summary' });
  }
});

// POST /api/agent/open-shift
router.post('/open-shift', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.userId!;
    const { openingCashETB = 0, notes } = req.body;

    // Check if shift is already open
    const existing = await prisma.cashShift.findFirst({
      where: { agentId, status: 'OPEN' }
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have an active open shift.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: agentId },
      include: { branch: true }
    });

    if (!user || !user.branchId) {
      return res.status(400).json({ error: 'Agent must be assigned to a branch to open a shift.' });
    }

    const newShift = await prisma.cashShift.create({
      data: {
        agentId,
        branchId: user.branchId,
        openingCashETB: Number(openingCashETB),
        cashSalesETB: 0,
        ticketsCount: 0,
        status: 'OPEN',
        notes
      }
    });

    return res.status(201).json(newShift);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to open shift' });
  }
});

// POST /api/agent/close-shift (Day 14: Daily shift reconciliation & drawer count)
router.post('/close-shift', async (req: Request, res: Response) => {
  try {
    const { agentId, actualCashCountedETB = 0, notes } = req.body;

    const currentShift = await prisma.cashShift.findFirst({
      where: {
        ...(agentId ? { agentId } : {}),
        status: 'OPEN'
      },
      include: { agent: true, branch: true },
      orderBy: { openedAt: 'desc' }
    });

    if (!currentShift) {
      return res.status(400).json({ error: 'No active open shift found to close.' });
    }

    const expectedCashETB = currentShift.openingCashETB + currentShift.cashSalesETB - currentShift.refundsETB;
    const discrepancyETB = Number(actualCashCountedETB) - expectedCashETB;

    const closedShift = await prisma.cashShift.update({
      where: { id: currentShift.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        notes: `${currentShift.notes ? currentShift.notes + ' | ' : ''}Closing Count: ${actualCashCountedETB} ETB, Diff: ${discrepancyETB >= 0 ? '+' : ''}${discrepancyETB} ETB. ${notes || ''}`
      }
    });

    return res.json({
      success: true,
      message: 'Cash shift successfully closed and reconciled.',
      shift: closedShift,
      reconciliation: {
        openingCashETB: currentShift.openingCashETB,
        cashSalesETB: currentShift.cashSalesETB,
        refundsETB: currentShift.refundsETB,
        expectedCashETB,
        actualCashCountedETB: Number(actualCashCountedETB),
        discrepancyETB,
        status: discrepancyETB === 0 ? 'BALANCED' : discrepancyETB > 0 ? 'OVERAGE' : 'SHORTAGE'
      }
    });
  } catch (err: any) {
    console.error('Close shift error:', err);
    return res.status(500).json({ error: 'Failed to close shift' });
  }
});

// GET /api/agent/passengers/search (Day 13: Search passenger registry & travel history)
router.get('/passengers/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ passengers: [] });
    }

    const passengers = await prisma.passenger.findMany({
      where: {
        OR: [
          { fullName: { contains: q } },
          { phone: { contains: q } },
          { nationalIdNumber: { contains: q } }
        ]
      },
      include: {
        bookingPassengers: {
          include: {
            ticket: {
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
                }
              }
            }
          },
          take: 5
        }
      },
      take: 20
    });

    return res.json({ passengers });
  } catch (err: any) {
    console.error('Passenger search error:', err);
    return res.status(500).json({ error: 'Failed to search passengers' });
  }
});

export default router;
