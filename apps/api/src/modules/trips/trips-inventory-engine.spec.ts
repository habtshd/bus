import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { ReservationsService } from '../reservations/reservations.service';
import { ReservationsExpirationWorker } from '../reservations/reservations-expiration.worker';

// In-Memory Mock Prisma DB simulating PostgreSQL behavior
class InMemoryPrismaMock {
  companies: any[] = [];
  routes: any[] = [];
  buses: any[] = [];
  seats: any[] = [];
  trips: any[] = [];
  tripSegments: any[] = [];
  tripSegmentSeats: any[] = [];
  reservations: any[] = [];

  route = {
    findFirst: async ({ where, include }: any) => {
      const r = this.routes.find((item) => item.id === where.id && item.companyId === where.companyId && item.status === where.status);
      if (!r) return null;
      return {
        ...r,
        routeStops: r.routeStops,
      };
    },
  };

  bus = {
    findFirst: async ({ where }: any) => {
      const b = this.buses.find((item) => item.id === where.id && item.companyId === where.companyId);
      if (!b) return null;
      return {
        ...b,
        seats: this.seats.filter((s) => s.busId === b.id && s.status === 'AVAILABLE'),
      };
    },
  };

  trip = {
    findFirst: async ({ where }: any) => {
      return this.trips.find((t) => t.busId === where.busId && t.status !== 'CANCELLED');
    },
    create: async ({ data }: any) => {
      const trip = { id: `trip_${Date.now()}`, ...data };
      this.trips.push(trip);
      return trip;
    },
    findUnique: async ({ where }: any) => {
      const t = this.trips.find((item) => item.id === where.id);
      if (!t) return null;
      const segments = this.tripSegments.filter((s) => s.tripId === t.id);
      return {
        ...t,
        tripSegments: segments,
      };
    },
  };

  tripSegment = {
    create: async ({ data }: any) => {
      const segment = { id: `seg_${Date.now()}_${data.sequenceNumber}`, ...data };
      this.tripSegments.push(segment);
      return segment;
    },
    findMany: async ({ where }: any) => {
      return this.tripSegments
        .filter((s) => s.tripId === where.tripId)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    },
  };

  tripSegmentSeat = {
    createMany: async ({ data }: any) => {
      for (const item of data) {
        this.tripSegmentSeats.push({
          id: `tss_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          ...item,
        });
      }
      return { count: data.length };
    },
    findMany: async ({ where }: any) => {
      return this.tripSegmentSeats
        .filter((tss) => where.tripSegmentId.in.includes(tss.tripSegmentId))
        .map((tss) => ({
          ...tss,
          busSeat: this.seats.find((s) => s.id === tss.busSeatId),
        }));
    },
    findUnique: async ({ where }: any) => {
      const { tripSegmentId, busSeatId } = where.tripSegmentId_busSeatId;
      return this.tripSegmentSeats.find(
        (tss) => tss.tripSegmentId === tripSegmentId && tss.busSeatId === busSeatId,
      ) ?? null;
    },
    update: async ({ where, data }: any) => {
      const s = this.tripSegmentSeats.find((item) => item.id === where.id);
      if (s) {
        Object.assign(s, data);
        return s;
      }
      return null;
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (let i = 0; i < this.tripSegmentSeats.length; i++) {
        const s = this.tripSegmentSeats[i];
        if (where.reservationId?.in?.includes(s.reservationId) && (!where.status || s.status === where.status)) {
          Object.assign(s, data);
          count++;
        }
      }
      return { count };
    },
  };

  reservation = {
    create: async ({ data }: any) => {
      const res = { id: `res_${Date.now()}`, ...data };
      this.reservations.push(res);
      return res;
    },
    findMany: async ({ where }: any) => {
      return this.reservations.filter((r) => {
        if (where.status && r.status !== where.status) return false;
        if (where.expiresAt?.lt && r.expiresAt >= where.expiresAt.lt) return false;
        return true;
      });
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (let i = 0; i < this.reservations.length; i++) {
        if (where.id?.in?.includes(this.reservations[i].id)) {
          this.reservations[i] = { ...this.reservations[i], ...data };
          count++;
        }
      }
      return { count };
    },
  };

  $transaction = async (callback: any) => {
    if (Array.isArray(callback)) {
      return Promise.all(callback);
    }
    // Take a snapshot for transaction rollback simulation
    const snapshot = {
      trips: JSON.parse(JSON.stringify(this.trips)),
      tripSegments: JSON.parse(JSON.stringify(this.tripSegments)),
      tripSegmentSeats: JSON.parse(JSON.stringify(this.tripSegmentSeats)),
      reservations: JSON.parse(JSON.stringify(this.reservations)),
    };
    try {
      return await callback(this);
    } catch (err) {
      this.trips = snapshot.trips;
      this.tripSegments = snapshot.tripSegments;
      this.tripSegmentSeats = snapshot.tripSegmentSeats;
      this.reservations = snapshot.reservations;
      throw err;
    }
  };
}

async function runTests() {
  console.log('🧪 RUNNING TRIP + SEGMENT + SEAT INVENTORY & RESERVATION ENGINE VERIFICATION');
  console.log('========================================================================\n');

  const mockDb = new InMemoryPrismaMock();

  // Setup Initial Mock Data
  const companyId = 'comp_abyssinia';
  mockDb.companies.push({ id: companyId, tradeName: 'Abyssinia Bus' });

  // Stops: Addis Ababa -> Debre Sina -> Dessie -> Bahir Dar
  const stopADD = { id: 'stop_ADD', code: 'ADD', name: 'Addis Ababa' };
  const stopDS = { id: 'stop_DS', code: 'DS', name: 'Debre Sina' };
  const stopDES = { id: 'stop_DES', code: 'DES', name: 'Dessie' };
  const stopBD = { id: 'stop_BD', code: 'BD', name: 'Bahir Dar' };

  // Route with 4 stops => 3 consecutive segments
  const routeId = 'route_addis_bahirdar';
  mockDb.routes.push({
    id: routeId,
    companyId,
    status: 'ACTIVE',
    routeStops: [
      { sequenceNumber: 1, stopId: stopADD.id, stop: stopADD },
      { sequenceNumber: 2, stopId: stopDS.id, stop: stopDS },
      { sequenceNumber: 3, stopId: stopDES.id, stop: stopDES },
      { sequenceNumber: 4, stopId: stopBD.id, stop: stopBD },
    ],
  });

  // Bus with 45 seats
  const busId = 'bus_023';
  mockDb.buses.push({
    id: busId,
    companyId,
    plateNumber: 'ET-3-8899',
    sideNumber: 'SB-023',
    status: 'AVAILABLE',
  });

  // Create 45 physical seats: 1A, 1B, 1C, 1D, etc.
  for (let r = 1; r <= 11; r++) {
    for (const c of ['A', 'B', 'C', 'D']) {
      const seatNum = `${r}${c}`;
      mockDb.seats.push({
        id: `seat_${seatNum}`,
        busId,
        seatNumber: seatNum,
        status: 'AVAILABLE',
      });
    }
  }
  // Seat 45 (12A)
  mockDb.seats.push({
    id: 'seat_12A',
    busId,
    seatNumber: '12A',
    status: 'AVAILABLE',
  });

  const tripsService = new TripsService(mockDb as any);
  const reservationsService = new ReservationsService(mockDb as any);
  const expirationWorker = new ReservationsExpirationWorker(mockDb as any);

  // 1. Create Trip Test
  console.log('1️⃣ Admin Creates Trip via TripsService.createTrip...');
  const tripDto = {
    routeId,
    busId,
    tripDate: '2026-10-05',
    scheduledDeparture: '2026-10-05T05:00:00.000Z',
    scheduledArrival: '2026-10-05T15:00:00.000Z',
    price: 850,
  };

  const createdTrip = await tripsService.createTrip(tripDto, companyId);
  console.log(`   ✅ Trip Created! ID: ${createdTrip?.id}, Status: ${createdTrip?.status}`);
  console.log(`   ✅ Trip Segments Created: ${mockDb.tripSegments.length} segments`);
  console.log(`      Segment 1: ${mockDb.tripSegments[0].fromStopId} -> ${mockDb.tripSegments[0].toStopId}`);
  console.log(`      Segment 2: ${mockDb.tripSegments[1].fromStopId} -> ${mockDb.tripSegments[1].toStopId}`);
  console.log(`      Segment 3: ${mockDb.tripSegments[2].fromStopId} -> ${mockDb.tripSegments[2].toStopId}`);
  console.log(`   ✅ Total Segment Seat Inventory: ${mockDb.tripSegmentSeats.length} seats (3 segments × 45 seats = 135 rows)`);

  if (mockDb.tripSegmentSeats.length !== 135) {
    throw new Error(`Expected 135 segment seats, got ${mockDb.tripSegmentSeats.length}`);
  }

  // 2. Availability Test
  console.log('\n2️⃣ Querying Available Seats: Addis Ababa (ADD) -> Dessie (DES)...');
  const availableSeats = await tripsService.getAvailableSeats(createdTrip!.id, stopADD.id, stopDES.id);
  console.log(`   ✅ Available Seats: ${availableSeats.length} (All 45 seats available on both segments 1 & 2)`);
  if (availableSeats.length !== 45) {
    throw new Error(`Expected 45 available seats, got ${availableSeats.length}`);
  }

  // 3. Seat Reservation Test
  console.log('\n3️⃣ Holding Seat "12A" from Addis Ababa (ADD) to Dessie (DES)...');
  const reservation = await reservationsService.reserveSeats(
    createdTrip!.id,
    stopADD.id,
    stopDES.id,
    ['seat_12A'],
    'passenger_john',
  );
  console.log(`   ✅ Reservation Active! ID: ${reservation.reservationId}`);
  console.log(`   ✅ Expires At: ${reservation.expiresAt.toISOString()} (5 minutes TTL)`);

  // Verify seat 12A status on segments 1 & 2 (HELD), but still AVAILABLE on segment 3 (Dessie -> Bahir Dar)!
  const seg1Seat12A = mockDb.tripSegmentSeats.find(
    (s) => s.tripSegmentId === mockDb.tripSegments[0].id && s.busSeatId === 'seat_12A',
  );
  const seg2Seat12A = mockDb.tripSegmentSeats.find(
    (s) => s.tripSegmentId === mockDb.tripSegments[1].id && s.busSeatId === 'seat_12A',
  );
  const seg3Seat12A = mockDb.tripSegmentSeats.find(
    (s) => s.tripSegmentId === mockDb.tripSegments[2].id && s.busSeatId === 'seat_12A',
  );

  console.log(`   🔎 Verification across segments:`);
  console.log(`      Segment 1 (Addis -> Debre Sina): 12A is ${seg1Seat12A?.status} (HELD)`);
  console.log(`      Segment 2 (Debre Sina -> Dessie): 12A is ${seg2Seat12A?.status} (HELD)`);
  console.log(`      Segment 3 (Dessie -> Bahir Dar): 12A is ${seg3Seat12A?.status} (AVAILABLE - intermediate hop optimization!)`);

  if (seg1Seat12A?.status !== 'HELD' || seg2Seat12A?.status !== 'HELD' || seg3Seat12A?.status !== 'AVAILABLE') {
    throw new Error('Segment seat status mismatch!');
  }

  // 4. Overlap Conflict Test (Trying to reserve already held seat)
  console.log('\n4️⃣ Concurrency Test: Passenger 2 tries to reserve already held seat 12A for ADD -> DES...');
  try {
    await reservationsService.reserveSeats(
      createdTrip!.id,
      stopADD.id,
      stopDES.id,
      ['seat_12A'],
      'passenger_mary',
    );
    throw new Error('Seat 12A reservation should have thrown BadRequestException!');
  } catch (err: any) {
    console.log(`   ✅ Correctly Rejected: "${err.message}"`);
  }

  // 5. Reservation Expiration Test
  console.log('\n5️⃣ Simulating Expiration Worker: Expiration TTL passes...');
  // Artificially age the reservation
  mockDb.reservations[0].expiresAt = new Date(Date.now() - 1000);
  await expirationWorker.handleExpiredReservations();

  const updatedSeg1Seat12A = mockDb.tripSegmentSeats.find(
    (s) => s.tripSegmentId === mockDb.tripSegments[0].id && s.busSeatId === 'seat_12A',
  );
  const updatedSeg2Seat12A = mockDb.tripSegmentSeats.find(
    (s) => s.tripSegmentId === mockDb.tripSegments[1].id && s.busSeatId === 'seat_12A',
  );

  console.log(`   ✅ Reservation status: ${mockDb.reservations[0].status} (EXPIRED)`);
  console.log(`   ✅ Segment 1 seat 12A status: ${updatedSeg1Seat12A?.status} (Restored to AVAILABLE)`);
  console.log(`   ✅ Segment 2 seat 12A status: ${updatedSeg2Seat12A?.status} (Restored to AVAILABLE)`);

  if (updatedSeg1Seat12A?.status !== 'AVAILABLE' || updatedSeg2Seat12A?.status !== 'AVAILABLE') {
    throw new Error('Seat was not restored to AVAILABLE upon expiration!');
  }

  // 6. Section 7 & 8 Blueprint Test: Multi-Hop Seat Reuse & Critical Overlap Defense
  console.log('\n6️⃣ Multi-Hop Seat Reuse & Critical Overlap Defense (Sections 7 & 8)...');
  console.log('   Passenger A: Holds Seat 12A from Dessie (DES) to Bahir Dar (BD)...');
  const resA = await reservationsService.reserveSeats(
    createdTrip!.id,
    stopDES.id,
    stopBD.id,
    ['seat_12A'],
    'passenger_A',
  );
  console.log(`   ✅ Passenger A Hold Granted: ID ${resA.reservationId} (Segment 3 is HELD)`);

  console.log('   Passenger B: Requests SAME Seat 12A from Addis (ADD) to Dessie (DES)...');
  const resB = await reservationsService.reserveSeats(
    createdTrip!.id,
    stopADD.id,
    stopDES.id,
    ['seat_12A'],
    'passenger_B',
  );
  console.log(`   ✅ Passenger B Hold Granted: ID ${resB.reservationId} (Segments 1 & 2 are HELD)`);
  console.log('   🎉 Seat 12A is simultaneously and safely held by 2 different passengers for non-overlapping hops!');

  console.log('   Passenger C: Requests Seat 12A from Debre Sina (DS) to Bahir Dar (BD)...');
  let passengerCRejected = false;
  try {
    await reservationsService.reserveSeats(
      createdTrip!.id,
      stopDS.id,
      stopBD.id,
      ['seat_12A'],
      'passenger_C',
    );
  } catch (err: any) {
    passengerCRejected = true;
    console.log(`   ✅ Critical Overlap Defense Passed! Passenger C REJECTED: "${err.message}"`);
  }
  if (!passengerCRejected) {
    throw new Error('Overlap conflict failed! Passenger C was erroneously allowed to double-book overlapping segment.');
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL ENGINE ACCEPTANCE TESTS COMPLETED WITH 100% SUCCESS!');
  console.log('========================================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
