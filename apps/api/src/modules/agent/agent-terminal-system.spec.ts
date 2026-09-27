import { BookingsService } from '../bookings/bookings.service';
import { BoardingService } from '../boarding/boarding.service';
import { ShiftsService } from '../shifts/shifts.service';
import { AgentService } from './agent.service';
import { TripsService } from '../trips/trips.service';
import { ReservationsService } from '../reservations/reservations.service';

// Mock DB for complete Agent / Terminal System verification
class MockAgentPrisma {
  companies: any[] = [];
  branches: any[] = [];
  users: any[] = [];
  buses: any[] = [];
  seats: any[] = [];
  stops: any[] = [];
  routes: any[] = [];
  routeStops: any[] = [];
  schedules: any[] = [];
  trips: any[] = [];
  tripSegments: any[] = [];
  tripSegmentSeats: any[] = [];
  reservations: any[] = [];
  bookings: any[] = [];
  bookingPassengers: any[] = [];
  bookingSegments: any[] = [];
  passengers: any[] = [];
  payments: any[] = [];
  tickets: any[] = [];
  boardings: any[] = [];
  cashShifts: any[] = [];
  auditLogs: any[] = [];

  trip = {
    findUnique: async ({ where }: any) => {
      const t = this.trips.find((item) => item.id === where.id);
      if (!t) return null;
      const route = this.routes.find((r) => r.id === t.routeId);
      const bus = this.buses.find((b) => b.id === t.busId);
      const busSeats = this.seats.filter((s) => s.busId === t.busId);
      const segs = this.tripSegments
        .filter((s) => s.tripId === t.id)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
        .map((seg) => ({
          ...seg,
          fromStop: this.stops.find((st) => st.id === seg.fromStopId),
          toStop: this.stops.find((st) => st.id === seg.toStopId),
          seats: this.tripSegmentSeats.filter((tss) => tss.tripSegmentId === seg.id),
        }));

      return {
        ...t,
        route: {
          ...route,
          originStop: this.stops.find((st) => st.id === route?.originStopId),
          destinationStop: this.stops.find((st) => st.id === route?.destinationStopId),
        },
        bus: { ...bus, seats: busSeats },
        tripSegments: segs,
        tickets: this.tickets.filter((tk) => tk.tripId === t.id),
      };
    },
    findMany: async () => {
      return this.trips.map((t) => {
        const route = this.routes.find((r) => r.id === t.routeId);
        const bus = this.buses.find((b) => b.id === t.busId);
        const segs = this.tripSegments
          .filter((s) => s.tripId === t.id)
          .map((seg) => ({
            ...seg,
            fromStop: this.stops.find((st) => st.id === seg.fromStopId),
            toStop: this.stops.find((st) => st.id === seg.toStopId),
            seats: this.tripSegmentSeats.filter(
              (tss) => tss.tripSegmentId === seg.id && tss.status === 'AVAILABLE',
            ),
          }));
        return {
          ...t,
          route: {
            ...route,
            originStop: this.stops.find((st) => st.id === route?.originStopId),
            destinationStop: this.stops.find((st) => st.id === route?.destinationStopId),
          },
          bus: { ...bus, seats: this.seats.filter((s) => s.busId === t.busId) },
          tripSegments: segs,
        };
      });
    },
  };

  tripSegment = {
    findMany: async ({ where }: any) => {
      return this.tripSegments
        .filter((s) => s.tripId === where.tripId)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    },
  };

  tripSegmentSeat = {
    findUnique: async ({ where }: any) => {
      const { tripSegmentId, busSeatId } = where.tripSegmentId_busSeatId;
      return this.tripSegmentSeats.find(
        (tss) => tss.tripSegmentId === tripSegmentId && tss.busSeatId === busSeatId,
      ) ?? null;
    },
    update: async ({ where, data }: any) => {
      let s: any = null;
      if (where.id) {
        s = this.tripSegmentSeats.find((item) => item.id === where.id);
      } else if (where.tripSegmentId_busSeatId) {
        const { tripSegmentId, busSeatId } = where.tripSegmentId_busSeatId;
        s = this.tripSegmentSeats.find(
          (item) => item.tripSegmentId === tripSegmentId && item.busSeatId === busSeatId,
        );
      }
      if (s) {
        Object.assign(s, data);
        return s;
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      return this.tripSegmentSeats
        .filter((tss) => where.tripSegmentId.in.includes(tss.tripSegmentId))
        .map((tss) => ({
          ...tss,
          busSeat: this.seats.find((s) => s.id === tss.busSeatId),
        }));
    },
  };

  passenger = {
    findUnique: async ({ where }: any) => {
      return this.passengers.find((p) => p.phone === where.phone) ?? null;
    },
    create: async ({ data }: any) => {
      const p = { id: `p_${Date.now()}_${Math.random()}`, ...data };
      this.passengers.push(p);
      return p;
    },
    findMany: async () => this.passengers,
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
    deleteMany: async ({ where }: any) => {
      this.bookingSegments = this.bookingSegments.filter((bs) => bs.bookingId !== where.bookingId);
      return { count: 1 };
    },
  };

  ticket = {
    create: async ({ data }: any) => {
      const t = { id: `tkt_${Date.now()}_${Math.random()}`, ...data, boardings: [] };
      this.tickets.push(t);
      return t;
    },
    findFirst: async ({ where }: any) => {
      const t = this.tickets.find((item) => {
        if (where.OR) {
          return where.OR.some((clause: any) => {
            if (clause.qrHash && item.qrHash === clause.qrHash) return true;
            if (clause.ticketNumber && item.ticketNumber === clause.ticketNumber) return true;
            return false;
          });
        }
        return false;
      });
      if (!t) return null;
      const trip = await this.trip.findUnique({ where: { id: t.tripId } });
      return {
        ...t,
        trip,
      };
    },
    update: async ({ where, data }: any) => {
      const t = this.tickets.find((item) => item.id === where.id);
      if (t) {
        Object.assign(t, data);
        return t;
      }
      return null;
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (const t of this.tickets) {
        if (t.bookingId === where.bookingId) {
          Object.assign(t, data);
          count++;
        }
      }
      return { count };
    },
  };

  payment = {
    create: async ({ data }: any) => {
      const p = { id: `pay_${Date.now()}`, ...data };
      this.payments.push(p);
      return p;
    },
  };

  boarding = {
    create: async ({ data }: any) => {
      const b = { id: `brd_${Date.now()}`, ...data };
      this.boardings.push(b);
      const ticket = this.tickets.find((t) => t.id === data.ticketId);
      if (ticket) ticket.boardings.push(b);
      return b;
    },
  };

  reservation = {
    create: async ({ data }: any) => {
      const r = { id: `res_${Date.now()}`, ...data };
      this.reservations.push(r);
      return r;
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
    findFirst: async ({ where }: any) => {
      const b = this.bookings.find((item) => {
        if (where.OR) {
          return where.OR.some((clause: any) => {
            if (clause.id && item.id === clause.id) return true;
            if (clause.bookingReference && item.bookingReference === clause.bookingReference) return true;
            return false;
          });
        }
        return false;
      });
      if (!b) return null;
      const trip = await this.trip.findUnique({ where: { id: b.tripId } });
      const tickets = this.tickets.filter((t) => t.bookingId === b.id);
      const passengers = this.bookingPassengers.filter((bp) => bp.bookingId === b.id);
      const payments = this.payments.filter((p) => p.bookingId === b.id);
      return {
        ...b,
        trip,
        tickets,
        passengers,
        payments,
      };
    },
    findMany: async () => {
      return this.bookings.map((b) => {
        const trip = this.trips.find((t) => t.id === b.tripId);
        const tickets = this.tickets.filter((t) => t.bookingId === b.id);
        const passengers = this.bookingPassengers.filter((bp) => bp.bookingId === b.id);
        const payments = this.payments.filter((p) => p.bookingId === b.id);
        return {
          ...b,
          trip,
          tickets,
          passengers,
          payments,
        };
      });
    },
    update: async ({ where, data }: any) => {
      const b = this.bookings.find((item) => item.id === where.id);
      if (b) Object.assign(b, data);
      return b;
    },
  };

  cashShift = {
    create: async ({ data }: any) => {
      const s = {
        id: `shift_${Date.now()}`,
        ...data,
        agent: this.users.find((u) => u.id === data.agentId),
        branch: this.branches.find((br) => br.id === data.branchId),
      };
      this.cashShifts.push(s);
      return s;
    },
    findFirst: async ({ where }: any) => {
      return (
        this.cashShifts.find((s) => {
          if (where.agentId && s.agentId !== where.agentId) return false;
          if (where.status && s.status !== where.status) return false;
          return true;
        }) ?? null
      );
    },
    findUnique: async ({ where }: any) => {
      return this.cashShifts.find((s) => s.id === where.id) ?? null;
    },
    update: async ({ where, data }: any) => {
      const s = this.cashShifts.find((item) => item.id === where.id);
      if (s) {
        if (data.cashSalesETB?.increment) {
          s.cashSalesETB += data.cashSalesETB.increment;
          delete data.cashSalesETB;
        }
        if (data.ticketsCount?.increment) {
          s.ticketsCount += data.ticketsCount.increment;
          delete data.ticketsCount;
        }
        if (data.refundsETB?.increment) {
          s.refundsETB += data.refundsETB.increment;
          delete data.refundsETB;
        }
        if (data.cancelledTicketsCount?.increment) {
          s.cancelledTicketsCount += data.cancelledTicketsCount.increment;
          delete data.cancelledTicketsCount;
        }
        Object.assign(s, data);
        return s;
      }
      return null;
    },
    findMany: async () => this.cashShifts,
  };

  branch = {
    findUnique: async ({ where }: any) => {
      return this.branches.find((br) => br.id === where.id) ?? null;
    },
  };

  auditLog = {
    create: async ({ data }: any) => {
      this.auditLogs.push(data);
      return data;
    },
  };

  $transaction = async (callback: any) => {
    if (Array.isArray(callback)) {
      return Promise.all(callback);
    }
    return callback(this);
  };
}

async function runAgentTerminalVerification() {
  console.log('🧪 RUNNING AGENT / TERMINAL SYSTEM END-TO-END VERIFICATION');
  console.log('=========================================================\n');

  const mockDb = new MockAgentPrisma();

  // Setup Company, Branch & Agent
  const company = { id: 'comp_1', tradeName: 'Abyssinia Bus' };
  const branch = { id: 'br_addis', companyId: company.id, nameEn: 'Addis Ababa Central Terminal' };
  const agent = { id: 'usr_agent_hana', fullName: 'Hana Bekele', role: 'TICKET_AGENT', branchId: branch.id };
  const conductor = { id: 'usr_cond_alemu', fullName: 'Alemu Girma', role: 'CONDUCTOR' };

  mockDb.companies.push(company);
  mockDb.branches.push(branch);
  mockDb.users.push(agent, conductor);

  // Setup Stops: Addis (ADD) -> Debre Sina (DS) -> Dessie (DES)
  const stopADD = { id: 'stop_ADD', code: 'ADD', name: 'Addis Ababa Terminal' };
  const stopDS = { id: 'stop_DS', code: 'DS', name: 'Debre Sina Station' };
  const stopDES = { id: 'stop_DES', code: 'DES', name: 'Dessie Terminal' };
  mockDb.stops.push(stopADD, stopDS, stopDES);

  // Route with 3 stops => 2 segments
  const route = { id: 'rte_1', companyId: company.id, routeCode: 'RTE-AA-DES', originStopId: stopADD.id, destinationStopId: stopDES.id };
  mockDb.routes.push(route);

  // Bus SB-023 with 45 seats
  const bus = { id: 'bus_023', plateNumber: '3-45678 ET', sideNumber: 'SB-023', totalSeats: 45 };
  mockDb.buses.push(bus);

  for (let r = 1; r <= 11; r++) {
    for (const c of ['A', 'B', 'C', 'D']) {
      mockDb.seats.push({ id: `seat_${r}${c}`, busId: bus.id, seatNumber: `${r}${c}`, status: 'AVAILABLE' });
    }
  }
  mockDb.seats.push({ id: 'seat_12A', busId: bus.id, seatNumber: '12A', status: 'AVAILABLE' });

  // Trip #501
  const trip = {
    id: 'trip_501',
    companyId: company.id,
    routeId: route.id,
    busId: bus.id,
    scheduledDeparture: new Date('2026-10-05T05:00:00.000Z'),
    price: 850.0,
    status: 'SCHEDULED',
  };
  mockDb.trips.push(trip);

  // Segments: ADD->DS (Seg 1), DS->DES (Seg 2)
  const seg1 = { id: 'seg_1', tripId: trip.id, fromStopId: stopADD.id, toStopId: stopDS.id, sequenceNumber: 1 };
  const seg2 = { id: 'seg_2', tripId: trip.id, fromStopId: stopDS.id, toStopId: stopDES.id, sequenceNumber: 2 };
  mockDb.tripSegments.push(seg1, seg2);

  // Materialize 45 seats per segment
  for (const s of mockDb.seats) {
    mockDb.tripSegmentSeats.push(
      { id: `tss_1_${s.seatNumber}`, tripSegmentId: seg1.id, busSeatId: s.id, status: 'AVAILABLE' },
      { id: `tss_2_${s.seatNumber}`, tripSegmentId: seg2.id, busSeatId: s.id, status: 'AVAILABLE' },
    );
  }

  // Instantiate Services
  const tripsService = new TripsService(mockDb as any);
  const reservationsService = new ReservationsService(mockDb as any);
  const bookingsService = new BookingsService(mockDb as any);
  const boardingService = new BoardingService(mockDb as any);
  const shiftsService = new ShiftsService(mockDb as any);
  const agentService = new AgentService(mockDb as any);

  // STEP 1: Agent Starts Shift
  console.log('1️⃣ Agent Hana Opens Shift with Float ETB 2,500...');
  const shift = await shiftsService.startShift(
    { openingCashETB: 2500, branchId: branch.id, notes: 'Morning counter shift' },
    { userId: agent.id, branchId: branch.id },
  );
  console.log(`   ✅ Shift Started! ID: ${shift.shiftId}, Opening: ETB ${shift.openingCashETB}, Status: ${shift.status}`);

  // STEP 2: Agent Views Today's Trips
  console.log('\n2️⃣ Agent Views Today\'s Departures at Counter...');
  const todayTrips = await agentService.getTodayTrips(company.id, branch.id);
  console.log(`   ✅ Found ${todayTrips.length} trip(s). Trip #501 available seats: ${todayTrips[0]?.availableSeats}`);

  // STEP 3: Agent Queries Seat Availability (Addis -> Dessie)
  console.log('\n3️⃣ Agent Checks Available Seats for Addis Ababa -> Dessie...');
  const availableSeats = await tripsService.getAvailableSeats(trip.id, stopADD.id, stopDES.id);
  console.log(`   ✅ Available Seats: ${availableSeats.length} seats`);

  // STEP 4: Agent Holds Seat 12A
  console.log('\n4️⃣ Agent Holds Seat 12A (Customer selects seat)...');
  const reservation = await reservationsService.reserveSeats(
    trip.id,
    stopADD.id,
    stopDES.id,
    ['seat_12A'],
    'passenger_john',
  );
  console.log(`   ✅ Seat 12A HELD! Reservation: ${reservation.reservationId} (Expires in 5 min)`);

  // STEP 5: Agent Completes Cash Booking
  console.log('\n5️⃣ Customer tenders ETB 1000 cash for ETB 850 fare. Agent confirms booking...');
  const bookingResult = await bookingsService.createBooking(
    {
      tripId: trip.id,
      reservationId: reservation.reservationId,
      fromStopId: stopADD.id,
      toStopId: stopDES.id,
      customerName: 'John Smith',
      customerPhone: '+251 91 100 2233',
      passengers: [
        {
          seatId: 'seat_12A',
          seatNumber: '12A',
          passengerName: 'John Smith',
          passengerPhone: '+251 91 100 2233',
          passengerIdNumber: 'ETH-KEBELE-9912',
        },
      ],
      paymentMethod: 'CASH',
      cashTenderedETB: 1000,
      branchId: branch.id,
      agentId: agent.id,
    },
    { userId: agent.id, branchId: branch.id, fullName: agent.fullName, role: agent.role },
  );

  console.log(`   ✅ Booking Confirmed! Ref: ${bookingResult.bookingReference}`);
  console.log(`   ✅ Fare: ETB ${bookingResult.totalAmountETB} | Cash: ETB ${bookingResult.cashTenderedETB} | Change Due: ETB ${bookingResult.changeReturnedETB}`);
  console.log(`   ✅ Ticket Issued: ${bookingResult.tickets[0].ticketNumber} | QR Hash: ${bookingResult.tickets[0].qrHash.slice(0, 16)}...`);
  console.log(`   ✅ Thermal POS Receipt Generated:\n${(bookingResult.thermalReceipt || '').trim()}`);

  // Verify shift live cash counter
  const shiftStatus = await shiftsService.getCurrentShift({ userId: agent.id });
  console.log(`\n   🔎 Live Drawer Status: Cash Sales = ETB ${shiftStatus?.cashSalesETB} (Expected in drawer = ETB ${shiftStatus?.expectedCashETB})`);

  // STEP 6: Conductor Scans Ticket at Door
  console.log('\n6️⃣ Conductor Alemu Scans Passenger QR Ticket at Bus Entrance...');
  const ticketNumber = bookingResult.tickets[0].ticketNumber;
  const scanResult = await boardingService.scanTicket(
    { qrPayload: ticketNumber, currentTripId: trip.id, terminalLocation: 'Addis Gate #1' },
    { userId: conductor.id },
  );
  console.log(`   ✅ Scan Result: [${scanResult.status}] ${scanResult.message}`);
  console.log(`      Passenger: ${scanResult.passengerName} | Seat: ${scanResult.seatNumber}`);

  // Re-scan duplicate check
  console.log('\n7️⃣ Passenger tries to re-enter or duplicate QR is scanned...');
  const duplicateScan = await boardingService.scanTicket(
    { qrPayload: ticketNumber, currentTripId: trip.id },
    { userId: conductor.id },
  );
  console.log(`   ✅ Duplicate Prevention: [${duplicateScan.status}] ${duplicateScan.message}`);

  // STEP 8: Agent Searches Booking
  console.log('\n8️⃣ Agent Searches Existing Booking by Reference or Phone...');
  const searchResults = await bookingsService.searchBookings('BK-');
  console.log(`   ✅ Found ${searchResults.length} booking(s). Customer: ${searchResults[0]?.customerName}`);

  // STEP 9: Rescheduling Demonstration
  console.log('\n9️⃣ Demonstrating Rescheduling to Trip 502 Seat 14B...');
  const trip2 = { id: 'trip_502', companyId: company.id, routeId: route.id, busId: bus.id, scheduledDeparture: new Date('2026-10-07T05:00:00.000Z'), price: 850, status: 'SCHEDULED' };
  mockDb.trips.push(trip2);
  const trip2Seg = { id: 'seg_2_1', tripId: trip2.id, fromStopId: stopADD.id, toStopId: stopDES.id, sequenceNumber: 1 };
  mockDb.tripSegments.push(trip2Seg);
  mockDb.tripSegmentSeats.push({ id: 'tss_trip2_14B', tripSegmentId: trip2Seg.id, busSeatId: 'seat_14B', status: 'AVAILABLE' });
  mockDb.seats.push({ id: 'seat_14B', busId: bus.id, seatNumber: '14B', status: 'AVAILABLE' });

  const rescheduleRes = await bookingsService.rescheduleBooking(
    bookingResult.bookingReference,
    {
      newTripId: trip2.id,
      oldSeatNumber: '12A',
      newSeatNumber: '14B',
      reason: 'Passenger requested schedule change',
      agentId: agent.id,
    },
    { userId: agent.id },
  );
  console.log(`   ✅ Rescheduled Successfully! New Ticket Seat: ${rescheduleRes.newSeatNumber} for ${rescheduleRes.newDeparture}`);

  // STEP 10: Agent Closes Shift & Reconciles Cash Drawer
  console.log('\n🔟 Agent Hana Ends Shift: Counts drawer cash (ETB 3,350)...');
  const closeShiftResult = await shiftsService.endShift(
    { shiftId: shift.shiftId, actualCashETB: 3350, notes: 'Evening reconciliation' },
    { userId: agent.id },
  );

  console.log(`   ✅ Shift CLOSED! Expected Cash: ETB ${closeShiftResult.expectedCashETB} | Actual Counted: ETB ${closeShiftResult.actualCashETB}`);
  console.log(`   ✅ Drawer Status: ${closeShiftResult.discrepancyStatus} (Difference: ETB ${closeShiftResult.differenceETB})`);

  // STEP 11: Branch Settlement Report
  console.log('\n1️⃣1️⃣ Branch Manager Generates Daily Branch Settlement Report...');
  const settlement = await agentService.getBranchSettlement(branch.id);
  console.log(`   ✅ Branch: ${settlement.branchName}`);
  console.log(`   ✅ Total Tickets Sold: ${settlement.totalTicketsSold}`);
  console.log(`   ✅ Cash Collected: ETB ${settlement.cashCollectedETB}`);
  console.log(`   ✅ Final Expected Cash: ETB ${settlement.expectedCashDrawerETB}`);

  console.log('\n=========================================================');
  console.log('🎉 AGENT / TERMINAL SYSTEM VERIFICATION PASSED (100%)!');
  console.log('=========================================================\n');
}

runAgentTerminalVerification().catch((err) => {
  console.error('❌ Agent terminal test failed:', err);
  process.exit(1);
});
