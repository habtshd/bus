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

export default router;
