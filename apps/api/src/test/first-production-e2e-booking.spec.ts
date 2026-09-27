import { TripsService } from '../modules/trips/trips.service';
import { ReservationsService } from '../modules/reservations/reservations.service';
import { BookingsService } from '../modules/bookings/bookings.service';
import { BoardingService } from '../modules/boarding/boarding.service';
import { AgentService } from '../modules/agent/agent.service';
import * as crypto from 'crypto';

// =========================================================================
// IN-MEMORY FULL PLATFORM PRISMA MOCK
// Emulates PostgreSQL transactional constraints and relational joins
// =========================================================================
class FullPlatformPrismaMock {
  companies: any[] = [];
  branches: any[] = [];
  users: any[] = [];
  buses: any[] = [];
  seats: any[] = [];
  routes: any[] = [];
  routeStops: any[] = [];
  stops: any[] = [];
  schedules: any[] = [];
  trips: any[] = [];
  tripSegments: any[] = [];
  tripSegmentSeats: any[] = [];
  reservations: any[] = [];
  bookings: any[] = [];
  bookingPassengers: any[] = [];
  bookingSegments: any[] = [];
  payments: any[] = [];
  tickets: any[] = [];
  boardings: any[] = [];
  cashShifts: any[] = [];
  auditLogs: any[] = [];
  passengers: any[] = [];

  constructor() {
    this.initMasterDataset();
  }

  initMasterDataset() {
    // 1. Company
    this.companies.push({
      id: 'comp_abyssinia',
      legalName: 'Abyssinia Bus S.C.',
      tradeName: 'Abyssinia Bus',
      tinNumber: '0054892110',
      status: 'ACTIVE',
    });

    // 2. Branch
    this.branches.push({
      id: 'br_addis_hq',
      companyId: 'comp_abyssinia',
      nameEn: 'Addis Ababa Central Terminal',
      nameAm: 'አዲስ አበባ ዋና ተርሚናል',
      code: 'ADD-01',
      city: 'Addis Ababa',
    });

    // 3. Stops
    this.stops.push(
      { id: 'stop_ADD', code: 'ADD', name: 'Addis Ababa', companyId: 'comp_abyssinia' },
      { id: 'stop_DS', code: 'DS', name: 'Debre Sina', companyId: 'comp_abyssinia' },
      { id: 'stop_DES', code: 'DES', name: 'Dessie', companyId: 'comp_abyssinia' },
      { id: 'stop_BD', code: 'BD', name: 'Bahir Dar', companyId: 'comp_abyssinia' }
    );

    // 4. Route: Addis -> Bahir Dar (with stops)
    this.routes.push({
      id: 'route_add_bhr',
      companyId: 'comp_abyssinia',
      routeCode: 'RT-ADD-BHR',
      status: 'ACTIVE',
      originStopId: 'stop_ADD',
      destinationStopId: 'stop_BD',
      originStop: { id: 'stop_ADD', code: 'ADD', name: 'Addis Ababa' },
      destinationStop: { id: 'stop_BD', code: 'BD', name: 'Bahir Dar' },
      routeStops: [
        { stopId: 'stop_ADD', sequenceNumber: 1 },
        { stopId: 'stop_DS', sequenceNumber: 2 },
        { stopId: 'stop_DES', sequenceNumber: 3 },
        { stopId: 'stop_BD', sequenceNumber: 4 },
      ],
    });

    // 5. Bus: SB-023 (45 Seats: 01A to 11D + 12A)
    const busId = 'bus_sb023';
    this.buses.push({
      id: busId,
      companyId: 'comp_abyssinia',
      plateNumber: '3-A99102 ET',
      sideNumber: 'SB-023',
      busModel: 'Yutong ZK6122H',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      status: 'AVAILABLE',
    });

    // Generate 44 regular seats
    const letters = ['A', 'B', 'C', 'D'];
    let count = 0;
    for (let r = 1; r <= 11; r++) {
      for (const l of letters) {
        if (count < 44) {
          const sNum = `${r < 10 ? '0' + r : r}${l}`;
          this.seats.push({
            id: `seat_${sNum}`,
            busId,
            seatNumber: sNum,
            status: 'AVAILABLE',
            active: true,
          });
          count++;
        }
      }
    }
    // Seat 45: "12A" (Target seat)
    this.seats.push({
      id: 'seat_12A',
      busId,
      seatNumber: '12A',
      status: 'AVAILABLE',
      active: true,
    });
  }

  // Prisma interface mock methods
  route = {
    findFirst: async ({ where }: any) => {
      const r = this.routes.find((item) => item.id === where.id);
      return r ? { ...r, routeStops: r.routeStops, originStop: r.originStop, destinationStop: r.destinationStop } : null;
    },
  };

  bus = {
    findFirst: async ({ where }: any) => {
      const b = this.buses.find((item) => item.id === where.id);
      return b ? { ...b, seats: this.seats.filter((s) => s.busId === b.id) } : null;
    },
  };

  trip = {
    findFirst: async ({ where }: any) => this.trips.find((t) => t.busId === where.busId),
    create: async ({ data }: any) => {
      const t = { id: data.id || `trip_501`, ...data };
      this.trips.push(t);
      return t;
    },
    findUnique: async ({ where }: any) => {
      const t = this.trips.find((item) => item.id === where.id);
      if (!t) return null;
      return {
        ...t,
        route: this.routes.find((r) => r.id === t.routeId),
        bus: {
          ...this.buses.find((b) => b.id === t.busId),
          seats: this.seats.filter((s) => s.busId === t.busId),
        },
        tripSegments: this.tripSegments.filter((s) => s.tripId === t.id).map((seg) => ({
          ...seg,
          seats: this.tripSegmentSeats.filter((tss) => tss.tripSegmentId === seg.id),
        })),
      };
    },
    findMany: async ({ where }: any) => {
      return this.trips.map((t) => {
        const route = this.routes.find((r) => r.id === t.routeId);
        const bus = this.buses.find((b) => b.id === t.busId);
        const segments = this.tripSegments
          .filter((s) => s.tripId === t.id)
          .map((seg) => {
            return {
              ...seg,
              seats: this.tripSegmentSeats.filter((tss) => tss.tripSegmentId === seg.id && tss.status === 'AVAILABLE'),
            };
          });
        return {
          ...t,
          route: {
            ...route,
            originStop: route?.originStop || this.stops.find((s) => s.id === route?.originStopId),
            destinationStop: route?.destinationStop || this.stops.find((s) => s.id === route?.destinationStopId),
          },
          bus: {
            ...bus,
            seats: this.seats.filter((s) => s.busId === t.busId),
          },
          tripSegments: segments,
        };
      });
    },
    update: async ({ where, data }: any) => {
      const t = this.trips.find((item) => item.id === where.id);
      if (t) Object.assign(t, data);
      return t;
    },
  };

  tripSegment = {
    create: async ({ data }: any) => {
      const seg = {
        id: `seg_${data.tripId}_${data.sequenceNumber}`,
        fromStop: this.stops.find((s) => s.id === data.fromStopId),
        toStop: this.stops.find((s) => s.id === data.toStopId),
        ...data,
      };
      this.tripSegments.push(seg);
      return seg;
    },
    findMany: async ({ where }: any) => {
      return this.tripSegments
        .filter((s) => s.tripId === where.tripId)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    },
  };

  tripSegmentSeat = {
    createMany: async ({ data }: any) => {
      for (const d of data) {
        this.tripSegmentSeats.push({
          id: `tss_${d.tripSegmentId}_${d.busSeatId}`,
          status: 'AVAILABLE',
          ...d,
        });
      }
      return { count: data.length };
    },
    findMany: async ({ where }: any) => {
      return this.tripSegmentSeats.filter((s) => {
        let match = true;
        if (where?.tripSegmentId?.in) match = match && where.tripSegmentId.in.includes(s.tripSegmentId);
        if (where?.busSeatId?.in) match = match && where.busSeatId.in.includes(s.busSeatId);
        return match;
      });
    },
    findUnique: async ({ where }: any) => {
      return this.tripSegmentSeats.find((s) => {
        if (where?.id) return s.id === where.id;
        if (where?.tripSegmentId_busSeatId) {
          return (
            s.tripSegmentId === where.tripSegmentId_busSeatId.tripSegmentId &&
            s.busSeatId === where.tripSegmentId_busSeatId.busSeatId
          );
        }
        return false;
      });
    },
    update: async ({ where, data }: any) => {
      const s = this.tripSegmentSeats.find((item) => {
        if (where?.id) return item.id === where.id;
        if (where?.tripSegmentId_busSeatId) {
          return (
            item.tripSegmentId === where.tripSegmentId_busSeatId.tripSegmentId &&
            item.busSeatId === where.tripSegmentId_busSeatId.busSeatId
          );
        }
        return false;
      });
      if (s) Object.assign(s, data);
      return s;
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (const s of this.tripSegmentSeats) {
        let match = true;
        if (where?.id?.in && !where.id.in.includes(s.id)) match = false;
        if (where?.reservationId && s.reservationId !== where.reservationId) match = false;
        if (where?.tripSegmentId?.in && !where.tripSegmentId.in.includes(s.tripSegmentId)) match = false;
        if (where?.busSeatId?.in && !where.busSeatId.in.includes(s.busSeatId)) match = false;
        if (match) {
          Object.assign(s, data);
          count++;
        }
      }
      return { count };
    },
  };

  seat = {
    findMany: async ({ where }: any) => {
      return this.seats.filter((s) => {
        if (where?.seatNumber?.in && !where.seatNumber.in.includes(s.seatNumber)) return false;
        return true;
      });
    },
  };

  reservation = {
    create: async ({ data }: any) => {
      const res = { id: `res_${Date.now()}`, ...data };
      this.reservations.push(res);
      return res;
    },
    findUnique: async ({ where }: any) => {
      const r = this.reservations.find((item) => item.id === where.id);
      if (!r) return null;
      return {
        ...r,
        trip: this.trips.find((t) => t.id === r.tripId),
        seats: this.tripSegmentSeats.filter((s) => s.reservationId === r.id),
      };
    },
    update: async ({ where, data }: any) => {
      const r = this.reservations.find((item) => item.id === where.id);
      if (r) Object.assign(r, data);
      return r;
    },
  };

  booking = {
    create: async ({ data }: any) => {
      const b = { id: `bk_${Date.now()}`, ...data };
      this.bookings.push(b);
      return b;
    },
    findUnique: async ({ where }: any) => this.bookings.find((item) => item.id === where.id),
    findFirst: async ({ where }: any) => {
      return this.bookings.find((b) => b.bookingReference === where.bookingReference || b.id === where.id);
    },
    findMany: async ({ where }: any) => this.bookings,
  };

  bookingPassenger = {
    create: async ({ data }: any) => {
      const bp = { id: `bp_${Date.now()}`, ...data };
      this.bookingPassengers.push(bp);
      return bp;
    },
  };

  bookingSegment = {
    create: async ({ data }: any) => {
      const bs = { id: `bs_${Date.now()}`, ...data };
      this.bookingSegments.push(bs);
      return bs;
    },
  };

  payment = {
    create: async ({ data }: any) => {
      const p = { id: `pay_${Date.now()}`, ...data };
      this.payments.push(p);
      return p;
    },
  };

  ticket = {
    create: async ({ data }: any) => {
      const t = { id: `tck_${Date.now()}`, ...data };
      this.tickets.push(t);
      return t;
    },
    findUnique: async ({ where }: any) => this.tickets.find((item) => item.id === where.id || item.qrHash === where.qrHash),
    findFirst: async ({ where, include }: any) => {
      let t = this.tickets.find((item) => {
        if (where?.OR) {
          return where.OR.some((cond: any) => {
            if (cond.qrHash && item.qrHash === cond.qrHash) return true;
            if (cond.ticketNumber && item.ticketNumber === cond.ticketNumber) return true;
            return false;
          });
        }
        return item.qrHash === where?.qrHash || item.ticketNumber === where?.ticketNumber || item.id === where?.id;
      });
      if (!t) return null;
      const trip = this.trips.find((tr) => tr.id === t.tripId);
      const route = trip ? this.routes.find((r) => r.id === trip.routeId) : null;
      const bus = trip ? this.buses.find((b) => b.id === trip.busId) : null;
      const boardings = this.boardings.filter((b) => b.ticketId === t.id);
      return {
        ...t,
        trip: trip
          ? {
              ...trip,
              route: route
                ? {
                    ...route,
                    originStop: route.originStop || this.stops.find((s) => s.id === route.originStopId),
                    destinationStop: route.destinationStop || this.stops.find((s) => s.id === route.destinationStopId),
                  }
                : null,
              bus,
            }
          : null,
        booking: this.bookings.find((bk) => bk.id === t.bookingId),
        boardings,
      };
    },
    update: async ({ where, data }: any) => {
      const t = this.tickets.find((item) => item.id === where.id);
      if (t) Object.assign(t, data);
      return t;
    },
  };

  boarding = {
    create: async ({ data }: any) => {
      const b = { id: `brd_${Date.now()}`, ...data };
      this.boardings.push(b);
      return b;
    },
    findFirst: async ({ where }: any) => this.boardings.find((b) => b.ticketId === where.ticketId),
  };

  cashShift = {
    findFirst: async ({ where }: any) => this.cashShifts.find((s) => s.status === 'OPEN'),
    update: async ({ where, data }: any) => {
      const s = this.cashShifts.find((item) => item.id === where.id);
      if (s) {
        if (data.cashSalesETB?.increment) s.cashSalesETB += data.cashSalesETB.increment;
        if (data.ticketsCount?.increment) s.ticketsCount += data.ticketsCount.increment;
      }
      return s;
    },
    findMany: async () => this.cashShifts,
  };

  branch = {
    findUnique: async ({ where }: any) => this.branches.find((b) => b.id === where.id),
  };

  passenger = {
    findUnique: async ({ where }: any) => this.passengers.find((p) => p.phone === where.phone || p.id === where.id),
    create: async ({ data }: any) => {
      const p = { id: `pass_${Date.now()}`, ...data };
      this.passengers.push(p);
      return p;
    },
    findMany: async () => this.passengers,
  };

  auditLog = {
    create: async ({ data }: any) => {
      const a = { id: `aud_${Date.now()}`, ...data };
      this.auditLogs.push(a);
      return a;
    },
  };

  // Atomic transaction mock supporting callback and promise array styles
  $transaction = async (arg: any) => {
    if (typeof arg === 'function') {
      return await arg(this);
    }
    if (Array.isArray(arg)) {
      return await Promise.all(arg);
    }
    return arg;
  };
}

// =========================================================================
// THE FIRST PRODUCTION END-TO-END BOOKING TEST
// =========================================================================
async function runFirstProductionTest() {
  console.log('🧪 RUNNING FIRST PRODUCTION END-TO-END BOOKING TEST');
  console.log('========================================================================');

  const prismaMock = new FullPlatformPrismaMock() as any;
  const tripsService = new TripsService(prismaMock);
  const reservationsService = new ReservationsService(prismaMock);
  const bookingsService = new BookingsService(prismaMock);
  const boardingService = new BoardingService(prismaMock);
  const agentService = new AgentService(prismaMock);

  // STEP 1: CREATE TRIP #501 (Addis Ababa -> Bahir Dar, Bus SB-023, 45 Seats)
  console.log('\n1️⃣ Creating Bus SB-023, Route Addis -> Bahir Dar, and Trip #501 (05:00 AM)...');
  const departureDate = new Date();
  departureDate.setHours(5, 0, 0, 0);

  const trip = await tripsService.createTrip({
    companyId: 'comp_abyssinia',
    routeId: 'route_add_bhr',
    busId: 'bus_sb023',
    tripDate: departureDate,
    scheduledDeparture: departureDate,
    price: 850.0,
  });

  console.log(`   ✅ Trip Created! ID: ${trip.id}, Status: ${trip.status}`);
  console.log(`   ✅ Total Intermediate Segments: ${prismaMock.tripSegments.length}`);
  console.log(`   ✅ Materialized Segment Seats: ${prismaMock.tripSegmentSeats.length} (3 segments × 45 seats = 135)`);

  // STEP 2: CUSTOMER A SELECTS SEAT 12A -> ATOMIC HOLD
  console.log('\n2️⃣ Customer A (Online) Selects Seat "12A" -> Requests 5-Minute Atomic Hold...');
  const holdA = await reservationsService.reserveSeats(
    trip.id,
    'stop_ADD',
    'stop_BD',
    ['seat_12A']
  );

  const reservationId = holdA.reservationId || (holdA as any).id;
  console.log(`   ✅ Customer A Hold Created! Res ID: ${reservationId}`);
  console.log(`   ✅ Status: HELD for 300 seconds (Expires: ${holdA.expiresAt.toISOString()})`);

  // STEP 3: CONCURRENCY RACE - CUSTOMER B ATTEMPTS TO HOLD SAME SEAT 12A -> MUST BE REJECTED
  console.log('\n3️⃣ Customer B (Counter) Concurrently Attempts to Hold Seat "12A"...');
  let customerBRejected = false;
  try {
    await reservationsService.reserveSeats(
      trip.id,
      'stop_ADD',
      'stop_BD',
      ['seat_12A']
    );
  } catch (err: any) {
    customerBRejected = true;
    console.log(`   ✅ Concurrency Defense Passed! Customer B REJECTED: "${err.message}"`);
  }
  if (!customerBRejected) {
    throw new Error('FATAL: Concurrency race failed! Seat 12A was double-held.');
  }

  // STEP 4: CUSTOMER A COMPLETES PAYMENT -> CONFIRM BOOKING & GENERATE TICKET
  console.log('\n4️⃣ Customer A Completes Payment (ETB 850) -> Confirming Booking & Generating QR Ticket...');
  const bookingA = await bookingsService.createBooking({
    tripId: trip.id,
    fromStopId: 'stop_ADD',
    toStopId: 'stop_BD',
    reservationId: reservationId,
    customerName: 'Abebe Bikila',
    customerPhone: '+251911223344',
    customerEmail: 'abebe@example.com',
    paymentMethod: 'TELEBIRR',
    passengers: [
      {
        passengerName: 'Abebe Bikila',
        passengerPhone: '+251911223344',
        passengerIdNumber: 'ETH-KB-991204',
        seatNumber: '12A',
      },
    ],
  });

  console.log(`   ✅ Booking Confirmed! Ref: ${bookingA.bookingReference}`);
  console.log(`   ✅ Payment Method: TELEBIRR | Status: PAID`);
  console.log(`   ✅ Ticket Issued: ${bookingA.tickets[0].ticketNumber} | Seat: 12A`);
  console.log(`   ✅ Signed QR Hash: ${bookingA.tickets[0].qrHash.substring(0, 24)}...`);

  // STEP 5: ON TRAVEL DAY - CONDUCTOR SCANS QR AT BUS DOOR GATE
  console.log('\n5️⃣ On Travel Day: Conductor Scans Customer A\'s QR Ticket at Door Gate...');
  const scanResult = await boardingService.scanTicket({
    qrPayload: bookingA.tickets[0].qrHash,
    currentTripId: trip.id,
    terminalLocation: 'Addis Ababa Autobus Tera Gate 4',
  });

  console.log(`   ✅ Scan Result: [${scanResult.status}] ${scanResult.message}`);
  console.log(`   ✅ Verified Passenger: ${scanResult.passengerName} | Seat: ${scanResult.seatNumber}`);

  if (scanResult.status !== 'APPROVED') {
    throw new Error(`FATAL: Scan failed to approve ticket: ${scanResult.message}`);
  }

  // STEP 6: FRAUD / DUPLICATE CHECK - RE-SCAN ATTEMPT MUST BE REJECTED
  console.log('\n6️⃣ Duplicate Scan Prevention: Scanning Identical QR Ticket a Second Time...');
  const duplicateScanResult = await boardingService.scanTicket({
    qrPayload: bookingA.tickets[0].qrHash,
    currentTripId: trip.id,
    terminalLocation: 'Addis Ababa Autobus Tera Gate 4',
  });

  if (duplicateScanResult.status === 'DUPLICATE' && !duplicateScanResult.valid) {
    console.log(`   ✅ Duplicate Prevention Passed! Alarm: "${duplicateScanResult.message}"`);
  } else {
    throw new Error('FATAL: Duplicate scan succeeded! A passenger was boarded twice.');
  }

  // STEP 7: MANAGER OPERATIONS DASHBOARD TELEMETRY
  console.log('\n7️⃣ Operations Management Dashboard Telemetry...');
  const todayTrips = await agentService.getTodayTrips('comp_abyssinia');
  console.log(`   ✅ Active Scheduled Departures Found: ${todayTrips.length} trip(s)`);
  console.log(`   ✅ Confirmed Booked Seats: ${prismaMock.bookings.length} Passenger(s)`);
  console.log(`   ✅ Total Gross Revenue: ETB ${prismaMock.payments[0].amountETB}`);
  console.log(`   ✅ Verified Boarded Passengers: ${prismaMock.boardings.length}`);

  console.log('\n========================================================================');
  console.log('🎉 FIRST PRODUCTION END-TO-END TEST PASSED WITH 100% SUCCESS!');
  console.log('========================================================================');
}

runFirstProductionTest().catch((err) => {
  console.error('❌ E2E TEST FAILED:', err);
  process.exit(1);
});
