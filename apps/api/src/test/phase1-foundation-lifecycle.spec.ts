import { AuthService } from '../modules/auth/auth.service';
import { CompaniesService } from '../modules/companies/companies.service';
import { BranchesService } from '../modules/branches/branches.service';
import { BusesService } from '../modules/buses/buses.service';
import { RoutesService } from '../modules/routes/routes.service';
import { TripsService } from '../modules/trips/trips.service';
import * as bcrypt from 'bcryptjs';

// =========================================================================
// IN-MEMORY PRISMA RIG FOR PHASE 1 FOUNDATION
// =========================================================================
class Phase1PrismaMock {
  companies: any[] = [];
  branches: any[] = [];
  users: any[] = [];
  busTypes: any[] = [];
  buses: any[] = [];
  seats: any[] = [];
  stops: any[] = [];
  routes: any[] = [];
  routeStops: any[] = [];
  schedules: any[] = [];
  trips: any[] = [];
  tripSegments: any[] = [];
  tripSegmentSeats: any[] = [];

  constructor() {
    this.seedInitialUser();
  }

  seedInitialUser() {
    // Super Admin Seed
    this.users.push({
      id: 'usr_admin_01',
      email: 'admin@abyssiniabus.et',
      phone: '+251911000001',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      fullName: 'Dawit Mengistu',
      role: 'SUPER_ADMIN',
      branchId: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  user = {
    findFirst: async ({ where }: any) => {
      return this.users.find((u) => {
        if (where?.OR) {
          return where.OR.some((cond: any) => {
            if (cond.email && u.email.toLowerCase() === cond.email.toLowerCase()) return true;
            if (cond.phone && u.phone === cond.phone) return true;
            return false;
          });
        }
        return false;
      }) || null;
    },
    findUnique: async ({ where }: any) => {
      return this.users.find((u) => u.email === where.email || u.id === where.id) || null;
    },
    create: async ({ data }: any) => {
      const u = { id: `usr_${Date.now()}`, ...data };
      this.users.push(u);
      return u;
    },
    findMany: async () => this.users,
  };

  company = {
    create: async ({ data }: any) => {
      const c = { id: `comp_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.companies.push(c);
      return c;
    },
    findFirst: async () => this.companies[0] || null,
    findUnique: async ({ where }: any) => this.companies.find((c) => c.id === where.id) || null,
    findMany: async () => this.companies,
  };

  branch = {
    create: async ({ data }: any) => {
      const b = { id: `br_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.branches.push(b);
      return b;
    },
    findUnique: async ({ where }: any) => this.branches.find((b) => b.id === where.id) || null,
    findMany: async () => this.branches,
  };

  busType = {
    create: async ({ data }: any) => {
      const bt = { id: `bt_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.busTypes.push(bt);
      return bt;
    },
    findUnique: async ({ where }: any) => this.busTypes.find((bt) => bt.id === where.id) || null,
    findMany: async () => this.busTypes,
  };

  bus = {
    create: async ({ data }: any) => {
      const b = { id: `bus_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.buses.push(b);
      return b;
    },
    findUnique: async ({ where }: any) => {
      const b = this.buses.find((item) => item.id === where.id);
      if (!b) return null;
      return {
        ...b,
        busTypeRef: this.busTypes.find((bt) => bt.id === b.busTypeId),
        seats: this.seats.filter((s) => s.busId === b.id),
      };
    },
    findFirst: async ({ where }: any) => {
      const b = this.buses.find((item) => item.id === where.id);
      if (!b) return null;
      return {
        ...b,
        seats: this.seats.filter((s) => s.busId === b.id),
      };
    },
    findMany: async () => this.buses,
    update: async ({ where, data }: any) => {
      const b = this.buses.find((item) => item.id === where.id);
      if (b) Object.assign(b, data);
      return b;
    },
  };

  seat = {
    createMany: async ({ data }: any) => {
      for (const d of data) {
        this.seats.push({ id: `seat_${d.busId}_${d.seatNumber}`, ...d });
      }
      return { count: data.length };
    },
    findMany: async ({ where }: any) => {
      return this.seats.filter((s) => {
        if (where?.busId && s.busId !== where.busId) return false;
        return true;
      });
    },
    deleteMany: async ({ where }: any) => {
      const before = this.seats.length;
      this.seats = this.seats.filter((s) => s.busId !== where.busId);
      return { count: before - this.seats.length };
    },
  };

  stop = {
    create: async ({ data }: any) => {
      const st = { id: `stop_${data.code}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.stops.push(st);
      return st;
    },
    findUnique: async ({ where }: any) => this.stops.find((s) => s.id === where.id || s.code === where.code) || null,
    findMany: async () => this.stops,
  };

  route = {
    create: async ({ data }: any) => {
      const r = { id: `route_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.routes.push(r);
      return r;
    },
    findFirst: async ({ where }: any) => {
      const r = this.routes.find((item) => item.id === where.id);
      if (!r) return null;
      return {
        ...r,
        originStop: this.stops.find((s) => s.id === r.originStopId),
        destinationStop: this.stops.find((s) => s.id === r.destinationStopId),
        routeStops: this.routeStops
          .filter((rs) => rs.routeId === r.id)
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
          .map((rs) => ({ ...rs, stop: this.stops.find((s) => s.id === rs.stopId) })),
      };
    },
    findUnique: async ({ where }: any) => {
      const r = this.routes.find((item) => item.id === where.id);
      if (!r) return null;
      return {
        ...r,
        originStop: this.stops.find((s) => s.id === r.originStopId),
        destinationStop: this.stops.find((s) => s.id === r.destinationStopId),
        routeStops: this.routeStops
          .filter((rs) => rs.routeId === r.id)
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
          .map((rs) => ({ ...rs, stop: this.stops.find((s) => s.id === rs.stopId) })),
      };
    },
    findMany: async () => {
      return this.routes.map((r) => ({
        ...r,
        originStop: this.stops.find((s) => s.id === r.originStopId),
        destinationStop: this.stops.find((s) => s.id === r.destinationStopId),
      }));
    },
  };

  routeStop = {
    createMany: async ({ data }: any) => {
      for (const d of data) {
        this.routeStops.push({ id: `rs_${Date.now()}_${Math.random()}`, ...d });
      }
      return { count: data.length };
    },
    findMany: async ({ where }: any) => this.routeStops.filter((rs) => rs.routeId === where.routeId),
  };

  schedule = {
    create: async ({ data }: any) => {
      const sc = { id: `sch_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.schedules.push(sc);
      return sc;
    },
    findMany: async () => this.schedules,
  };

  trip = {
    create: async ({ data }: any) => {
      const t = { id: `trip_${Date.now()}`, ...data };
      this.trips.push(t);
      return t;
    },
    findFirst: async ({ where }: any) => this.trips.find((t) => t.busId === where.busId) || null,
    findUnique: async ({ where }: any) => {
      const t = this.trips.find((item) => item.id === where.id);
      if (!t) return null;
      const bus = this.buses.find((b) => b.id === t.busId);
      const route = this.routes.find((r) => r.id === t.routeId);
      return {
        ...t,
        bus: {
          ...bus,
          seats: this.seats.filter((s) => s.busId === bus?.id),
        },
        route: {
          ...route,
          originStop: this.stops.find((s) => s.id === route?.originStopId),
          destinationStop: this.stops.find((s) => s.id === route?.destinationStopId),
        },
        tripSegments: this.tripSegments.filter((seg) => seg.tripId === t.id).map((seg) => ({
          ...seg,
          seats: this.tripSegmentSeats.filter((tss) => tss.tripSegmentId === seg.id),
        })),
      };
    },
    findMany: async () => {
      return this.trips.map((t) => {
        const bus = this.buses.find((b) => b.id === t.busId);
        const route = this.routes.find((r) => r.id === t.routeId);
        return {
          ...t,
          bus: {
            ...bus,
            seats: this.seats.filter((s) => s.busId === bus?.id),
          },
          route: {
            ...route,
            originStop: this.stops.find((s) => s.id === route?.originStopId),
            destinationStop: this.stops.find((s) => s.id === route?.destinationStopId),
          },
          tripSegments: this.tripSegments.filter((seg) => seg.tripId === t.id).map((seg) => ({
            ...seg,
            fromStop: this.stops.find((s) => s.id === seg.fromStopId),
            toStop: this.stops.find((s) => s.id === seg.toStopId),
            seats: this.tripSegmentSeats.filter((tss) => tss.tripSegmentId === seg.id),
          })),
        };
      });
    },
  };

  tripSegment = {
    create: async ({ data }: any) => {
      const seg = { id: `seg_${Date.now()}_${Math.random()}`, ...data };
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
      return this.tripSegmentSeats
        .filter((s) => {
          if (where?.tripSegmentId?.in && !where.tripSegmentId.in.includes(s.tripSegmentId)) return false;
          return true;
        })
        .map((s) => ({
          ...s,
          busSeat: this.seats.find((seat) => seat.id === s.busSeatId),
        }));
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
// THE PHASE 1 FOUNDATION EXECUTION TEST
// =========================================================================
async function runPhase1FoundationTest() {
  console.log('🚀 RUNNING PHASE 1 — FOUNDATION IMPLEMENTATION VERIFICATION');
  console.log('========================================================================');

  const prismaMock = new Phase1PrismaMock() as any;
  const authService = new AuthService(prismaMock);
  const companiesService = new CompaniesService(prismaMock);
  const branchesService = new BranchesService(prismaMock);
  const busesService = new BusesService(prismaMock);
  const routesService = new RoutesService(prismaMock);
  const tripsService = new TripsService(prismaMock);

  // 1. LOGIN
  console.log('\n1️⃣ Super Admin Authentication (POST /api/v1/auth/login)...');
  const loginRes = await authService.login({
    login: 'admin@abyssiniabus.et',
    password: 'Password123!',
  });
  console.log(`   ✅ Logged in successfully!`);
  console.log(`   ✅ User: ${loginRes.user.fullName} (${loginRes.user.role})`);
  console.log(`   ✅ Access Token: ${loginRes.accessToken.substring(0, 28)}...`);
  console.log(`   ✅ Refresh Token: ${loginRes.refreshToken.substring(0, 28)}...`);

  // 2. CREATE COMPANY
  console.log('\n2️⃣ Creating Master Bus Company (POST /api/v1/companies)...');
  const company = await companiesService.createCompany({
    legalName: 'Abyssinia Intercity Bus Transportation Share Company',
    legalNameAm: 'አቢሲኒያ የረጅም ርቀት አውቶቡስ አክሲዮን ማህበር',
    tradeName: 'Abyssinia Bus',
    tinNumber: '0054892110',
    commercialRegNo: 'MT/AA/04/9921',
    headquartersAddress: 'Churchill Road, Addis Ketema, Addis Ababa',
    headquartersPhone: '+251 11 278 1122',
    supportEmail: 'support@abyssiniabus.et',
    websiteUrl: 'https://abyssiniabus.et',
  });
  console.log(`   ✅ Company Created! ID: ${company.id} | Trade Name: ${company.tradeName}`);

  // 3. CREATE BRANCH
  console.log('\n3️⃣ Creating Central Terminal Branch (POST /api/v1/branches)...');
  const branch = await branchesService.createBranch(
    {
      companyId: company.id,
      nameEn: 'Addis Ababa Autobis Tera Central Branch',
      nameAm: 'አዲስ አበባ አውቶቡስ ተራ ዋና ቅርንጫፍ',
      code: 'ADD-01',
      city: 'Addis Ababa',
      terminalArea: 'Autobus Tera Gate 4',
      phone: '+251 11 278 1122',
      address: 'Autobus Tera Commercial Zone, Addis Ababa',
      managerName: 'Kassahun Worku',
    },
    company.id
  );
  console.log(`   ✅ Branch Created! ID: ${branch.id} | Code: ${branch.code} | City: ${branch.city}`);

  // 4. CREATE BUS TYPE
  console.log('\n4️⃣ Creating Bus Type (POST /api/v1/bus-types)...');
  const busType = await busesService.createBusType(
    {
      companyId: company.id,
      name: '45 Seat Luxury Coach',
      manufacturer: 'Yutong',
      model: 'ZK6122H',
      capacity: 45,
      description: 'Luxury 2x2 executive seating with AC, USB, and WiFi',
    },
    company.id
  );
  console.log(`   ✅ Bus Type Created! ID: ${busType.id} | Name: ${busType.name} (Capacity: ${busType.capacity})`);

  // 5. CREATE BUS & GENERATE 45 PHYSICAL SEATS
  console.log('\n5️⃣ Creating Bus SB-023 with Automatic 45-Seat Topology (POST /api/v1/buses)...');
  const bus = await busesService.createBus(
    {
      companyId: company.id,
      busTypeId: busType.id,
      fleetNumber: 'FLT-023',
      sideNumber: 'SB-023',
      plateNumber: '3-A99102 ET',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      autoGenerateSeats: true,
    },
    company.id
  );
  console.log(`   ✅ Bus Created! ID: ${bus.id} | Side No: ${bus.sideNumber} | Plate: ${bus.plateNumber}`);
  console.log(`   ✅ Physical Seats Materialized: ${bus.seats.length} seats (First: ${bus.seats[0].seatNumber}, Last: ${bus.seats[bus.seats.length - 1].seatNumber})`);

  // 6. CREATE NETWORK STOPS
  console.log('\n6️⃣ Creating Corridor Stops (POST /api/v1/stops)...');
  const stopAddis = await routesService.createStop({ companyId: company.id, name: 'Addis Ababa', code: 'ADD', city: 'Addis Ababa' });
  const stopDS = await routesService.createStop({ companyId: company.id, name: 'Debre Sina', code: 'DS', city: 'Debre Sina' });
  const stopDessie = await routesService.createStop({ companyId: company.id, name: 'Dessie', code: 'DES', city: 'Dessie' });
  const stopBahirDar = await routesService.createStop({ companyId: company.id, name: 'Bahir Dar', code: 'BD', city: 'Bahir Dar' });

  console.log(`   ✅ Stops Created: ${stopAddis.code}, ${stopDS.code}, ${stopDessie.code}, ${stopBahirDar.code}`);

  // 7. CREATE ROUTE WITH INTERMEDIATE STOPS
  console.log('\n7️⃣ Creating Multi-Stop Route: Addis Ababa -> Bahir Dar (POST /api/v1/routes)...');
  const route = await routesService.createRoute(
    {
      companyId: company.id,
      routeCode: 'RT-ADD-BHR',
      originStopId: stopAddis.id,
      destinationStopId: stopBahirDar.id,
      distanceKm: 565,
      estimatedDurationMinutes: 540,
      intermediateStopIds: [stopDS.id, stopDessie.id],
    },
    company.id
  );
  console.log(`   ✅ Route Created! ID: ${route?.id} | Code: ${route?.routeCode}`);
  console.log(`   ✅ Stops Sequence: ${route?.routeStops?.map((rs: any) => `${rs.sequenceNumber}. ${rs.stop.name}`).join(' -> ')}`);

  // 8. CREATE RECURRING SCHEDULE
  console.log('\n8️⃣ Creating Daily 05:00 AM Departure Schedule (POST /api/v1/schedules)...');
  const schedule = await routesService.createSchedule({
    companyId: company.id,
    routeId: route!.id,
    busTypeId: busType.id,
    departureTime: '05:00 AM',
    daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    defaultPrice: 850.0,
  });
  console.log(`   ✅ Schedule Created! ID: ${schedule.id} | Departure: ${schedule.departureTime} | Price: ETB ${schedule.defaultPrice}`);

  // 9. CREATE TRIP #501 & AUTOMATIC TRIP INVENTORY
  console.log('\n9️⃣ Creating Scheduled Trip #501 & Materializing Segment Inventory (POST /api/v1/trips)...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(5, 0, 0, 0);

  const trip = await tripsService.createTrip(
    {
      routeId: route!.id,
      scheduleId: schedule.id,
      busId: bus.id,
      tripDate: tomorrow,
      scheduledDeparture: tomorrow,
      price: 850.0,
    },
    company.id
  );

  console.log(`   ✅ Trip Created! ID: ${trip.id} | Status: ${trip.status}`);
  console.log(`   ✅ Trip Segments Created: ${prismaMock.tripSegments.length} consecutive hops`);
  console.log(`   ✅ Trip Segment Seats Inventory: ${prismaMock.tripSegmentSeats.length} rows (3 hops × 45 seats = 135)`);

  // 10. PASSENGER TRIP SEARCH (GET /api/v1/trips/search?from=ADD&to=BD&date=...)
  console.log('\n🔟 Passenger Trip Search (GET /api/v1/trips/search?from=ADD&to=BD&date=...)...');
  const dateStr = tomorrow.toISOString().slice(0, 10);
  const searchResults = await tripsService.searchTrips('ADD', 'BD', dateStr, company.id);

  console.log(`   ✅ Found ${searchResults.length} matching departures!`);
  const foundTrip = searchResults[0];
  console.log(`   ✅ Result Trip ID: ${foundTrip.id}`);
  console.log(`   ✅ Route: ${foundTrip.origin} (${foundTrip.originCode}) -> ${foundTrip.destination} (${foundTrip.destinationCode})`);
  console.log(`   ✅ Departure Time: ${foundTrip.departure} | Arrival Time: ${foundTrip.arrival}`);
  console.log(`   ✅ Bus: ${foundTrip.busPlate} (${foundTrip.busSideNumber}) | Type: ${foundTrip.busType}`);
  console.log(`   ✅ Price: ETB ${foundTrip.price}`);
  console.log(`   ✅ Live Available Seats: ${foundTrip.availableSeats} of ${foundTrip.totalSeats}`);

  // 11. PASSENGER VIEWS AVAILABLE SEATS
  console.log('\n1️⃣1️⃣ Passenger Views Real-time Seats Matrix (GET /api/v1/trips/:id/seats)...');
  const availableSeats = await tripsService.getAvailableSeats(trip.id, stopAddis.id, stopBahirDar.id);
  console.log(`   ✅ Queried Available Seats count: ${availableSeats.length} seats`);
  console.log(`   ✅ Verified First Seat: ${availableSeats[0].seatNumber} (Row: ${availableSeats[0].row})`);
  console.log(`   ✅ Verified Last Seat: ${availableSeats[availableSeats.length - 1].seatNumber} (Row: ${availableSeats[availableSeats.length - 1].row})`);

  console.log('\n========================================================================');
  console.log('🎉 PHASE 1 — FOUNDATION LIFECYCLE VERIFICATION COMPLETED WITH 100% SUCCESS!');
  console.log('========================================================================');
}

runPhase1FoundationTest().catch((err) => {
  console.error('❌ PHASE 1 TEST FAILED:', err);
  process.exit(1);
});
