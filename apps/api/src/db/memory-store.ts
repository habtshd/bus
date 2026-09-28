import * as crypto from 'crypto';

export class MemoryDatabase {
  companies: any[] = [];
  branches: any[] = [];
  users: any[] = [];
  passengers: any[] = [];
  buses: any[] = [];
  busTypes: any[] = [];
  seats: any[] = [];
  drivers: any[] = [];
  stops: any[] = [];
  stations: any[] = [];
  routes: any[] = [];
  routeStops: any[] = [];
  schedules: any[] = [];
  trips: any[] = [];
  tripSegments: any[] = [];
  tripSegmentSeats: any[] = [];
  reservations: any[] = [];
  seatLocks: any[] = [];
  bookings: any[] = [];
  bookingPassengers: any[] = [];
  bookingSegments: any[] = [];
  payments: any[] = [];
  paymentEvents: any[] = [];
  tickets: any[] = [];
  boardings: any[] = [];
  gpsLocations: any[] = [];
  incidentReports: any[] = [];
  maintenanceRecords: any[] = [];
  maintenanceParts: any[] = [];
  spareParts: any[] = [];
  fuelTransactions: any[] = [];
  notifications: any[] = [];
  supportTickets: any[] = [];
  auditLogs: any[] = [];
  cashShifts: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Company
    const compId = 'comp_abyssinia_01';
    this.companies.push({
      id: compId,
      name: 'Abyssinia Bus S.C.',
      legalName: 'Abyssinia Intercity Bus Transportation Share Company',
      legalNameAm: 'አቢሲኒያ የረጅም ርቀት አውቶቡስ አክሲዮን ማህበር',
      tradeName: 'Abyssinia Bus',
      tinNumber: '0054892110',
      commercialRegNo: 'MT/AA/04/9921',
      headquartersAddress: 'Churchill Road, Addis Ketema, Addis Ababa, Ethiopia',
      headquartersPhone: '+251 11 278 1122',
      supportEmail: 'support@abyssiniabus.et',
      websiteUrl: 'https://abyssiniabus.et',
      country: 'Ethiopia',
      currency: 'ETB',
      timezone: 'Africa/Addis_Ababa',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date()
    });

    // 2. Branches
    const autobisTera = {
      id: 'br_autobis_tera',
      companyId: compId,
      code: 'ADD-01',
      name: 'Autobis Tera Central Terminal',
      nameEn: 'Autobis Tera Main Branch',
      nameAm: 'አውቶቡስ ተራ ዋና ቅርንጫፍ',
      city: 'Addis Ababa',
      terminalArea: 'Autobis Tera Central Terminal Office #12',
      phone: '+251 11 278 1122',
      address: 'Autobis Tera Commercial Center, Addis Ketema',
      managerName: 'Kassahun Worku',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const kality = {
      id: 'br_kality',
      companyId: compId,
      code: 'ADD-02',
      name: 'Kality Terminal Branch',
      nameEn: 'Kality Terminal Branch',
      nameAm: 'ቃሊቲ ተርሚናል ቅርንጫፍ',
      city: 'Addis Ababa',
      terminalArea: 'Kality South Departure Gate #04',
      phone: '+251 11 434 2233',
      address: 'Kality Intercity Bus Terminal Ticket Office #4',
      managerName: 'Mulugeta Assefa',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const bahirDar = {
      id: 'br_bahir_dar',
      companyId: compId,
      code: 'BHR-01',
      name: 'Bahir Dar Branch',
      nameEn: 'Bahir Dar Branch',
      nameAm: 'ባሕር ዳር ቅርንጫፍ',
      city: 'Bahir Dar',
      terminalArea: 'Main Highway Terminal Office #02',
      phone: '+251 58 226 7788',
      address: 'Main Highway Terminal Office, Bahir Dar',
      managerName: 'Yonas Gebre',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const hawassa = {
      id: 'br_hawassa',
      companyId: compId,
      code: 'HAW-01',
      name: 'Hawassa Central Branch',
      nameEn: 'Hawassa Central Branch',
      nameAm: 'ሀዋሳ ማዕከላዊ ቅርንጫፍ',
      city: 'Hawassa',
      terminalArea: 'Piazza Intercity Ticket Center',
      phone: '+251 46 220 9900',
      address: 'Piazza Intercity Ticket Center, Hawassa',
      managerName: 'Tigist Alemayehu',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const direDawa = {
      id: 'br_dire_dawa',
      companyId: compId,
      code: 'DIR-01',
      name: 'Dire Dawa Branch',
      nameEn: 'Dire Dawa Branch',
      nameAm: 'ድሬዳዋ ቅርንጫፍ',
      city: 'Dire Dawa',
      terminalArea: 'Kezira Railway Station Terminal',
      phone: '+251 25 111 4545',
      address: 'Kezira Terminal Office #1, Dire Dawa',
      managerName: 'Ahmed Mohammed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.branches.push(autobisTera, kality, bahirDar, hawassa, direDawa);

    // 3. Users
    const defaultPasswordHash = '$2a$10$Bav2vWuHtaWzun9wOLBupeItf6S2lQtIwMCEpl.2nmOjk2aDcQwsu'; // Password123!

    this.users.push(
      {
        id: 'usr_admin_01',
        email: 'admin@abyssiniabus.et',
        fullName: 'Dawit Mengistu',
        phone: '+251911000001',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN', 'MANAGEMENT'],
        permissions: ['*'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_agent_01',
        email: 'hana.bekele@abyssiniabus.et',
        fullName: 'Hana Bekele',
        phone: '+251911000002',
        role: 'TICKET_AGENT',
        roles: ['TICKET_AGENT'],
        permissions: ['TRIP_VIEW', 'TICKET_ISSUE', 'SHIFT_MANAGE'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_branch_mgr_01',
        email: 'kassahun@abyssiniabus.et',
        fullName: 'Kassahun Worku',
        phone: '+251911000006',
        role: 'BRANCH_MANAGER',
        roles: ['BRANCH_MANAGER'],
        permissions: ['BRANCH_MANAGE', 'RECONCILIATION_VIEW', 'AGENT_AUDIT'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_driver_01',
        email: 'girma.driver@abyssiniabus.et',
        fullName: 'Girma Tadesse',
        phone: '+251911000003',
        role: 'DRIVER',
        roles: ['DRIVER'],
        permissions: ['DRIVER_COCKPIT', 'GPS_BROADCAST'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_conductor_01',
        email: 'ermias.conductor@abyssiniabus.et',
        fullName: 'Ermias Assefa',
        phone: '+251911000004',
        role: 'CONDUCTOR',
        roles: ['CONDUCTOR'],
        permissions: ['QR_VALIDATE', 'BOARD_PASSENGER'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_dispatcher_01',
        email: 'dispatch@abyssiniabus.et',
        fullName: 'Yohannes Haile',
        phone: '+251911000005',
        role: 'DISPATCHER',
        roles: ['DISPATCHER'],
        permissions: ['DISPATCH_MANAGE', 'FLEET_ASSIGN'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_fleet_01',
        email: 'solomon.tech@abyssiniabus.et',
        fullName: 'Solomon Bekele',
        phone: '+251911000007',
        role: 'FLEET_MANAGER',
        roles: ['FLEET_MANAGER'],
        permissions: ['FLEET_MAINTENANCE', 'PARTS_MANAGE', 'FUEL_AUDIT'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_support_01',
        email: 'support@abyssiniabus.et',
        fullName: 'Selamawit Desta',
        phone: '+251911000008',
        role: 'CUSTOMER_SUPPORT',
        roles: ['CUSTOMER_SUPPORT'],
        permissions: ['TICKET_MANAGE', 'REFUND_APPROVE', 'LOST_ITEM_MANAGE'],
        companyId: compId,
        branchId: autobisTera.id,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr_passenger_01',
        email: 'almaz.passenger@example.com',
        fullName: 'Almaz Tadesse',
        phone: '+251911223344',
        role: 'PASSENGER',
        roles: ['PASSENGER'],
        permissions: ['PASSENGER_PORTAL'],
        companyId: compId,
        status: 'ACTIVE',
        active: true,
        passwordHash: defaultPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // 4. Bus Types
    const btLuxury = {
      id: 'bt_luxury_45',
      name: '45 Seat Luxury Coach',
      category: 'LUXURY_COACH',
      layoutType: '2x2',
      totalSeats: 45,
      hasWifi: true,
      hasAC: true,
      hasUsbCharging: true,
      hasTv: true,
      hasRestroom: false,
      seatPitchInches: 34
    };
    this.busTypes.push(btLuxury);

    // 5. Buses
    const bus1 = {
      id: 'bus_sb023',
      companyId: compId,
      busTypeId: btLuxury.id,
      sideNumber: 'SB-023',
      plateNumber: '3-A99102 ET',
      make: 'Scania',
      model: 'Marcopolo Paradiso 1200',
      manufactureYear: 2023,
      vin: 'YS2R4X20001928371',
      totalSeats: 45,
      amenities: ['WIFI', 'AC', 'USB_CHARGING', 'ONBOARD_TV'],
      status: 'ACTIVE',
      currentMileageKm: 84250,
      fuelCapacityLiters: 450,
      averageFuelConsumption: 28.5,
      insuranceExpiryDate: new Date('2027-04-15'),
      inspectionExpiryDate: new Date('2026-12-31'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const bus2 = {
      id: 'bus_sb024',
      companyId: compId,
      busTypeId: btLuxury.id,
      sideNumber: 'SB-024',
      plateNumber: '3-B10293 ET',
      make: 'Scania',
      model: 'Marcopolo Paradiso 1200',
      manufactureYear: 2023,
      vin: 'YS2R4X20001928372',
      totalSeats: 45,
      amenities: ['WIFI', 'AC', 'USB_CHARGING', 'ONBOARD_TV'],
      status: 'ACTIVE',
      currentMileageKm: 62100,
      fuelCapacityLiters: 450,
      averageFuelConsumption: 27.9,
      insuranceExpiryDate: new Date('2027-05-20'),
      inspectionExpiryDate: new Date('2027-01-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const bus3 = {
      id: 'bus_sb025',
      companyId: compId,
      busTypeId: btLuxury.id,
      sideNumber: 'SB-025',
      plateNumber: '3-C55421 ET',
      make: 'Golden Dragon',
      model: 'Navigator XML6122J',
      manufactureYear: 2024,
      vin: 'LL6TBA12009847120',
      totalSeats: 45,
      amenities: ['WIFI', 'AC', 'USB_CHARGING'],
      status: 'ACTIVE',
      currentMileageKm: 31400,
      fuelCapacityLiters: 400,
      averageFuelConsumption: 26.5,
      insuranceExpiryDate: new Date('2027-08-10'),
      inspectionExpiryDate: new Date('2027-03-30'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.buses.push(bus1, bus2, bus3);

    // 6. Bus physical seats for bus1, bus2, bus3
    for (const b of [bus1, bus2, bus3]) {
      for (let r = 1; r <= 11; r++) {
        for (const col of ['A', 'B', 'C', 'D']) {
          const seatNum = `${r < 10 ? '0' + r : r}${col}`;
          this.seats.push({
            id: `seat_${b.id}_${seatNum}`,
            busId: b.id,
            seatNumber: seatNum,
            rowNumber: r,
            columnLetter: col,
            type: (col === 'A' || col === 'D') ? 'WINDOW' : 'AISLE',
            class: 'STANDARD',
            deckNumber: 1,
            isActive: true
          });
        }
      }
      // Row 12 (Back row: 01A)
      this.seats.push({
        id: `seat_${b.id}_12A`,
        busId: b.id,
        seatNumber: '12A',
        rowNumber: 12,
        columnLetter: 'A',
        type: 'WINDOW',
        class: 'STANDARD',
        deckNumber: 1,
        isActive: true
      });
    }

    // 7. Stops / Stations
    const stopADD = {
      id: 'stop_addis',
      companyId: compId,
      name: 'Autobis Tera Central Terminal',
      nameAm: 'አውቶቡስ ተራ ማዕከላዊ ተርሚናል',
      code: 'ADD',
      city: 'Addis Ababa',
      cityAm: 'አዲስ አበባ',
      address: 'Addis Ketema, Addis Ababa',
      latitude: 9.0353,
      longitude: 38.7412,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };
    const stopKAL = {
      id: 'stop_kality',
      companyId: compId,
      name: 'Kality South Terminal',
      nameAm: 'ቃሊቲ ደቡብ ተርሚናል',
      code: 'KAL',
      city: 'Addis Ababa',
      cityAm: 'አዲስ አበባ (ቃሊቲ)',
      address: 'Kality South Ring Road',
      latitude: 8.9021,
      longitude: 38.7611,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };
    const stopDS = {
      id: 'stop_debre_sina',
      companyId: compId,
      name: 'Debre Sina Rest Stop',
      nameAm: 'ደብረ ሲና መቆሚያ',
      code: 'DS',
      city: 'Debre Sina',
      cityAm: 'ደብረ ሲና',
      address: 'A2 Highway Transit Junction',
      latitude: 9.8512,
      longitude: 39.7589,
      stopType: 'REST_STOP',
      isTerminal: false,
      active: true
    };
    const stopDES = {
      id: 'stop_dessie',
      companyId: compId,
      name: 'Dessie Central Station',
      nameAm: 'ደሴ ማዕከላዊ ጣቢያ',
      code: 'DES',
      city: 'Dessie',
      cityAm: 'ደሴ',
      address: 'Dessie Main Highway Hub',
      latitude: 11.1311,
      longitude: 39.6382,
      stopType: 'STATION',
      isTerminal: false,
      active: true
    };
    const stopBHR = {
      id: 'stop_bahir_dar',
      companyId: compId,
      name: 'Bahir Dar Main Terminal',
      nameAm: 'ባሕር ዳር ዋና ተርሚናል',
      code: 'BHR',
      city: 'Bahir Dar',
      cityAm: 'ባሕር ዳር',
      address: 'Lake Tana Highway Hub',
      latitude: 11.5936,
      longitude: 37.3908,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };
    const stopHAW = {
      id: 'stop_hawassa',
      companyId: compId,
      name: 'Hawassa Central Station',
      nameAm: 'ሀዋሳ ማዕከላዊ ጣቢያ',
      code: 'HAW',
      city: 'Hawassa',
      cityAm: 'ሀዋሳ',
      address: 'Piazza Roundabout',
      latitude: 7.0504,
      longitude: 38.4955,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };
    const stopDIR = {
      id: 'stop_dire_dawa',
      companyId: compId,
      name: 'Dire Dawa Kezira Terminal',
      nameAm: 'ድሬዳዋ ከዚራ ተርሚናል',
      code: 'DIR',
      city: 'Dire Dawa',
      cityAm: 'ድሬዳዋ',
      address: 'Kezira Railway Area',
      latitude: 9.6009,
      longitude: 41.8501,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };
    const stopGON = {
      id: 'stop_gondar',
      companyId: compId,
      name: 'Gondar Azezo Hub',
      nameAm: 'ጎንደር አዘዞ ጣቢያ',
      code: 'GON',
      city: 'Gondar',
      cityAm: 'ጎንደር',
      address: 'Azezo Intercity Hub',
      latitude: 12.5512,
      longitude: 37.4328,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };
    const stopJIM = {
      id: 'stop_jimma',
      companyId: compId,
      name: 'Jimma Aba Jifar Station',
      nameAm: 'ጅማ አባ ጅፋር ጣቢያ',
      code: 'JIM',
      city: 'Jimma',
      cityAm: 'ጅማ',
      address: 'Hirmata Central Square',
      latitude: 7.6734,
      longitude: 36.8344,
      stopType: 'TERMINAL',
      isTerminal: true,
      active: true
    };

    this.stops.push(stopADD, stopKAL, stopDS, stopDES, stopBHR, stopHAW, stopDIR, stopGON, stopJIM);
    this.stations = this.stops; // alias

    // 8. Routes
    const routeAddisBhr = {
      id: 'route_addis_bhr',
      companyId: compId,
      routeCode: 'RT-ADD-BHR',
      name: 'Addis Ababa -> Bahir Dar (via Dessie)',
      originStationId: stopADD.id,
      destinationStationId: stopBHR.id,
      originStopId: stopADD.id,
      destinationStopId: stopBHR.id,
      originCity: 'Addis Ababa',
      destinationCity: 'Bahir Dar',
      originCityAm: 'አዲስ አበባ',
      destinationCityAm: 'ባሕር ዳር',
      distanceKm: 620,
      estimatedMinutes: 540,
      baseFareETB: 850,
      active: true,
      highwayName: 'A2 Northern Corridor Highway'
    };
    const routeAddisHaw = {
      id: 'route_addis_haw',
      companyId: compId,
      routeCode: 'RT-ADD-HAW',
      name: 'Addis Ababa -> Hawassa Expressway',
      originStationId: stopKAL.id,
      destinationStationId: stopHAW.id,
      originStopId: stopKAL.id,
      destinationStopId: stopHAW.id,
      originCity: 'Addis Ababa',
      destinationCity: 'Hawassa',
      originCityAm: 'አዲስ አበባ',
      destinationCityAm: 'ሀዋሳ',
      distanceKm: 275,
      estimatedMinutes: 240,
      baseFareETB: 450,
      active: true,
      highwayName: 'Addis-Adama & Mojo-Hawassa Expressway'
    };
    const routeAddisDir = {
      id: 'route_addis_dir',
      companyId: compId,
      routeCode: 'RT-ADD-DIR',
      name: 'Addis Ababa -> Dire Dawa',
      originStationId: stopADD.id,
      destinationStationId: stopDIR.id,
      originStopId: stopADD.id,
      destinationStopId: stopDIR.id,
      originCity: 'Addis Ababa',
      destinationCity: 'Dire Dawa',
      originCityAm: 'አዲስ አበባ',
      destinationCityAm: 'ድሬዳዋ',
      distanceKm: 450,
      estimatedMinutes: 420,
      baseFareETB: 750,
      active: true,
      highwayName: 'A1 Eastern Djibouti Corridor Highway'
    };
    const routeAddisGon = {
      id: 'route_addis_gon',
      companyId: compId,
      routeCode: 'RT-ADD-GON',
      name: 'Addis Ababa -> Gondar Royal Corridor',
      originStationId: stopADD.id,
      destinationStationId: stopGON.id,
      originStopId: stopADD.id,
      destinationStopId: stopGON.id,
      originCity: 'Addis Ababa',
      destinationCity: 'Gondar',
      originCityAm: 'አዲስ አበባ',
      destinationCityAm: 'ጎንደር',
      distanceKm: 740,
      estimatedMinutes: 660,
      baseFareETB: 1100,
      active: true,
      highwayName: 'A2 Trans-Ethiopian Highway'
    };
    const routeAddisJim = {
      id: 'route_addis_jim',
      companyId: compId,
      routeCode: 'RT-ADD-JIM',
      name: 'Addis Ababa -> Jimma Coffee Highway',
      originStationId: stopADD.id,
      destinationStationId: stopJIM.id,
      originStopId: stopADD.id,
      destinationStopId: stopJIM.id,
      originCity: 'Addis Ababa',
      destinationCity: 'Jimma',
      originCityAm: 'አዲስ አበባ',
      destinationCityAm: 'ጅማ',
      distanceKm: 350,
      estimatedMinutes: 300,
      baseFareETB: 550,
      active: true,
      highwayName: 'A5 Southwestern Highway'
    };

    this.routes.push(routeAddisBhr, routeAddisHaw, routeAddisDir, routeAddisGon, routeAddisJim);

    // 9. Schedules & Trips
    const today = new Date();
    const todayMorning = new Date(today);
    todayMorning.setHours(6, 0, 0, 0);

    const todayNoon = new Date(today);
    todayNoon.setHours(15, 0, 0, 0);

    const trip1 = {
      id: 'trip_501',
      tripCode: 'ETB-AA-BD-01',
      routeId: routeAddisBhr.id,
      busId: bus1.id,
      driverName: 'Girma Tadesse',
      driverPhone: '+251911000003',
      conductorName: 'Ermias Assefa',
      conductorPhone: '+251911000004',
      departureTime: todayMorning,
      estimatedArrivalTime: todayNoon,
      fareETB: 850,
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const trip2 = {
      id: 'trip_502',
      tripCode: 'ETB-AA-HW-01',
      routeId: routeAddisHaw.id,
      busId: bus2.id,
      driverName: 'Mekonnen Belay',
      driverPhone: '+251911445566',
      conductorName: 'Tesfaye Alemu',
      conductorPhone: '+251911778899',
      departureTime: new Date(today.setHours(7, 30, 0, 0)),
      estimatedArrivalTime: new Date(today.setHours(11, 30, 0, 0)),
      fareETB: 450,
      status: 'BOARDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const trip3 = {
      id: 'trip_503',
      tripCode: 'ETB-AA-DD-01',
      routeId: routeAddisDir.id,
      busId: bus3.id,
      driverName: 'Tariku Desta',
      driverPhone: '+251912334455',
      conductorName: 'Daniel Zewde',
      conductorPhone: '+251912667788',
      departureTime: new Date(today.setHours(6, 30, 0, 0)),
      estimatedArrivalTime: new Date(today.setHours(13, 30, 0, 0)),
      fareETB: 750,
      status: 'IN_TRANSIT',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.trips.push(trip1, trip2, trip3);

    // 10. Intermediate Segments for Trip 501:
    // Addis -> Debre Sina -> Dessie -> Bahir Dar (3 contiguous hops)
    const seg1 = {
      id: 'seg_501_1',
      tripId: trip1.id,
      fromStopId: stopADD.id,
      toStopId: stopDS.id,
      sequenceNumber: 1,
      distanceKm: 190,
      estimatedMinutes: 180,
      fareETB: 350
    };
    const seg2 = {
      id: 'seg_501_2',
      tripId: trip1.id,
      fromStopId: stopDS.id,
      toStopId: stopDES.id,
      sequenceNumber: 2,
      distanceKm: 210,
      estimatedMinutes: 180,
      fareETB: 300
    };
    const seg3 = {
      id: 'seg_501_3',
      tripId: trip1.id,
      fromStopId: stopDES.id,
      toStopId: stopBHR.id,
      sequenceNumber: 3,
      distanceKm: 220,
      estimatedMinutes: 180,
      fareETB: 350
    };
    this.tripSegments.push(seg1, seg2, seg3);

    // Segment Seats (3 segments * 45 seats = 135)
    for (const seg of [seg1, seg2, seg3]) {
      const bSeats = this.seats.filter(s => s.busId === bus1.id);
      for (const bs of bSeats) {
        this.tripSegmentSeats.push({
          id: `tss_${seg.id}_${bs.id}`,
          tripSegmentId: seg.id,
          busSeatId: bs.id,
          seatNumber: bs.seatNumber,
          status: 'AVAILABLE',
          priceETB: seg.fareETB
        });
      }
    }

    // 11. Seed Passengers & Bookings
    const passengerAlmaz = {
      id: 'p_almaz_01',
      fullName: 'Almaz Tadesse',
      phone: '+251911223344',
      email: 'almaz.tadesse@example.com',
      nationalId: 'ET-9912048123',
      city: 'Addis Ababa',
      emergencyContact: '+251911998877'
    };
    const passengerDawit = {
      id: 'p_dawit_02',
      fullName: 'Dawit Kebede',
      phone: '+251922334455',
      email: 'dawit.kebede@example.com',
      nationalId: 'ET-8823109412',
      city: 'Debre Sina',
      emergencyContact: '+251922001122'
    };
    this.passengers.push(passengerAlmaz, passengerDawit);

    const bookingAlmaz = {
      id: 'bk_almaz_01',
      bookingReference: 'BK-20260927-1A85C6',
      pnr: '1A85C6',
      tripId: trip1.id,
      passengerId: passengerAlmaz.id,
      customerPhone: passengerAlmaz.phone,
      totalAmountETB: 850,
      paymentMethod: 'TELEBIRR',
      paymentStatus: 'COMPLETED',
      status: 'CONFIRMED',
      channel: 'ONLINE_TELEBIRR',
      branchId: autobisTera.id,
      createdAt: new Date('2026-09-27T10:00:00Z'),
      updatedAt: new Date()
    };
    this.bookings.push(bookingAlmaz);

    const ticketAlmaz = {
      id: 'tkt_almaz_01',
      ticketNumber: 'TKT-416454',
      bookingId: bookingAlmaz.id,
      tripId: trip1.id,
      passengerId: passengerAlmaz.id,
      passengerName: passengerAlmaz.fullName,
      passengerPhone: passengerAlmaz.phone,
      seatNumber: '12A',
      fareETB: 850,
      status: 'CONFIRMED',
      qrToken: 'e065ee70574448ea6e860e65c0b11294',
      qrHash: 'e065ee70574448ea6e860e65c0b11294',
      createdAt: new Date('2026-09-27T10:00:00Z'),
      updatedAt: new Date()
    };
    this.tickets.push(ticketAlmaz);

    // 12. Maintenance Records
    this.maintenanceRecords.push({
      id: 'maint_01',
      busId: bus1.id,
      serviceType: 'PREVENTIVE_A',
      description: 'Engine oil flush, fuel filter replacement, and brake pad inspection.',
      odometerKm: 80000,
      costETB: 12500,
      technicianName: 'Solomon Bekele',
      status: 'COMPLETED',
      servicedAt: new Date('2026-08-15'),
      nextServiceKm: 90000
    });

    // 13. Spare Parts
    this.spareParts.push(
      {
        id: 'sp_01',
        partNumber: 'SC-OIL-FIL-09',
        name: 'Scania Oil Filter Element',
        category: 'FILTERS',
        stockQuantity: 18,
        minimumThreshold: 5,
        unitCostETB: 1850,
        supplierName: 'Scania Commercial Parts Ethiopia'
      },
      {
        id: 'sp_02',
        partNumber: 'BRK-PAD-HD-22',
        name: 'Heavy-Duty Ceramic Brake Pads',
        category: 'BRAKES',
        stockQuantity: 8,
        minimumThreshold: 4,
        unitCostETB: 6400,
        supplierName: 'Addis Brake Importers'
      }
    );

    // 14. Fuel Transactions
    this.fuelTransactions.push({
      id: 'fuel_01',
      busId: bus1.id,
      driverId: 'usr_driver_01',
      stationName: 'TotalEnergies Gotera Terminal Station',
      litersPumped: 240,
      pricePerLiterETB: 112.50,
      totalCostETB: 27000,
      odometerKm: 83500,
      fuelCardNumber: 'FC-ETH-9921',
      receiptNumber: 'TOT-2026-88912',
      recordedAt: new Date('2026-09-26T18:00:00Z')
    });

    // 15. Support Tickets & Complaints
    this.supportTickets.push({
      id: 'sup_01',
      ticketNumber: 'SUP-89102',
      customerName: 'Abebe Kebede',
      customerPhone: '+251911445588',
      category: 'LOST_ITEM',
      subject: 'Black Samsonite backpack left on Seat 04B',
      description: 'Left on trip ETB-AA-BD-01 Addis to Bahir Dar. Contains personal laptop.',
      priority: 'HIGH',
      status: 'INVESTIGATING',
      assignedTo: 'Customer Support Desk',
      createdAt: new Date('2026-09-27T08:30:00Z')
    });

    // 16. Audit Logs
    this.auditLogs.push(
      {
        id: 'aud_01',
        userId: 'usr_admin_01',
        action: 'COMPANY_INIT',
        entityName: 'Company',
        detailsJson: JSON.stringify({ company: 'Abyssinia Bus S.C.', tin: '0054892110' }),
        ipAddress: '197.156.104.22',
        createdAt: new Date('2026-01-01T08:00:00Z')
      },
      {
        id: 'aud_02',
        userId: 'usr_agent_01',
        action: 'SHIFT_OPEN',
        entityName: 'CashShift',
        detailsJson: JSON.stringify({ floatETB: 2500, branch: 'Autobis Tera' }),
        ipAddress: '197.156.104.55',
        createdAt: new Date('2026-09-27T05:30:00Z')
      }
    );
  }
}
