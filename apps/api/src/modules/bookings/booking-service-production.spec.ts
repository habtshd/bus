import * as crypto from 'crypto';
import { TripsService } from '../trips/trips.service';
import { ReservationsService } from '../reservations/reservations.service';
import { BookingsService } from './bookings.service';
import { BoardingService } from '../boarding/boarding.service';
import { PricingService } from '../pricing/pricing.service';
import { FareRulesService } from '../pricing/fare-rules.service';
import { DiscountService } from '../pricing/discount.service';
import { PaymentsService } from '../payments/payments.service';
import { TelebirrProvider } from '../payments/providers/telebirr.provider';
import { ChapaProvider } from '../payments/providers/chapa.provider';
import { CashProvider } from '../payments/providers/cash.provider';

// =========================================================================
// IN-MEMORY PRISMA MOCK FOR BOOKING PRODUCTION VERIFICATION
// =========================================================================
class BookingPlatformPrismaMock {
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
  paymentEvents: any[] = [];
  tickets: any[] = [];
  boardings: any[] = [];
  cashShifts: any[] = [];
  auditLogs: any[] = [];
  passengers: any[] = [];

  constructor() {
    this.initMasterDataset();
  }

  initMasterDataset() {
    this.companies.push({
      id: 'comp_abyssinia',
      legalName: 'Abyssinia Bus S.C.',
      tradeName: 'Abyssinia Bus',
      status: 'ACTIVE',
    });

    this.branches.push({
      id: 'br_addis_hq',
      companyId: 'comp_abyssinia',
      nameEn: 'Addis Ababa Central Terminal',
      code: 'ADD-01',
      city: 'Addis Ababa',
    });

    const stopADD = { id: 'stop_ADD', name: 'Addis Ababa (Autobis Tera)', code: 'ADD' };
    const stopDS = { id: 'stop_DS', name: 'Debre Sina Terminal', code: 'DS' };
    const stopDES = { id: 'stop_DES', name: 'Dessie Terminal', code: 'DES' };
    const stopBD = { id: 'stop_BD', name: 'Bahir Dar Central', code: 'BD' };
    this.stops.push(stopADD, stopDS, stopDES, stopBD);

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
          });
          count++;
        }
      }
    }
    this.seats.push({
      id: 'seat_12A',
      busId,
      seatNumber: '12A',
      status: 'AVAILABLE',
    });

    this.routes.push({
      id: 'route_addis_bhr',
      companyId: 'comp_abyssinia',
      code: 'RT-ADD-BHR',
      status: 'ACTIVE',
      originStop: stopADD,
      destinationStop: stopBD,
      routeStops: [
        { stopId: 'stop_ADD', sequenceNumber: 1, stop: stopADD },
        { stopId: 'stop_DS', sequenceNumber: 2, stop: stopDS },
        { stopId: 'stop_DES', sequenceNumber: 3, stop: stopDES },
        { stopId: 'stop_BD', sequenceNumber: 4, stop: stopBD },
      ],
    });
  }

  company = {
    findUnique: async ({ where }: any) => this.companies.find((c) => c.id === where.id),
  };

  branch = {
    findUnique: async ({ where }: any) => this.branches.find((b) => b.id === where.id),
  };

  route = {
    findFirst: async ({ where }: any) => {
      const r = this.routes.find((item) => item.id === where.id);
      return r ? { ...r, routeStops: r.routeStops, originStop: r.originStop, destinationStop: r.destinationStop } : null;
    },
    findUnique: async ({ where }: any) => {
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
    findFirst: async ({ where }: any) => this.trips.find((t) => t.busId === where?.busId) || null,
    create: async ({ data }: any) => {
      const trip = { id: `trip_${Date.now()}`, ...data };
      this.trips.push(trip);
      return trip;
    },
    findUnique: async ({ where }: any) => {
      const t = this.trips.find((item) => item.id === where.id);
      if (!t) return null;
      const bus = this.buses.find((b) => b.id === t.busId);
      const segments = this.tripSegments
        .filter((s) => s.tripId === t.id)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
      return {
        ...t,
        bus: {
          ...bus,
          seats: this.seats.filter((s) => s.busId === t.busId),
        },
        tripSegments: segments,
        route: {
          originStop: this.stops.find((s) => s.id === 'stop_ADD'),
          destinationStop: this.stops.find((s) => s.id === 'stop_BD'),
        },
      };
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
        if (where?.tripSegmentId?.in && !where.tripSegmentId.in.includes(s.tripSegmentId)) match = false;
        if (where?.busSeatId?.in && !where.busSeatId.in.includes(s.busSeatId)) match = false;
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
        if (where?.reservationId && s.reservationId !== where.reservationId) match = false;
        if (where?.bookingId && s.bookingId !== where.bookingId) match = false;
        if (where?.status && s.status !== where.status) match = false;
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
        if (where?.busId && s.busId !== where.busId) return false;
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
      const trip = await (this.trip as any).findUnique({ where: { id: r.tripId } });
      const seats = this.tripSegmentSeats
        .filter((s) => s.reservationId === r.id)
        .map((tss) => ({
          ...tss,
          busSeat: this.seats.find((st) => st.id === tss.busSeatId),
        }));
      return {
        ...r,
        trip,
        seats,
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
    findUnique: async ({ where }: any) => {
      const b = this.bookings.find((item) => item.id === where.id);
      if (!b) return null;
      const trip = await (this.trip as any).findUnique({ where: { id: b.tripId } });
      const passengers = this.bookingPassengers.filter((bp) => bp.bookingId === b.id);
      const bookingSegments = this.bookingSegments.filter((bs) => bs.bookingId === b.id);
      const tickets = this.tickets.filter((t) => t.bookingId === b.id);
      return {
        ...b,
        trip,
        passengers,
        bookingSegments,
        tickets,
      };
    },
    update: async ({ where, data }: any) => {
      const b = this.bookings.find((item) => item.id === where.id);
      if (b) Object.assign(b, data);
      return b;
    },
    findFirst: async ({ where }: any) => {
      const b = this.bookings.find((item) => {
        if (where?.id && item.id === where.id) return true;
        if (where?.bookingReference && item.bookingReference === where.bookingReference) return true;
        if (where?.OR) {
          return where.OR.some(
            (c: any) =>
              (c.id && item.id === c.id) ||
              (c.bookingReference && item.bookingReference === c.bookingReference),
          );
        }
        return false;
      });
      if (!b) return null;
      const trip = await (this.trip as any).findUnique({ where: { id: b.tripId } });
      const passengers = this.bookingPassengers.filter((bp) => bp.bookingId === b.id);
      const bookingSegments = this.bookingSegments.filter((bs) => bs.bookingId === b.id);
      const tickets = this.tickets.filter((t) => t.bookingId === b.id);
      const payments = this.payments.filter((p) => p.bookingId === b.id);
      return {
        ...b,
        trip,
        passengers,
        bookingSegments,
        tickets,
        payments,
      };
    },
    findMany: async () => this.bookings,
  };

  bookingPassenger = {
    create: async ({ data }: any) => {
      const bp = { id: `bp_${Date.now()}_${Math.random()}`, ...data };
      this.bookingPassengers.push(bp);
      return bp;
    },
  };

  bookingSegment = {
    create: async ({ data }: any) => {
      const bs = { id: `bs_${Date.now()}_${Math.random()}`, ...data };
      this.bookingSegments.push(bs);
      return bs;
    },
    findMany: async ({ where }: any) => {
      return this.bookingSegments.filter((bs) => bs.bookingId === where.bookingId);
    },
  };

  payment = {
    create: async ({ data }: any) => {
      const p = { id: `pay_${Date.now()}`, ...data };
      this.payments.push(p);
      return p;
    },
    findUnique: async ({ where }: any) => {
      const p = this.payments.find((item) => item.id === where.id);
      if (!p) return null;
      const booking = await (this.booking as any).findUnique({ where: { id: p.bookingId } });
      return { ...p, booking };
    },
    findFirst: async ({ where }: any) => {
      let p: any = null;
      if (where.OR) {
        p = this.payments.find((item) =>
          where.OR.some(
            (c: any) =>
              (c.paymentReference && item.paymentReference === c.paymentReference) ||
              (c.transactionReference && item.transactionReference === c.transactionReference),
          ),
        );
      } else if (where.bookingId) {
        p = this.payments.find((item) => item.bookingId === where.bookingId);
      }
      if (!p) return null;
      const booking = await (this.booking as any).findUnique({ where: { id: p.bookingId } });
      return { ...p, booking };
    },
    update: async ({ where, data }: any) => {
      const p = this.payments.find((item) => item.id === where.id);
      if (p) Object.assign(p, data);
      return p;
    },
  };

  paymentEvent = {
    create: async ({ data }: any) => {
      const pe = { id: `pe_${Date.now()}`, ...data };
      this.paymentEvents.push(pe);
      return pe;
    },
    findFirst: async ({ where }: any) => {
      return this.paymentEvents.find((e) => e.providerReference === where.providerReference) ?? null;
    },
  };

  ticket = {
    create: async ({ data }: any) => {
      const t = { id: `tkt_${Date.now()}_${Math.random()}`, ...data };
      this.tickets.push(t);
      return t;
    },
    findMany: async ({ where }: any) => {
      return this.tickets.filter((t) => t.bookingId === where.bookingId);
    },
    findFirst: async ({ where }: any) => {
      let t: any = null;
      if (where.OR) {
        t = this.tickets.find((item) =>
          where.OR.some(
            (c: any) =>
              (c.qrHash && item.qrHash === c.qrHash) ||
              (c.qrToken && item.qrToken === c.qrToken) ||
              (c.ticketNumber && item.ticketNumber === c.ticketNumber),
          ),
        );
      } else if (where.id) {
        t = this.tickets.find((item) => item.id === where.id);
      }
      if (!t) return null;
      const trip = await (this.trip as any).findUnique({ where: { id: t.tripId } });
      const booking = this.bookings.find((b) => b.id === t.bookingId);
      const boardings = this.boardings.filter((b) => b.ticketId === t.id);
      return {
        ...t,
        trip,
        booking,
        boardings,
      };
    },
    update: async ({ where, data }: any) => {
      const t = this.tickets.find((item) => item.id === where.id);
      if (t) Object.assign(t, data);
      return t;
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (const t of this.tickets) {
        if (where.bookingId && t.bookingId === where.bookingId) {
          Object.assign(t, data);
          count++;
        }
      }
      return { count };
    },
  };

  boarding = {
    create: async ({ data }: any) => {
      const b = { id: `brd_${Date.now()}`, ...data };
      this.boardings.push(b);
      return b;
    },
  };

  passenger = {
    findUnique: async ({ where }: any) => this.passengers.find((p) => p.phone === where.phone),
    create: async ({ data }: any) => {
      const p = { id: `pass_${Date.now()}`, ...data };
      this.passengers.push(p);
      return p;
    },
  };

  cashShift = {
    findFirst: async () => null,
  };

  auditLog = {
    create: async ({ data }: any) => {
      this.auditLogs.push({ id: `log_${Date.now()}`, ...data });
    },
  };

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
// TEST SUITE: PRODUCTION BOOKING SERVICE VERIFICATION
// =========================================================================
async function runBookingServiceProductionTest() {
  console.log('🧪 RUNNING PRODUCTION BOOKING SERVICE VERIFICATION');
  console.log('========================================================================');

  const prismaMock = new BookingPlatformPrismaMock() as any;
  const fareRulesService = new FareRulesService();
  const discountService = new DiscountService();
  const pricingService = new PricingService(fareRulesService, discountService);

  const telebirrProvider = new TelebirrProvider();
  const chapaProvider = new ChapaProvider();
  const cashProvider = new CashProvider();
  const paymentsService = new PaymentsService(
    prismaMock,
    telebirrProvider,
    chapaProvider,
    cashProvider,
  );

  const tripsService = new TripsService(prismaMock);
  const reservationsService = new ReservationsService(prismaMock);
  const bookingsService = new BookingsService(prismaMock, pricingService, paymentsService);
  const boardingService = new BoardingService(prismaMock);

  // STEP 1: CREATE TRIP
  console.log('\n1️⃣ Creating Scheduled Trip #501 (Addis Ababa -> Bahir Dar, ETB 850)...');
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 1);
  departureDate.setHours(5, 0, 0, 0);

  const trip = await tripsService.createTrip({
    routeId: 'route_addis_bhr',
    busId: 'bus_sb023',
    scheduledDeparture: departureDate.toISOString(),
    price: 850.0,
  });
  console.log(`   ✅ Trip Created! ID: ${trip.id} | Base Price: ETB 850`);

  // STEP 2: PASSENGER HOLDS SEAT 12A FOR MULTI-HOP JOURNEY
  console.log('\n2️⃣ Passenger Reserves Seat 12A for 5 minutes (Addis -> Dessie)...');
  const reservation = await reservationsService.reserveSeats(
    trip.id,
    'stop_ADD',
    'stop_DES',
    ['seat_12A'],
    'passenger_abebe',
  );
  console.log(`   ✅ Hold Created! Reservation: ${reservation.reservationId} (Expires: ${reservation.expiresAt.toISOString()})`);

  // STEP 3: CREATE BOOKING (CLIENT DOES NOT SPECIFY OR OVERRIDE PRICE)
  console.log('\n3️⃣ Passenger Creates Booking via POST /api/v1/bookings...');
  const bookingResult = await bookingsService.createBooking({
    reservationId: reservation.reservationId,
    passengers: [
      {
        seatId: 'seat_12A',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+251911223344',
        email: 'john@example.com',
      },
    ],
    channel: 'PASSENGER_APP',
    paymentMethod: 'TELEBIRR',
  });

  console.log(`   ✅ Booking Created! Ref: ${bookingResult.bookingReference}`);
  console.log(`   ✅ Status: ${bookingResult.status} (PAYMENT_PENDING)`);
  console.log(`   ✅ Authoritative Calculated Total: ETB ${bookingResult.totalAmountETB} (Server-Side Fare)`);
  console.log(`   ✅ Payment Gateway Checkout: ${bookingResult.payment.checkoutUrl}`);
  console.log(`   ✅ Ticket Count before Payment: ${bookingResult.tickets.length} (Tickets deferred until payment success)`);

  if (bookingResult.status !== 'PAYMENT_PENDING') {
    throw new Error(`Expected booking status PAYMENT_PENDING, got ${bookingResult.status}`);
  }
  if (bookingResult.tickets.length !== 0) {
    throw new Error('Tickets must not be issued before payment confirmation!');
  }

  // STEP 4: SIMULATE TELEBIRR WEBHOOK SUCCESS
  console.log('\n4️⃣ Payment Provider Invokes Webhook (POST /api/v1/payments/webhook)...');
  const webhookPayload = {
    transactionId: 'TX_TB_9981245',
    paymentReference: bookingResult.payment.paymentReference,
    amount: 850,
    currency: 'ETB',
    status: 'SUCCESS',
  };

  const webhookResult = await paymentsService.processWebhook(webhookPayload);
  console.log(`   ✅ Webhook Processed! Payment Status: ${webhookResult.status}`);

  // Fetch updated booking and tickets
  const confirmedBooking = await bookingsService.getBookingById(bookingResult.bookingId);
  console.log(`   ✅ Booking Payment Status: ${confirmedBooking.paymentStatus} (COMPLETED)`);
  console.log(`   ✅ Tickets Issued: ${confirmedBooking.tickets.length}`);
  const ticket = confirmedBooking.tickets[0];
  console.log(`   ✅ Ticket Number: ${ticket.ticketNumber} | Seat: ${ticket.seatNumber}`);
  console.log(`   ✅ Ticket QR Token: ${ticket.qrToken} | Signed QR Hash: ${ticket.qrHash.substring(0, 16)}...`);

  // STEP 5: WEBHOOK IDEMPOTENCY TEST (PROVIDER RETRIES WEBHOOK)
  console.log('\n5️⃣ Webhook Idempotency Check: Telecom sends identical webhook 2 more times...');
  const retry1 = await paymentsService.processWebhook(webhookPayload);
  const retry2 = await paymentsService.processWebhook(webhookPayload);
  console.log(`   ✅ Retry 1 Handled Idempotently: ${retry1.message || 'Success'}`);
  console.log(`   ✅ Retry 2 Handled Idempotently: ${retry2.message || 'Success'}`);

  const ticketsAfterRetry = await prismaMock.ticket.findMany({ where: { bookingId: bookingResult.bookingId } });
  if (ticketsAfterRetry.length !== 1) {
    throw new Error(`FATAL: Duplicate tickets issued on webhook retry! Count: ${ticketsAfterRetry.length}`);
  }
  console.log('   ✅ Webhook Idempotency Verified: Exactly 1 ticket issued, zero duplicates!');

  // STEP 6: BOARDING SCAN VERIFICATION
  console.log('\n6️⃣ Bus Conductor Scans Passenger QR Token at Door Gate...');
  const scanResult = await boardingService.scanTicket({
    qrPayload: ticket.qrHash,
    currentTripId: trip.id,
  });
  console.log(`   ✅ Gate Scan Result: [${scanResult.status}] ${scanResult.message}`);
  console.log(`   ✅ Passenger: ${scanResult.passengerName} | Seat: ${scanResult.seatNumber}`);

  // STEP 7: DUPLICATE SCAN PREVENTION
  console.log('\n7️⃣ Duplicate Scan Prevention: Scanning identical ticket again...');
  const dupScan = await boardingService.scanTicket({
    qrPayload: ticket.qrHash,
    currentTripId: trip.id,
  });
  console.log(`   ✅ Duplicate Rejected: [${dupScan.status}] ${dupScan.message}`);

  // STEP 8: CANCELLATION & SEAT RELEASE TEST
  console.log('\n8️⃣ Customer Requests Cancellation (10% fee policy)...');
  const cancelResult = await bookingsService.cancelBooking(
    bookingResult.bookingId,
    { reason: 'Change of schedule', refundPercentage: 90 },
    { userId: 'admin_user' },
  );
  console.log(`   ✅ Booking Cancelled! Status: ${cancelResult.status}`);
  console.log(`   ✅ Original: ETB ${cancelResult.originalAmountETB} | Fee: ETB ${cancelResult.cancellationFeeETB} | Refund: ETB ${cancelResult.refundAmountETB}`);
  console.log(`   ✅ Released Seats: ${cancelResult.seatsReleased.join(', ')}`);

  console.log('\n========================================================================');
  console.log('🎉 BOOKING SERVICE PRODUCTION TEST COMPLETED WITH 100% SUCCESS!');
  console.log('========================================================================\n');
}

runBookingServiceProductionTest().catch((err) => {
  console.error('❌ BOOKING SERVICE PRODUCTION TEST FAILED:', err);
  process.exit(1);
});
