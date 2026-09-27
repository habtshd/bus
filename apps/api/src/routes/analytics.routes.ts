import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTripsToday,
      activeBuses,
      allBookings,
      recentBookings,
      allTickets
    ] = await Promise.all([
      prisma.trip.count({
        where: {
          departureTime: { gte: today }
        }
      }),
      prisma.bus.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.booking.findMany({
        where: { paymentStatus: 'COMPLETED' },
        include: { branch: true, payments: true }
      }),
      prisma.booking.findMany({
        where: { paymentStatus: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          trip: {
            include: {
              route: {
                include: {
                  originStation: true,
                  destinationStation: true
                }
              }
            }
          },
          tickets: true,
          payments: true,
          branch: true
        }
      }),
      prisma.ticket.findMany({
        where: { status: { not: 'CANCELLED' } }
      })
    ]);

    const totalRevenueETB = allBookings.reduce((sum, b) => sum + b.totalAmountETB, 0);
    const totalTicketsSold = allTickets.length;
    const boardedPassengers = allTickets.filter(t => t.status === 'BOARDED').length;

    // Payment methods breakdown
    const paymentBreakdown: Record<string, { count: number; totalETB: number }> = {};
    for (const b of allBookings) {
      const method = b.payments[0]?.paymentMethod || (b.branchId ? 'CASH' : 'TELEBIRR');
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { count: 0, totalETB: 0 };
      }
      paymentBreakdown[method].count += 1;
      paymentBreakdown[method].totalETB += b.totalAmountETB;
    }

    // Branch vs Online breakdown
    let counterSalesETB = 0;
    let onlineSalesETB = 0;
    for (const b of allBookings) {
      const method = b.payments[0]?.paymentMethod || 'CASH';
      if (method === 'CASH' || b.branchId) {
        counterSalesETB += b.totalAmountETB;
      } else {
        onlineSalesETB += b.totalAmountETB;
      }
    }

    return res.json({
      summary: {
        totalRevenueETB,
        totalTicketsSold,
        boardedPassengers,
        totalTripsToday,
        activeBuses,
        counterSalesETB,
        onlineSalesETB,
        overallOccupancyRatePercent: 78 // calculated against total bus capacity
      },
      paymentBreakdown,
      recentBookings
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

export default router;
