import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ethiopian Intercity Bus Platform (Abyssinia Bus S.C.)...');

  // Reverse relational cleanup
  await prisma.auditLog.deleteMany();
  await prisma.boarding.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.bookingPassenger.deleteMany();
  await prisma.bookingSegment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.tripSegmentSeat.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.tripSegment.deleteMany();
  await prisma.seatLock.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.cashShift.deleteMany();
  await prisma.user.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.company.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Company
  const company = await prisma.company.create({
    data: {
      legalName: 'Abyssinia Intercity Bus Transportation Share Company',
      legalNameAm: 'አቢሲኒያ የረጅም ርቀት አውቶቡስ አክሲዮን ማህበር',
      tradeName: 'Abyssinia Bus',
      tinNumber: '0054892110',
      commercialRegNo: 'MT/AA/04/9921',
      headquartersAddress: 'Churchill Road, Addis Ketema, Addis Ababa, Ethiopia',
      headquartersPhone: '+251 11 278 1122',
      supportEmail: 'support@abyssiniabus.et',
      websiteUrl: 'https://abyssiniabus.et',
    },
  });

  // 2. Branches
  const autobisTeraBranch = await prisma.branch.create({
    data: {
      companyId: company.id,
      nameEn: 'Autobis Tera Main Branch',
      nameAm: 'አውቶቡስ ተራ ዋና ቅርንጫፍ',
      city: 'Addis Ababa',
      terminalArea: 'Autobis Tera Central Terminal Office #12',
      phone: '+251 11 278 1122',
      address: 'Autobis Tera Commercial Center, Addis Ketema',
      managerName: 'Kassahun Worku',
    },
  });

  const kalityBranch = await prisma.branch.create({
    data: {
      companyId: company.id,
      nameEn: 'Kality Terminal Branch',
      nameAm: 'ቃሊቲ ተርሚናል ቅርንጫፍ',
      city: 'Addis Ababa',
      terminalArea: 'Kality South Departure Gate #04',
      phone: '+251 11 434 2233',
      address: 'Kality Intercity Bus Terminal Ticket Office #4',
      managerName: 'Mulugeta Assefa',
    },
  });

  const bahirDarBranch = await prisma.branch.create({
    data: {
      companyId: company.id,
      nameEn: 'Bahir Dar Branch',
      nameAm: 'ባሕር ዳር ቅርንጫፍ',
      city: 'Bahir Dar',
      terminalArea: 'Main Highway Terminal Office #02',
      phone: '+251 58 226 7788',
      address: 'Main Highway Terminal Office, Bahir Dar',
      managerName: 'Yonas Gebre',
    },
  });

  const hawassaBranch = await prisma.branch.create({
    data: {
      companyId: company.id,
      nameEn: 'Hawassa Central Branch',
      nameAm: 'ሀዋሳ ማዕከላዊ ቅርንጫፍ',
      city: 'Hawassa',
      terminalArea: 'Piazza Intercity Ticket Center',
      phone: '+251 46 220 5544',
      address: 'Piazza, Next to Ras Hotel, Hawassa',
      managerName: 'Dereje Tefera',
    },
  });

  // 3. Staff Users for each RBAC Role
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@abyssiniabus.et',
      passwordHash,
      fullName: 'Yonas Tadesse (HQ Operations Director)',
      phone: '+251 91 123 4567',
      role: 'SUPER_ADMIN',
      branchId: autobisTeraBranch.id,
    },
  });

  const branchManager = await prisma.user.create({
    data: {
      email: 'manager.autobistera@abyssiniabus.et',
      passwordHash,
      fullName: 'Kassahun Worku (Branch Manager)',
      phone: '+251 91 222 3344',
      role: 'BRANCH_MANAGER',
      branchId: autobisTeraBranch.id,
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      email: 'agent.autobistera@abyssiniabus.et',
      passwordHash,
      fullName: 'Tigist Bekele (Counter Agent)',
      phone: '+251 92 234 5678',
      role: 'TICKET_AGENT',
      branchId: autobisTeraBranch.id,
    },
  });

  const conductorUser = await prisma.user.create({
    data: {
      email: 'conductor.alemu@abyssiniabus.et',
      passwordHash,
      fullName: 'Alemu Girma (Senior Conductor)',
      phone: '+251 94 456 7890',
      role: 'CONDUCTOR',
      branchId: autobisTeraBranch.id,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher.bekele@abyssiniabus.et',
      passwordHash,
      fullName: 'Bekele Desta (Operations Dispatcher)',
      phone: '+251 91 333 4455',
      role: 'DISPATCHER',
      branchId: autobisTeraBranch.id,
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      email: 'finance@abyssiniabus.et',
      passwordHash,
      fullName: 'Selamawit Haile (Lead Accountant)',
      phone: '+251 91 444 5566',
      role: 'ACCOUNTANT',
      branchId: autobisTeraBranch.id,
    },
  });

  const passengerUser = await prisma.user.create({
    data: {
      email: 'passenger.hailu@gmail.com',
      passwordHash,
      fullName: 'Marta Hailu (Passenger)',
      phone: '+251 91 555 6677',
      role: 'PASSENGER',
    },
  });

  // 4. Drivers
  const driver1 = await prisma.driver.create({
    data: {
      companyId: company.id,
      fullName: 'Kebede Worku',
      phone: '+251 91 199 8877',
      licenseNumber: 'ETH-DRV-44912',
      experienceYears: 12,
      status: 'AVAILABLE',
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      companyId: company.id,
      fullName: 'Fikadu Hailu',
      phone: '+251 92 288 7766',
      licenseNumber: 'ETH-DRV-55823',
      experienceYears: 9,
      status: 'AVAILABLE',
    },
  });

  // 5. Buses & Physical Seats
  const bus1 = await prisma.bus.create({
    data: {
      companyId: company.id,
      plateNumber: '3-45678 ET',
      sideNumber: 'BUS-101',
      busModel: 'Zhongtong Navigator VIP Luxury',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      amenities: 'AC,WiFi,Reclining Seats,Charging Ports,Bottled Water',
      status: 'AVAILABLE',
    },
  });

  // Generate 45 seats for BUS-101 (Rows 1-11: A, B, C, D + Back Row 12A)
  const bus1Seats = [];
  for (let r = 1; r <= 11; r++) {
    for (const c of ['A', 'B', 'C', 'D']) {
      const seatNumber = `${r}${c}`;
      const seat = await prisma.seat.create({
        data: {
          busId: bus1.id,
          seatNumber,
          row: r,
          column: c === 'A' ? 1 : c === 'B' ? 2 : c === 'C' ? 3 : 4,
          columnLetter: c,
          isWindow: c === 'A' || c === 'D',
          isAisle: c === 'B' || c === 'C',
          status: 'AVAILABLE',
        },
      });
      bus1Seats.push(seat);
    }
  }
  const seat45 = await prisma.seat.create({
    data: {
      busId: bus1.id,
      seatNumber: '12A',
      row: 12,
      column: 1,
      columnLetter: 'A',
      isBackRow: true,
      status: 'AVAILABLE',
    },
  });
  bus1Seats.push(seat45);

  // 6. Stops
  const stopADD = await prisma.stop.create({
    data: {
      companyId: company.id,
      name: 'Addis Ababa - Autobis Tera Terminal',
      code: 'ADD',
      city: 'Addis Ababa',
      address: 'Central Autobis Tera Terminal Gate #1',
      type: 'TERMINAL',
      status: 'ACTIVE',
    },
  });

  const stopKAL = await prisma.stop.create({
    data: {
      companyId: company.id,
      name: 'Addis Ababa - Kality Terminal',
      code: 'KAL',
      city: 'Addis Ababa',
      address: 'Kality South Departure Gate #4',
      type: 'TERMINAL',
      status: 'ACTIVE',
    },
  });

  const stopDS = await prisma.stop.create({
    data: {
      companyId: company.id,
      name: 'Debre Sina Station',
      code: 'DS',
      city: 'Debre Sina',
      address: 'Main North Highway Transit Post',
      type: 'STATION',
      status: 'ACTIVE',
    },
  });

  const stopDES = await prisma.stop.create({
    data: {
      companyId: company.id,
      name: 'Dessie Terminal',
      code: 'DES',
      city: 'Dessie',
      address: 'Piazza Central Bus Station',
      type: 'TERMINAL',
      status: 'ACTIVE',
    },
  });

  const stopBD = await prisma.stop.create({
    data: {
      companyId: company.id,
      name: 'Bahir Dar Central Station',
      code: 'BD',
      city: 'Bahir Dar',
      address: 'Lake Tana Intercity Terminal Gate #2',
      type: 'TERMINAL',
      status: 'ACTIVE',
    },
  });

  const stopHAW = await prisma.stop.create({
    data: {
      companyId: company.id,
      name: 'Hawassa Central Station',
      code: 'HAW',
      city: 'Hawassa',
      address: 'Piazza Intercity Ticket Center',
      type: 'TERMINAL',
      status: 'ACTIVE',
    },
  });

  // 7. Routes & Ordered RouteStops
  const routeNorth = await prisma.route.create({
    data: {
      companyId: company.id,
      originStopId: stopADD.id,
      destinationStopId: stopBD.id,
      routeCode: 'RTE-AA-BD-01',
      distanceKm: 560.0,
      estimatedDurationMin: 570, // 9.5 hours
      status: 'ACTIVE',
    },
  });

  await prisma.routeStop.createMany({
    data: [
      { routeId: routeNorth.id, stopId: stopADD.id, sequenceNumber: 1, distanceKm: 0, durationMin: 0 },
      { routeId: routeNorth.id, stopId: stopDS.id, sequenceNumber: 2, distanceKm: 190, durationMin: 180 },
      { routeId: routeNorth.id, stopId: stopDES.id, sequenceNumber: 3, distanceKm: 400, durationMin: 390 },
      { routeId: routeNorth.id, stopId: stopBD.id, sequenceNumber: 4, distanceKm: 560, durationMin: 570 },
    ],
  });

  const routeSouth = await prisma.route.create({
    data: {
      companyId: company.id,
      originStopId: stopKAL.id,
      destinationStopId: stopHAW.id,
      routeCode: 'RTE-AA-HW-01',
      distanceKm: 275.0,
      estimatedDurationMin: 270, // 4.5 hours
      status: 'ACTIVE',
    },
  });

  await prisma.routeStop.createMany({
    data: [
      { routeId: routeSouth.id, stopId: stopKAL.id, sequenceNumber: 1, distanceKm: 0, durationMin: 0 },
      { routeId: routeSouth.id, stopId: stopHAW.id, sequenceNumber: 2, distanceKm: 275, durationMin: 270 },
    ],
  });

  // 8. Schedules
  const scheduleNorth = await prisma.schedule.create({
    data: {
      routeId: routeNorth.id,
      departureTime: '05:00',
      daysOfWeek: 'DAILY',
      status: 'ACTIVE',
    },
  });

  // 9. Trip + Consecutive Segments + Segment Seat Inventory
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 1);
  departureDate.setHours(5, 0, 0, 0);

  const arrivalDate = new Date(departureDate.getTime() + 570 * 60 * 1000);

  const trip1 = await prisma.trip.create({
    data: {
      companyId: company.id,
      routeId: routeNorth.id,
      scheduleId: scheduleNorth.id,
      busId: bus1.id,
      driverId: driver1.id,
      tripDate: departureDate,
      scheduledDeparture: departureDate,
      scheduledArrival: arrivalDate,
      price: 850.0,
      status: 'SCHEDULED',
    },
  });

  // 3 Consecutive Segments: ADD->DS, DS->DES, DES->BD
  const segment1 = await prisma.tripSegment.create({
    data: {
      tripId: trip1.id,
      fromStopId: stopADD.id,
      toStopId: stopDS.id,
      sequenceNumber: 1,
    },
  });

  const segment2 = await prisma.tripSegment.create({
    data: {
      tripId: trip1.id,
      fromStopId: stopDS.id,
      toStopId: stopDES.id,
      sequenceNumber: 2,
    },
  });

  const segment3 = await prisma.tripSegment.create({
    data: {
      tripId: trip1.id,
      fromStopId: stopDES.id,
      toStopId: stopBD.id,
      sequenceNumber: 3,
    },
  });

  // Materialize 45 seats for each of the 3 segments (135 total inventory records)
  for (const seg of [segment1, segment2, segment3]) {
    await prisma.tripSegmentSeat.createMany({
      data: bus1Seats.map((seat) => ({
        tripSegmentId: seg.id,
        busSeatId: seat.id,
        status: 'AVAILABLE',
      })),
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`   - 1 Operator: ${company.tradeName}`);
  console.log(`   - 4 Branches: Autobis Tera, Kality, Bahir Dar, Hawassa`);
  console.log(`   - 7 RBAC User Accounts (Super Admin, Manager, Agent, Conductor, Dispatcher, Accountant, Passenger)`);
  console.log(`   - 2 Drivers with commercial transit licenses`);
  console.log(`   - 1 Luxury Bus (BUS-101) with 45 physical seat records`);
  console.log(`   - 6 Verified Stations & 2 Intercity Corridors`);
  console.log(`   - 1 Scheduled Trip with 3 Consecutive Segments and 135 Segment Seat Inventory Rows!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
