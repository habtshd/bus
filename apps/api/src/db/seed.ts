import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ethiopian Intercity Bus Platform database...');

  // Clean existing data
  await prisma.seatLock.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.cashShift.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.route.deleteMany();
  await prisma.station.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Branches
  const autobisTeraBranch = await prisma.branch.create({
    data: {
      nameEn: 'Autobis Tera Main Branch',
      nameAm: 'አውቶቡስ ተራ ዋና ቅርንጫፍ',
      city: 'Addis Ababa',
      address: 'Autobis Tera Commercial Center, Addis Ketema',
      phone: '+251 11 278 1122'
    }
  });

  const kalityBranch = await prisma.branch.create({
    data: {
      nameEn: 'Kality Terminal Branch',
      nameAm: 'ቃሊቲ ተርሚናል ቅርንጫፍ',
      city: 'Addis Ababa',
      address: 'Kality Intercity Bus Terminal Ticket Office #4',
      phone: '+251 11 434 2233'
    }
  });

  const hawassaBranch = await prisma.branch.create({
    data: {
      nameEn: 'Hawassa Central Branch',
      nameAm: 'ሀዋሳ ማዕከላዊ ቅርንጫፍ',
      city: 'Hawassa',
      address: 'Piazza, Next to Ras Hotel, Hawassa',
      phone: '+251 46 220 5544'
    }
  });

  const bahirDarBranch = await prisma.branch.create({
    data: {
      nameEn: 'Bahir Dar Branch',
      nameAm: 'ባሕር ዳር ቅርንጫፍ',
      city: 'Bahir Dar',
      address: 'Main Highway Terminal Office, Bahir Dar',
      phone: '+251 58 226 7788'
    }
  });

  // 2. Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@abyssiniabus.et',
      passwordHash,
      fullName: 'Yonas Tadesse (HQ Operations Manager)',
      phone: '+251 91 123 4567',
      role: 'SUPER_ADMIN',
      branchId: autobisTeraBranch.id
    }
  });

  const autobisAgent = await prisma.user.create({
    data: {
      email: 'agent.autobistera@abyssiniabus.et',
      passwordHash,
      fullName: 'Tigist Bekele (Counter Agent)',
      phone: '+251 92 234 5678',
      role: 'TICKET_AGENT',
      branchId: autobisTeraBranch.id
    }
  });

  const kalityAgent = await prisma.user.create({
    data: {
      email: 'agent.kality@abyssiniabus.et',
      passwordHash,
      fullName: 'Mulugeta Assefa (Counter Agent)',
      phone: '+251 93 345 6789',
      role: 'TICKET_AGENT',
      branchId: kalityBranch.id
    }
  });

  const conductorUser = await prisma.user.create({
    data: {
      email: 'conductor.alemu@abyssiniabus.et',
      passwordHash,
      fullName: 'Alemu Girma (Senior Conductor)',
      phone: '+251 94 456 7890',
      role: 'CONDUCTOR',
      branchId: autobisTeraBranch.id
    }
  });

  // 3. Stations
  const stationAutobisTera = await prisma.station.create({
    data: {
      nameEn: 'Addis Ababa - Autobis Tera',
      nameAm: 'አዲስ አበባ - አውቶቡስ ተራ',
      city: 'Addis Ababa',
      terminalArea: 'Autobis Tera Central Terminal',
      latitude: 9.0345,
      longitude: 38.7422
    }
  });

  const stationKality = await prisma.station.create({
    data: {
      nameEn: 'Addis Ababa - Kality Terminal',
      nameAm: 'አዲስ አበባ - ቃሊቲ ተርሚናል',
      city: 'Addis Ababa',
      terminalArea: 'Kality South Departure Gate',
      latitude: 8.9056,
      longitude: 38.7618
    }
  });

  const stationLamberet = await prisma.station.create({
    data: {
      nameEn: 'Addis Ababa - Lamberet Terminal',
      nameAm: 'አዲስ አበባ - ላምበረት ተርሚናል',
      city: 'Addis Ababa',
      terminalArea: 'Lamberet North-East Terminal',
      latitude: 9.0289,
      longitude: 38.8156
    }
  });

  const stationHawassa = await prisma.station.create({
    data: {
      nameEn: 'Hawassa - Central Station',
      nameAm: 'ሀዋሳ ማዕከላዊ ተርሚናል',
      city: 'Hawassa',
      terminalArea: 'Main Hawassa Intercity Hub',
      latitude: 7.0504,
      longitude: 38.4763
    }
  });

  const stationBahirDar = await prisma.station.create({
    data: {
      nameEn: 'Bahir Dar - Main Station',
      nameAm: 'ባሕር ዳር ዋና ተርሚናል',
      city: 'Bahir Dar',
      terminalArea: 'Lake Tana Departure Gate',
      latitude: 11.5936,
      longitude: 37.3908
    }
  });

  const stationGondar = await prisma.station.create({
    data: {
      nameEn: 'Gondar - Azezo Terminal',
      nameAm: 'ጎንደር አዘዞ ተርሚናል',
      city: 'Gondar',
      terminalArea: 'Fasiledes Avenue Hub',
      latitude: 12.6030,
      longitude: 37.4521
    }
  });

  const stationDireDawa = await prisma.station.create({
    data: {
      nameEn: 'Dire Dawa - Kezira Terminal',
      nameAm: 'ድሬዳዋ ቀዚራ ተርሚናል',
      city: 'Dire Dawa',
      terminalArea: 'Railway Station Square',
      latitude: 9.5931,
      longitude: 41.8661
    }
  });

  // 4. Routes
  const routeAddisHawassa = await prisma.route.create({
    data: {
      originStationId: stationKality.id,
      destinationStationId: stationHawassa.id,
      distanceKm: 275,
      estimatedDurationHours: 4.5,
      baseFareETB: 650.0
    }
  });

  const routeHawassaAddis = await prisma.route.create({
    data: {
      originStationId: stationHawassa.id,
      destinationStationId: stationKality.id,
      distanceKm: 275,
      estimatedDurationHours: 4.5,
      baseFareETB: 650.0
    }
  });

  const routeAddisBahirDar = await prisma.route.create({
    data: {
      originStationId: stationLamberet.id,
      destinationStationId: stationBahirDar.id,
      distanceKm: 560,
      estimatedDurationHours: 9.0,
      baseFareETB: 1200.0
    }
  });

  const routeAddisDireDawa = await prisma.route.create({
    data: {
      originStationId: stationAutobisTera.id,
      destinationStationId: stationDireDawa.id,
      distanceKm: 515,
      estimatedDurationHours: 8.5,
      baseFareETB: 1100.0
    }
  });

  // 5. Buses
  const bus1 = await prisma.bus.create({
    data: {
      plateNumber: '3-45678 ET',
      sideNumber: 'BUS-101',
      busModel: 'Zhongtong Navigator VIP Luxury',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      status: 'ACTIVE',
      amenities: 'AC,WiFi,Reclining Seats,Charging Ports,Bottled Water'
    }
  });

  const bus2 = await prisma.bus.create({
    data: {
      plateNumber: '3-56789 ET',
      sideNumber: 'BUS-102',
      busModel: 'Golden Dragon Cruiser Express',
      busType: 'STANDARD_2X3',
      totalSeats: 59,
      status: 'ACTIVE',
      amenities: 'Audio System,Reading Lights,Curtains'
    }
  });

  const bus3 = await prisma.bus.create({
    data: {
      plateNumber: '3-67890 ET',
      sideNumber: 'BUS-103',
      busModel: 'Higer Scania Touring Coach',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      status: 'ACTIVE',
      amenities: 'AC,WiFi,Footrest,Entertainment Screen'
    }
  });

  // 6. Scheduled Trips
  const now = new Date();
  
  // Trip 1: Today 06:00 AM Addis -> Hawassa (Bus 101)
  const trip1Departure = new Date(now);
  trip1Departure.setHours(6, 0, 0, 0);
  if (trip1Departure < now) {
    trip1Departure.setDate(trip1Departure.getDate() + 1);
  }
  const trip1Arrival = new Date(trip1Departure.getTime() + 4.5 * 3600 * 1000);

  const trip1 = await prisma.trip.create({
    data: {
      tripCode: 'ETB-AA-HW-01',
      routeId: routeAddisHawassa.id,
      busId: bus1.id,
      driverName: 'Kebede Worku',
      driverPhone: '+251 91 199 8877',
      conductorName: 'Alemu Girma',
      conductorPhone: '+251 94 456 7890',
      departureTime: trip1Departure,
      estimatedArrivalTime: trip1Arrival,
      fareETB: 650.0,
      status: 'BOARDING'
    }
  });

  // Trip 2: Today 06:30 AM Addis -> Bahir Dar (Bus 102)
  const trip2Departure = new Date(now);
  trip2Departure.setHours(6, 30, 0, 0);
  if (trip2Departure < now) {
    trip2Departure.setDate(trip2Departure.getDate() + 1);
  }
  const trip2Arrival = new Date(trip2Departure.getTime() + 9.0 * 3600 * 1000);

  const trip2 = await prisma.trip.create({
    data: {
      tripCode: 'ETB-AA-BD-01',
      routeId: routeAddisBahirDar.id,
      busId: bus2.id,
      driverName: 'Fikadu Hailu',
      driverPhone: '+251 92 288 7766',
      conductorName: 'Dawit Mengistu',
      conductorPhone: '+251 93 377 6655',
      departureTime: trip2Departure,
      estimatedArrivalTime: trip2Arrival,
      fareETB: 1200.0,
      status: 'SCHEDULED'
    }
  });

  // Trip 3: Today 07:00 AM Addis -> Dire Dawa (Bus 103)
  const trip3Departure = new Date(now);
  trip3Departure.setHours(7, 0, 0, 0);
  if (trip3Departure < now) {
    trip3Departure.setDate(trip3Departure.getDate() + 1);
  }
  const trip3Arrival = new Date(trip3Departure.getTime() + 8.5 * 3600 * 1000);

  const trip3 = await prisma.trip.create({
    data: {
      tripCode: 'ETB-AA-DD-01',
      routeId: routeAddisDireDawa.id,
      busId: bus3.id,
      driverName: 'Mohammed Ahmed',
      driverPhone: '+251 91 355 4433',
      conductorName: 'Jemal Abdi',
      conductorPhone: '+251 92 466 5544',
      departureTime: trip3Departure,
      estimatedArrivalTime: trip3Arrival,
      fareETB: 1100.0,
      status: 'SCHEDULED'
    }
  });

  // 7. Seed sample bookings & checkpoint-compliant tickets for Trip 1
  // Booking 1: Counter Agent Cash Sale (2 seats)
  const booking1 = await prisma.booking.create({
    data: {
      bookingReference: 'BK-202610-001',
      tripId: trip1.id,
      customerName: 'Abebe Bikila',
      customerPhone: '+251 91 112 2334',
      customerEmail: 'abebe.b@gmail.com',
      bookedByUserId: kalityAgent.id,
      bookedByRole: 'TICKET_AGENT',
      branchId: kalityBranch.id,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      totalAmountETB: 1300.0
    }
  });

  const tkt1Qr = crypto.createHash('sha256').update(`${trip1.id}-1A-AbebeBikila`).digest('hex');
  const tkt2Qr = crypto.createHash('sha256').update(`${trip1.id}-1B-AlmazAyana`).digest('hex');

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-1001',
      bookingId: booking1.id,
      tripId: trip1.id,
      seatNumber: '1A',
      passengerName: 'Abebe Bikila',
      passengerPhone: '+251 91 112 2334',
      passengerIdNumber: 'KB-04-98442',
      status: 'BOARDED',
      fareETB: 650.0,
      qrHash: tkt1Qr,
      boardedAt: new Date(),
      boardingTerminal: 'Kality Terminal',
      dropoffTerminal: 'Hawassa Central'
    }
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-1002',
      bookingId: booking1.id,
      tripId: trip1.id,
      seatNumber: '1B',
      passengerName: 'Almaz Ayana',
      passengerPhone: '+251 91 223 3445',
      passengerIdNumber: 'KB-04-98443',
      status: 'BOARDED',
      fareETB: 650.0,
      qrHash: tkt2Qr,
      boardedAt: new Date(),
      boardingTerminal: 'Kality Terminal',
      dropoffTerminal: 'Hawassa Central'
    }
  });

  // Booking 2: Online Telebirr booking (1 seat)
  const booking2 = await prisma.booking.create({
    data: {
      bookingReference: 'BK-202610-002',
      tripId: trip1.id,
      customerName: 'Derartu Tulu',
      customerPhone: '+251 92 334 4556',
      customerEmail: 'derartu.t@yahoo.com',
      bookedByRole: 'PASSENGER',
      paymentMethod: 'TELEBIRR',
      paymentStatus: 'COMPLETED',
      totalAmountETB: 650.0
    }
  });

  const tkt3Qr = crypto.createHash('sha256').update(`${trip1.id}-2A-DerartuTulu`).digest('hex');

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-1003',
      bookingId: booking2.id,
      tripId: trip1.id,
      seatNumber: '2A',
      passengerName: 'Derartu Tulu',
      passengerPhone: '+251 92 334 4556',
      passengerIdNumber: 'ETH-9023412',
      status: 'ISSUED',
      fareETB: 650.0,
      qrHash: tkt3Qr,
      boardingTerminal: 'Kality Terminal',
      dropoffTerminal: 'Hawassa Central'
    }
  });

  // 8. Open cash shift for Kality Agent
  await prisma.cashShift.create({
    data: {
      agentId: kalityAgent.id,
      branchId: kalityBranch.id,
      openingCashETB: 2000.0,
      cashSalesETB: 1300.0,
      ticketsCount: 2,
      cancelledTicketsCount: 0,
      refundsETB: 0,
      status: 'OPEN',
      notes: 'Morning shift started with 2,000 ETB change float.'
    }
  });

  console.log('✅ Ethiopian Bus Platform database successfully seeded!');
  console.log('--- Credentials ---');
  console.log('Admin: admin@abyssiniabus.et / Password123!');
  console.log('Agent: agent.kality@abyssiniabus.et / Password123!');
  console.log('Conductor: conductor.alemu@abyssiniabus.et / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
