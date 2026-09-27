import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 19 Core Entities for Ethiopian Intercity Bus Platform...');

  // Clean existing data in reverse relational order
  await prisma.auditLog.deleteMany();
  await prisma.boarding.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.seatLock.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.bookingPassenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.cashShift.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.station.deleteMany();
  await prisma.user.deleteMany();
  await prisma.driver.deleteMany();
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
      websiteUrl: 'https://abyssiniabus.et'
    }
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
      managerName: 'Kassahun Worku'
    }
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
      managerName: 'Mulugeta Assefa'
    }
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
      managerName: 'Dereje Tefera'
    }
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
      managerName: 'Yonas Gebre'
    }
  });

  // 3. Users & Roles
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

  // 4. Drivers
  const driver1 = await prisma.driver.create({
    data: {
      companyId: company.id,
      fullName: 'Kebede Worku',
      phone: '+251 91 199 8877',
      licenseNumber: 'ETH-DRV-44912',
      experienceYears: 12,
      status: 'AVAILABLE'
    }
  });

  const driver2 = await prisma.driver.create({
    data: {
      companyId: company.id,
      fullName: 'Fikadu Hailu',
      phone: '+251 92 288 7766',
      licenseNumber: 'ETH-DRV-55823',
      experienceYears: 9,
      status: 'AVAILABLE'
    }
  });

  const driver3 = await prisma.driver.create({
    data: {
      companyId: company.id,
      fullName: 'Mohammed Ahmed',
      phone: '+251 91 355 4433',
      licenseNumber: 'ETH-DRV-66734',
      experienceYears: 15,
      status: 'AVAILABLE'
    }
  });

  // 5. Buses
  const bus1 = await prisma.bus.create({
    data: {
      companyId: company.id,
      plateNumber: '3-45678 ET',
      sideNumber: 'BUS-101',
      busModel: 'Zhongtong Navigator VIP Luxury',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      amenities: 'AC,WiFi,Reclining Seats,Charging Ports,Bottled Water',
      status: 'ACTIVE'
    }
  });

  const bus2 = await prisma.bus.create({
    data: {
      companyId: company.id,
      plateNumber: '3-56789 ET',
      sideNumber: 'BUS-102',
      busModel: 'Golden Dragon Cruiser Express',
      busType: 'STANDARD_2X3',
      totalSeats: 59,
      amenities: 'Audio System,Reading Lights,Curtains',
      status: 'ACTIVE'
    }
  });

  const bus3 = await prisma.bus.create({
    data: {
      companyId: company.id,
      plateNumber: '3-67890 ET',
      sideNumber: 'BUS-103',
      busModel: 'Higer Scania Touring Coach',
      busType: 'LUXURY_2X2',
      totalSeats: 45,
      amenities: 'AC,WiFi,Footrest,Entertainment Screen',
      status: 'ACTIVE'
    }
  });

  // 6. Stations & Routes
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

  // Intermediate Stop Stations
  const stationMojo = await prisma.station.create({
    data: {
      nameEn: 'Mojo Junction',
      nameAm: 'ሞጆ መገናኛ',
      city: 'Mojo',
      terminalArea: 'Expressway Highway Gate',
      latitude: 8.5901,
      longitude: 39.1215
    }
  });

  const stationShashemene = await prisma.station.create({
    data: {
      nameEn: 'Shashemene - Awasho Terminal',
      nameAm: 'ሻሸመኔ አዋሾ ተርሚናል',
      city: 'Shashemene',
      terminalArea: 'Crossroads Hub',
      latitude: 7.2001,
      longitude: 38.5991
    }
  });

  // Routes
  const routeAddisHawassa = await prisma.route.create({
    data: {
      originStationId: stationKality.id,
      destinationStationId: stationHawassa.id,
      distanceKm: 275,
      estimatedDurationHours: 4.5,
      baseFareETB: 650.0
    }
  });

  // Intermediate Stops along Addis-Hawassa
  await prisma.stop.create({
    data: {
      routeId: routeAddisHawassa.id,
      stationId: stationMojo.id,
      stopOrder: 1,
      arrivalOffsetMinutes: 60,
      fareFromOriginETB: 200.0
    }
  });

  await prisma.stop.create({
    data: {
      routeId: routeAddisHawassa.id,
      stationId: stationShashemene.id,
      stopOrder: 2,
      arrivalOffsetMinutes: 210,
      fareFromOriginETB: 550.0
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

  // 7. Trips
  const now = new Date();
  const trip1Departure = new Date(now);
  trip1Departure.setDate(trip1Departure.getDate() + 1);
  trip1Departure.setHours(6, 0, 0, 0);
  const trip1Arrival = new Date(trip1Departure.getTime() + 4.5 * 3600 * 1000);

  const trip1 = await prisma.trip.create({
    data: {
      tripCode: 'ETB-AA-HW-01',
      routeId: routeAddisHawassa.id,
      busId: bus1.id,
      driverId: driver1.id,
      driverName: driver1.fullName,
      driverPhone: driver1.phone,
      conductorName: conductorUser.fullName,
      conductorPhone: conductorUser.phone,
      departureTime: trip1Departure,
      estimatedArrivalTime: trip1Arrival,
      fareETB: 650.0,
      status: 'BOARDING'
    }
  });

  const trip2Departure = new Date(now);
  trip2Departure.setDate(trip2Departure.getDate() + 1);
  trip2Departure.setHours(6, 30, 0, 0);
  const trip2Arrival = new Date(trip2Departure.getTime() + 9.0 * 3600 * 1000);

  const trip2 = await prisma.trip.create({
    data: {
      tripCode: 'ETB-AA-BD-01',
      routeId: routeAddisBahirDar.id,
      busId: bus2.id,
      driverId: driver2.id,
      driverName: driver2.fullName,
      driverPhone: driver2.phone,
      conductorName: 'Dawit Mengistu',
      conductorPhone: '+251 93 377 6655',
      departureTime: trip2Departure,
      estimatedArrivalTime: trip2Arrival,
      fareETB: 1200.0,
      status: 'SCHEDULED'
    }
  });

  const trip3Departure = new Date(now);
  trip3Departure.setDate(trip3Departure.getDate() + 1);
  trip3Departure.setHours(7, 0, 0, 0);
  const trip3Arrival = new Date(trip3Departure.getTime() + 8.5 * 3600 * 1000);

  const trip3 = await prisma.trip.create({
    data: {
      tripCode: 'ETB-AA-DD-01',
      routeId: routeAddisDireDawa.id,
      busId: bus3.id,
      driverId: driver3.id,
      driverName: driver3.fullName,
      driverPhone: driver3.phone,
      conductorName: 'Jemal Abdi',
      conductorPhone: '+251 92 466 5544',
      departureTime: trip3Departure,
      estimatedArrivalTime: trip3Arrival,
      fareETB: 1100.0,
      status: 'SCHEDULED'
    }
  });

  // 8. Registered Passengers
  const passengerAbebe = await prisma.passenger.create({
    data: {
      fullName: 'Abebe Bikila',
      phone: '+251 91 112 2334',
      nationalIdNumber: 'KB-04-98442',
      emergencyContactName: 'Kassaye Bikila',
      emergencyContactPhone: '+251 91 112 9999'
    }
  });

  const passengerAlmaz = await prisma.passenger.create({
    data: {
      fullName: 'Almaz Ayana',
      phone: '+251 91 223 3445',
      nationalIdNumber: 'KB-04-98443'
    }
  });

  const passengerDerartu = await prisma.passenger.create({
    data: {
      fullName: 'Derartu Tulu',
      phone: '+251 92 334 4556',
      nationalIdNumber: 'ETH-9023412'
    }
  });

  // 9. Bookings & BookingPassengers & Payments & Tickets
  // Booking 1: Counter Agent Cash Sale
  const booking1 = await prisma.booking.create({
    data: {
      bookingReference: 'BK-202610-001',
      tripId: trip1.id,
      customerName: passengerAbebe.fullName,
      customerPhone: passengerAbebe.phone,
      bookedByUserId: kalityAgent.id,
      bookedByRole: 'TICKET_AGENT',
      branchId: kalityBranch.id,
      totalAmountETB: 1300.0,
      paymentStatus: 'COMPLETED'
    }
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amountETB: 1300.0,
      paymentMethod: 'CASH',
      cashTenderedETB: 2000.0,
      changeReturnedETB: 700.0,
      status: 'COMPLETED'
    }
  });

  const bp1 = await prisma.bookingPassenger.create({
    data: {
      bookingId: booking1.id,
      passengerId: passengerAbebe.id,
      seatNumber: '1A',
      passengerName: passengerAbebe.fullName,
      passengerPhone: passengerAbebe.phone,
      passengerIdNumber: passengerAbebe.nationalIdNumber!
    }
  });

  const bp2 = await prisma.bookingPassenger.create({
    data: {
      bookingId: booking1.id,
      passengerId: passengerAlmaz.id,
      seatNumber: '1B',
      passengerName: passengerAlmaz.fullName,
      passengerPhone: passengerAlmaz.phone,
      passengerIdNumber: passengerAlmaz.nationalIdNumber!
    }
  });

  const tkt1Qr = crypto.createHash('sha256').update(`${trip1.id}-1A-AbebeBikila`).digest('hex');
  const tkt2Qr = crypto.createHash('sha256').update(`${trip1.id}-1B-AlmazAyana`).digest('hex');

  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-1001',
      bookingId: booking1.id,
      bookingPassengerId: bp1.id,
      tripId: trip1.id,
      seatNumber: '1A',
      passengerName: passengerAbebe.fullName,
      passengerPhone: passengerAbebe.phone,
      passengerIdNumber: passengerAbebe.nationalIdNumber!,
      fareETB: 650.0,
      qrHash: tkt1Qr,
      status: 'BOARDED',
      boardingTerminal: 'Kality Terminal',
      dropoffTerminal: 'Hawassa Central'
    }
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-1002',
      bookingId: booking1.id,
      bookingPassengerId: bp2.id,
      tripId: trip1.id,
      seatNumber: '1B',
      passengerName: passengerAlmaz.fullName,
      passengerPhone: passengerAlmaz.phone,
      passengerIdNumber: passengerAlmaz.nationalIdNumber!,
      fareETB: 650.0,
      qrHash: tkt2Qr,
      status: 'BOARDED',
      boardingTerminal: 'Kality Terminal',
      dropoffTerminal: 'Hawassa Central'
    }
  });

  // Boarding audit records for boarded tickets
  await prisma.boarding.create({
    data: {
      ticketId: ticket1.id,
      tripId: trip1.id,
      conductorId: conductorUser.id,
      terminalLocation: 'Kality Gate 4',
      status: 'APPROVED'
    }
  });

  await prisma.boarding.create({
    data: {
      ticketId: ticket2.id,
      tripId: trip1.id,
      conductorId: conductorUser.id,
      terminalLocation: 'Kality Gate 4',
      status: 'APPROVED'
    }
  });

  // Booking 2: Online Telebirr booking
  const booking2 = await prisma.booking.create({
    data: {
      bookingReference: 'BK-202610-002',
      tripId: trip1.id,
      customerName: passengerDerartu.fullName,
      customerPhone: passengerDerartu.phone,
      bookedByRole: 'PASSENGER',
      totalAmountETB: 650.0,
      paymentStatus: 'COMPLETED'
    }
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      amountETB: 650.0,
      paymentMethod: 'TELEBIRR',
      transactionReference: 'TEL-TX-998412498',
      status: 'COMPLETED'
    }
  });

  const bp3 = await prisma.bookingPassenger.create({
    data: {
      bookingId: booking2.id,
      passengerId: passengerDerartu.id,
      seatNumber: '2A',
      passengerName: passengerDerartu.fullName,
      passengerPhone: passengerDerartu.phone,
      passengerIdNumber: passengerDerartu.nationalIdNumber!
    }
  });

  const tkt3Qr = crypto.createHash('sha256').update(`${trip1.id}-2A-DerartuTulu`).digest('hex');

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-1003',
      bookingId: booking2.id,
      bookingPassengerId: bp3.id,
      tripId: trip1.id,
      seatNumber: '2A',
      passengerName: passengerDerartu.fullName,
      passengerPhone: passengerDerartu.phone,
      passengerIdNumber: passengerDerartu.nationalIdNumber!,
      fareETB: 650.0,
      qrHash: tkt3Qr,
      status: 'ISSUED',
      boardingTerminal: 'Kality Terminal',
      dropoffTerminal: 'Hawassa Central'
    }
  });

  // Cash Shift
  await prisma.cashShift.create({
    data: {
      agentId: kalityAgent.id,
      branchId: kalityBranch.id,
      openingCashETB: 2000.0,
      cashSalesETB: 1300.0,
      ticketsCount: 2,
      status: 'OPEN',
      notes: 'Morning ticket office shift started with 2,000 ETB change float.'
    }
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entityName: 'Company',
      entityId: company.id,
      detailsJson: JSON.stringify({ message: '19 core entities successfully initialized.' })
    }
  });

  console.log('✅ Successfully seeded 19 Core Entities with relational integrity!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
