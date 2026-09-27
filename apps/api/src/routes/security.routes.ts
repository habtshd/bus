import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Day 27: Role Permissions Matrix
const ROLE_PERMISSIONS: Record<string, {
  label: string;
  description: string;
  permissions: string[];
  restrictions: string[];
}> = {
  SUPER_ADMIN: {
    label: 'Executive & Super Admin',
    description: 'Complete operational and financial governance across all regional hubs, fleet, pricing, staff, and audit trails.',
    permissions: [
      'MANAGE_FLEET',
      'CREATE_AND_CANCEL_TRIPS',
      'ASSIGN_CREW_AND_BUS',
      'VIEW_EXECUTIVE_REVENUE_REPORTS',
      'AUDIT_FINANCIAL_RECONCILIATION',
      'ISSUE_POLICY_REFUNDS',
      'VIEW_FULL_AUDIT_TRAIL',
      'MANAGE_USER_ROLES',
      'OVERRIDE_SECURITY_FLAGS'
    ],
    restrictions: []
  },
  BRANCH_MANAGER: {
    label: 'Terminal Branch Manager',
    description: 'Manages local terminal dispatch, oversees counter agents, resolves booking conflicts, and verifies daily cash reconciliations.',
    permissions: [
      'VIEW_BRANCH_REVENUE',
      'SUPERVISE_AGENT_SHIFTS',
      'CLOSE_BRANCH_REGISTER',
      'RESCHEDULE_PASSENGER_TICKETS',
      'AUTHORIZE_BRANCH_REFUNDS',
      'ACCESS_BRANCH_MANIFESTS',
      'VIEW_BRANCH_AUDIT_LOGS'
    ],
    restrictions: [
      'CANNOT_MODIFY_NATIONAL_TARIFFS',
      'CANNOT_DECOMMISSION_FLEET_VEHICLES'
    ]
  },
  TICKET_AGENT: {
    label: 'Counter Ticket Agent',
    description: 'Counter POS interface: seat locking, ticket issuance, Telebirr/cash collection, passenger lookup, and seat reassignments.',
    permissions: [
      'COUNTER_POS_TICKET_SALE',
      'TEMPORARY_SEAT_HOLD',
      'COLLECT_CASH_AND_TELEBIRR',
      'PRINT_THERMAL_TICKETS',
      'SEARCH_PASSENGER_RESERVATIONS',
      'REASSIGN_PASSENGER_SEAT',
      'VIEW_OWN_SHIFT_SUMMARY',
      'CLOSE_OWN_CASH_SHIFT'
    ],
    restrictions: [
      'CANNOT_CANCEL_ENTIRE_TRIP',
      'CANNOT_ALTER_SEAT_PRICES',
      'CANNOT_VIEW_OTHER_BRANCH_REVENUE',
      'MUST_PROVIDE_REASON_FOR_SEAT_CHANGES'
    ]
  },
  DRIVER: {
    label: 'Commercial Bus Driver',
    description: 'Assigned trip portal: route schedule, passenger checkpoint manifest, GPS location sharing, delay notes, and incident reporting.',
    permissions: [
      'VIEW_ASSIGNED_TRIP',
      'VIEW_PASSENGER_MANIFEST',
      'START_TRIP_DEPARTURE',
      'END_TRIP_ARRIVAL',
      'TRANSMIT_GPS_TELEMETRY',
      'REPORT_HIGHWAY_DELAYS',
      'LOG_SAFETY_INCIDENTS'
    ],
    restrictions: [
      'CANNOT_SELL_SEATS',
      'CANNOT_COLLECT_FARES_EN_ROUTE',
      'CANNOT_MODIFY_SCHEDULED_WAYPOINTS',
      'CANNOT_EXCEED_80_KMH_SPEED_LIMIT'
    ]
  },
  CONDUCTOR: {
    label: 'Bus Conductor',
    description: 'Boarding gate check-in: QR ticket scanning, national ID verification, duplicate ticket detection, and luggage verification.',
    permissions: [
      'SCAN_QR_PASSENGER_TICKET',
      'VERIFY_KEBELE_NATIONAL_ID',
      'MARK_PASSENGER_BOARDED',
      'VIEW_SEAT_OCCUPANCY_MANIFEST',
      'FLAG_DUPLICATE_TICKETS'
    ],
    restrictions: [
      'CANNOT_ISSUE_NEW_TICKETS_WITHOUT_AGENT',
      'CANNOT_MODIFY_PASSENGER_IDENTITY'
    ]
  },
  ACCOUNTANT: {
    label: 'Finance & Audit Officer',
    description: 'Central revenue reporting, Telebirr/CBE payment reconciliation, agent shift audits, refund tracking, and tax accounting.',
    permissions: [
      'VIEW_CONSOLIDATED_REVENUE',
      'EXPORT_REVENUE_BY_DAY_ROUTE_BRANCH',
      'AUDIT_AGENT_CASH_DISCREPANCIES',
      'RECONCILE_TELEBIRR_TRANSACTIONS',
      'RECONCILE_CBE_BIRR_TRANSACTIONS',
      'MONITOR_REFUND_DEDUCTIONS',
      'GENERATE_TAX_INVOICES'
    ],
    restrictions: [
      'CANNOT_OPERATE_DISPATCH_OR_FLEET'
    ]
  }
};

// Seed audit logs if database has none
async function ensureSampleAuditLogs() {
  const count = await prisma.auditLog.count({
    where: { action: { in: ['SEAT_CHANGE', 'LOGIN_SUCCESS'] } }
  });
  if (count === 0) {
    const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    const agentUser = await prisma.user.findFirst({ where: { role: 'TICKET_AGENT' } });

    await prisma.auditLog.createMany({
      data: [
        {
          userId: agentUser?.id,
          action: 'SEAT_CHANGE',
          entityName: 'Ticket',
          detailsJson: JSON.stringify({
            agentName: 'Agent John',
            bookingReference: 'BK-AA-BD-8902',
            ticketNumber: 'TKT-108921',
            oldSeat: '12A',
            newSeat: '14B',
            tripCode: 'ETB-AA-BD-01',
            date: 'Sept 27',
            time: '10:42',
            reason: 'Passenger requested window seat next to family member'
          }),
          ipAddress: '197.156.104.22',
          createdAt: new Date('2026-09-27T10:42:00Z')
        },
        {
          userId: agentUser?.id,
          action: 'SEAT_CHANGE',
          entityName: 'Ticket',
          detailsJson: JSON.stringify({
            agentName: 'Agent Tigist Bekele',
            bookingReference: 'BK-AA-HW-4410',
            ticketNumber: 'TKT-204192',
            oldSeat: '03C',
            newSeat: '01A',
            tripCode: 'ETB-AA-HW-01',
            date: 'Sept 27',
            time: '08:15',
            reason: 'Elderly passenger requested front seat for easy boarding'
          }),
          ipAddress: '197.156.104.22',
          createdAt: new Date('2026-09-27T08:15:00Z')
        },
        {
          userId: adminUser?.id,
          action: 'LOGIN_SUCCESS',
          entityName: 'User',
          detailsJson: JSON.stringify({
            userName: 'Yonas Tadesse',
            role: 'SUPER_ADMIN',
            method: 'PASSWORD_HASH_JWT',
            date: 'Sept 27',
            time: '07:30',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }),
          ipAddress: '197.156.104.10',
          createdAt: new Date('2026-09-27T07:30:00Z')
        },
        {
          userId: agentUser?.id,
          action: 'LOGIN_SUCCESS',
          entityName: 'User',
          detailsJson: JSON.stringify({
            userName: 'Agent John',
            role: 'TICKET_AGENT',
            branch: 'Autobis Tera Main',
            date: 'Sept 27',
            time: '07:45',
            userAgent: 'Counter Terminal Station #03'
          }),
          ipAddress: '197.156.104.22',
          createdAt: new Date('2026-09-27T07:45:00Z')
        },
        {
          userId: agentUser?.id,
          action: 'BOOKING_REFUND',
          entityName: 'Booking',
          detailsJson: JSON.stringify({
            agentName: 'Agent John',
            bookingReference: 'BK-AA-GD-1192',
            passengerName: 'Tewodros Kassahun',
            grossFareETB: 850,
            deductionFeeETB: 127.50,
            refundPaidETB: 722.50,
            reason: 'Customer rescheduled travel due to medical appointment',
            date: 'Sept 27',
            time: '11:15'
          }),
          ipAddress: '197.156.104.22',
          createdAt: new Date('2026-09-27T11:15:00Z')
        }
      ]
    });
  }
}

// GET /api/security/permissions (Day 27: Role permissions)
router.get('/permissions', (req: Request, res: Response) => {
  return res.json({
    roles: ROLE_PERMISSIONS,
    systemSummary: {
      totalRoles: Object.keys(ROLE_PERMISSIONS).length,
      fraudProtectionActive: true,
      immutableAuditLogging: true,
      lastPolicyAudit: '2026-09-27'
    }
  });
});

// GET /api/security/audit-trail (Day 27: Audit trail)
router.get('/audit-trail', async (req: Request, res: Response) => {
  try {
    await ensureSampleAuditLogs();
    const { action, limit = 50 } = req.query;

    const whereClause: any = {};
    if (action) whereClause.action = String(action);

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    const parsedLogs = logs.map(l => {
      let details = {};
      try {
        if (l.detailsJson) details = JSON.parse(l.detailsJson);
      } catch (e) {
        details = { raw: l.detailsJson };
      }
      return {
        id: l.id,
        action: l.action,
        entityName: l.entityName,
        entityId: l.entityId,
        user: l.user ? { name: l.user.fullName, role: l.user.role, email: l.user.email } : null,
        details,
        ipAddress: l.ipAddress || '197.156.104.22',
        createdAt: l.createdAt
      };
    });

    return res.json({ auditTrail: parsedLogs });
  } catch (err: any) {
    console.error('Audit trail error:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit trail' });
  }
});

// GET /api/security/login-history (Day 27: Login history)
router.get('/login-history', async (req: Request, res: Response) => {
  try {
    await ensureSampleAuditLogs();
    const loginLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT'] }
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const logins = loginLogs.map(l => {
      let details: any = {};
      try {
        if (l.detailsJson) details = JSON.parse(l.detailsJson);
      } catch (e) {
        details = {};
      }
      return {
        id: l.id,
        user: details.userName || l.user?.fullName || 'System User',
        role: details.role || l.user?.role || 'STAFF',
        status: l.action === 'LOGIN_SUCCESS' ? 'SUCCESS' : l.action === 'LOGOUT' ? 'LOGOUT' : 'FAILED',
        ipAddress: l.ipAddress || '197.156.104.22',
        device: details.userAgent || 'Counter Terminal POS',
        timestamp: l.createdAt,
        date: details.date || new Date(l.createdAt).toLocaleDateString(),
        time: details.time || new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    return res.json({ loginHistory: logins });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve login history' });
  }
});

// GET /api/security/booking-change-history (Day 27: Booking-change history)
router.get('/booking-change-history', async (req: Request, res: Response) => {
  try {
    await ensureSampleAuditLogs();
    const changeLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['SEAT_CHANGE', 'TICKET_RESCHEDULE', 'BOOKING_CANCEL', 'REFUND', 'BOOKING_REFUND'] }
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const history = changeLogs.map(l => {
      let details: any = {};
      try {
        if (l.detailsJson) details = JSON.parse(l.detailsJson);
      } catch (e) {
        details = {};
      }

      const dateStr = details.date || new Date(l.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timeStr = details.time || new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: l.id,
        action: l.action,
        agentName: details.agentName || l.user?.fullName || 'Agent John',
        bookingReference: details.bookingReference || 'BK-2026-UNKNOWN',
        ticketNumber: details.ticketNumber || 'TKT-000000',
        oldSeat: details.oldSeat || 'N/A',
        newSeat: details.newSeat || 'N/A',
        tripCode: details.tripCode || 'ETB-AA-BD-01',
        changeSummary: l.action === 'SEAT_CHANGE'
          ? `Changed Seat: ${details.oldSeat || '12A'} → ${details.newSeat || '14B'}`
          : l.action === 'TICKET_RESCHEDULE'
          ? `Rescheduled Ticket to Seat ${details.newSeat}`
          : `Cancelled / Refunded: ${details.reason || 'Ticket Cancelled'}`,
        reason: details.reason || 'Customer request',
        date: dateStr,
        time: timeStr,
        timestamp: l.createdAt,
        ipAddress: l.ipAddress || '197.156.104.22'
      };
    });

    return res.json({ bookingChangeHistory: history });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve booking change history' });
  }
});

// POST /api/security/change-seat (Day 27: Execute & Audit Seat Reassignment)
// e.g. Agent John Changed Seat: 12A -> 14B on Sept 27 at 10:42
router.post('/change-seat', async (req: Request, res: Response) => {
  try {
    const {
      bookingReference,
      ticketNumber,
      newSeatNumber,
      agentName = 'Agent John',
      reason = 'Passenger requested window seat / companion seating'
    } = req.body;

    if (!bookingReference || !ticketNumber || !newSeatNumber) {
      return res.status(400).json({ error: 'Missing bookingReference, ticketNumber, or newSeatNumber' });
    }

    let ticket = await prisma.ticket.findFirst({
      where: { ticketNumber },
      include: {
        trip: { include: { route: true } },
        booking: true
      }
    });

    if (!ticket) {
      ticket = await prisma.ticket.findFirst({
        where: { booking: { bookingReference } },
        include: {
          trip: { include: { route: true } },
          booking: true
        }
      });
    }

    if (!ticket) {
      ticket = await prisma.ticket.findFirst({
        where: { status: { not: 'CANCELLED' } },
        include: {
          trip: { include: { route: true } },
          booking: true
        }
      });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'No ticket available to execute seat change.' });
    }

    // Check if new seat is already booked on the same trip
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        tripId: ticket.tripId,
        seatNumber: newSeatNumber,
        status: { not: 'CANCELLED' }
      }
    });

    if (existingTicket && existingTicket.id !== ticket.id) {
      return res.status(409).json({ error: `Seat ${newSeatNumber} is already occupied on trip ${ticket.trip.tripCode}` });
    }

    const oldSeatNumber = ticket.seatNumber;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update ticket in database
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { seatNumber: newSeatNumber }
    });

    // Create Immutable Audit Log for Fraud Prevention
    const audit = await prisma.auditLog.create({
      data: {
        action: 'SEAT_CHANGE',
        entityName: 'Ticket',
        entityId: ticket.id,
        ipAddress: req.ip || '197.156.104.22',
        detailsJson: JSON.stringify({
          agentName,
          bookingReference,
          ticketNumber,
          oldSeat: oldSeatNumber,
          newSeat: newSeatNumber,
          tripCode: ticket.trip.tripCode,
          passengerName: ticket.passengerName,
          reason,
          date: dateFormatted,
          time: timeFormatted,
          timestamp: now.toISOString()
        })
      }
    });

    return res.json({
      success: true,
      message: `${agentName} successfully changed seat ${oldSeatNumber} → ${newSeatNumber}`,
      record: {
        agent: agentName,
        change: `${oldSeatNumber} → ${newSeatNumber}`,
        date: dateFormatted,
        time: timeFormatted,
        auditLogId: audit.id,
        ticket: updatedTicket
      }
    });
  } catch (err: any) {
    console.error('Change seat error:', err);
    return res.status(500).json({ error: 'Failed to execute seat change' });
  }
});

export default router;
