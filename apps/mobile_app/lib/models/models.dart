class Station {
  final String id;
  final String nameEn;
  final String nameAm;
  final String city;
  final String terminalArea;

  Station({
    required this.id,
    required this.nameEn,
    required this.nameAm,
    required this.city,
    required this.terminalArea,
  });

  factory Station.fromJson(Map<String, dynamic> json) {
    return Station(
      id: json['id'] ?? '',
      nameEn: json['nameEn'] ?? json['city'] ?? json['name'] ?? '',
      nameAm: json['nameAm'] ?? '',
      city: json['city'] ?? json['name'] ?? '',
      terminalArea: json['terminalArea'] ?? json['address'] ?? '',
    );
  }
}

class Bus {
  final String id;
  final String plateNumber;
  final String sideNumber;
  final String busModel;
  final String busType;
  final int totalSeats;

  Bus({
    required this.id,
    required this.plateNumber,
    required this.sideNumber,
    required this.busModel,
    required this.busType,
    required this.totalSeats,
  });

  factory Bus.fromJson(Map<String, dynamic> json) {
    return Bus(
      id: json['id'] ?? '',
      plateNumber: json['plateNumber'] ?? json['busPlate'] ?? '',
      sideNumber: json['sideNumber'] ?? json['busSideNumber'] ?? '',
      busModel: json['busModel'] ?? json['model'] ?? 'Scania Marcopolo G7',
      busType: json['busType'] ?? 'LUXURY_COACH',
      totalSeats: json['totalSeats'] ?? 49,
    );
  }
}

class Trip {
  final String id;
  final String tripCode;
  final String routeId;
  final String originCity;
  final String originCode;
  final String destinationCity;
  final String destinationCode;
  final String originTerminal;
  final String destinationTerminal;
  final DateTime departureTime;
  final DateTime estimatedArrivalTime;
  final String departureStr;
  final String arrivalStr;
  final double fareETB;
  final String status;
  final int availableSeatsCount;
  final int totalSeats;
  final Bus bus;
  final List<String> amenities;

  Trip({
    required this.id,
    required this.tripCode,
    this.routeId = '',
    required this.originCity,
    this.originCode = 'ADD',
    required this.destinationCity,
    this.destinationCode = 'HWA',
    required this.originTerminal,
    required this.destinationTerminal,
    required this.departureTime,
    required this.estimatedArrivalTime,
    this.departureStr = '05:00',
    this.arrivalStr = '14:00',
    required this.fareETB,
    required this.status,
    required this.availableSeatsCount,
    required this.totalSeats,
    required this.bus,
    this.amenities = const ['AC', 'WiFi'],
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    // Handle searchTrips flat response format
    if (json.containsKey('origin') && json.containsKey('destination')) {
      final depTime = DateTime.tryParse(json['departureTime']?.toString() ?? '') ?? DateTime.now();
      final arrTime = DateTime.tryParse(json['arrivalTime']?.toString() ?? '') ?? depTime.add(const Duration(hours: 8));

      return Trip(
        id: json['id'] ?? '',
        tripCode: json['routeCode'] ?? json['tripCode'] ?? 'ETB-AA-01',
        routeId: json['routeId'] ?? '',
        originCity: json['origin'] ?? 'Addis Ababa',
        originCode: json['originCode'] ?? 'ADD',
        destinationCity: json['destination'] ?? 'Hawassa',
        destinationCode: json['destinationCode'] ?? 'HWA',
        originTerminal: '${json['origin'] ?? 'Addis Ababa'} Main Terminal',
        destinationTerminal: '${json['destination'] ?? 'Destination'} Terminal',
        departureTime: depTime,
        estimatedArrivalTime: arrTime,
        departureStr: json['departure'] ?? '05:00',
        arrivalStr: json['arrival'] ?? '14:00',
        fareETB: (json['price'] as num?)?.toDouble() ?? 650.0,
        status: 'OPEN',
        availableSeatsCount: json['availableSeats'] ?? json['totalSeats'] ?? 45,
        totalSeats: json['totalSeats'] ?? 49,
        bus: Bus(
          id: json['busPlate'] ?? '',
          plateNumber: json['busPlate'] ?? '3-98432-ET',
          sideNumber: json['busSideNumber'] ?? '501',
          busModel: 'Scania Highline Coach',
          busType: json['busType'] ?? 'LUXURY_COACH',
          totalSeats: json['totalSeats'] ?? 49,
        ),
        amenities: json['amenities'] != null ? List<String>.from(json['amenities']) : ['AC', 'WiFi'],
      );
    }

    // Handle nested format from trips query
    final route = json['route'] ?? {};
    final originStation = route['originStop'] ?? route['originStation'] ?? {};
    final destStation = route['destinationStop'] ?? route['destinationStation'] ?? {};

    return Trip(
      id: json['id'] ?? '',
      tripCode: json['tripCode'] ?? route['routeCode'] ?? 'ETB-AA-01',
      routeId: json['routeId'] ?? route['id'] ?? '',
      originCity: originStation['name'] ?? originStation['city'] ?? 'Addis Ababa',
      originCode: originStation['code'] ?? 'ADD',
      destinationCity: destStation['name'] ?? destStation['city'] ?? 'Hawassa',
      destinationCode: destStation['code'] ?? 'HWA',
      originTerminal: originStation['name'] ?? 'Main Terminal',
      destinationTerminal: destStation['name'] ?? 'Arrival Station',
      departureTime: DateTime.tryParse(json['scheduledDeparture'] ?? json['departureTime'] ?? '') ?? DateTime.now(),
      estimatedArrivalTime: DateTime.tryParse(json['scheduledArrival'] ?? json['estimatedArrivalTime'] ?? '') ?? DateTime.now().add(const Duration(hours: 8)),
      departureStr: '05:00',
      arrivalStr: '14:00',
      fareETB: (json['price'] as num?)?.toDouble() ?? (json['fareETB'] as num?)?.toDouble() ?? 650.0,
      status: json['status'] ?? 'SCHEDULED',
      availableSeatsCount: json['availableSeats'] ?? json['availableSeatsCount'] ?? 45,
      totalSeats: json['totalSeats'] ?? 49,
      bus: Bus.fromJson(json['bus'] ?? {}),
      amenities: const ['AC', 'WiFi', 'USB Power'],
    );
  }
}

class Seat {
  final String id;
  final String seatNumber;
  final int rowNumber;
  final String columnLetter;
  final String seatClass;
  final bool isAvailable;

  Seat({
    required this.id,
    required this.seatNumber,
    required this.rowNumber,
    required this.columnLetter,
    this.seatClass = 'STANDARD',
    this.isAvailable = true,
  });

  factory Seat.fromJson(Map<String, dynamic> json) {
    return Seat(
      id: json['id'] ?? json['seatNumber'] ?? '',
      seatNumber: json['seatNumber'] ?? '',
      rowNumber: json['rowNumber'] ?? 1,
      columnLetter: json['columnLetter'] ?? '',
      seatClass: json['seatClass'] ?? 'STANDARD',
      isAvailable: json['status'] == null ? true : json['status'] == 'AVAILABLE',
    );
  }
}

class Reservation {
  final String id;
  final String tripId;
  final String fromStopId;
  final String toStopId;
  final String status;
  final DateTime expiresAt;
  final List<String> seatIds;

  Reservation({
    required this.id,
    required this.tripId,
    required this.fromStopId,
    required this.toStopId,
    required this.status,
    required this.expiresAt,
    required this.seatIds,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    final seatsList = <String>[];
    if (json['tripSeats'] != null) {
      for (final s in json['tripSeats']) {
        final busSeat = s['busSeat'];
        if (busSeat != null && busSeat['seatNumber'] != null) {
          seatsList.add(busSeat['seatNumber'].toString());
        } else if (s['busSeatId'] != null) {
          seatsList.add(s['busSeatId'].toString());
        }
      }
    } else if (json['seats'] != null) {
      for (final s in json['seats']) {
        seatsList.add(s.toString());
      }
    }

    return Reservation(
      id: json['id'] ?? '',
      tripId: json['tripId'] ?? '',
      fromStopId: json['fromStopId'] ?? '',
      toStopId: json['toStopId'] ?? '',
      status: json['status'] ?? 'ACTIVE',
      expiresAt: DateTime.tryParse(json['expiresAt'] ?? '') ?? DateTime.now().add(const Duration(minutes: 5)),
      seatIds: seatsList,
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  int get remainingSeconds {
    final diff = expiresAt.difference(DateTime.now()).inSeconds;
    return diff > 0 ? diff : 0;
  }
}

class Ticket {
  final String id;
  final String ticketNumber;
  final String bookingReference;
  final String tripCode;
  final String route;
  final String seatNumber;
  final String passengerName;
  final String passengerPhone;
  final String passengerIdNumber;
  final double fareETB;
  final String status;
  final String? qrToken;
  final String? qrHash;
  final String? qrCodeDataUrl;
  final DateTime departureTime;

  Ticket({
    required this.id,
    required this.ticketNumber,
    required this.bookingReference,
    required this.tripCode,
    required this.route,
    required this.seatNumber,
    required this.passengerName,
    required this.passengerPhone,
    required this.passengerIdNumber,
    required this.fareETB,
    required this.status,
    this.qrToken,
    this.qrHash,
    this.qrCodeDataUrl,
    required this.departureTime,
  });

  factory Ticket.fromJson(Map<String, dynamic> json, {String? bookingRef, String? tripRoute, DateTime? depTime}) {
    return Ticket(
      id: json['id'] ?? '',
      ticketNumber: json['ticketNumber'] ?? '',
      bookingReference: bookingRef ?? json['bookingReference'] ?? json['booking']?['bookingReference'] ?? '',
      tripCode: json['tripCode'] ?? '',
      route: tripRoute ?? json['route'] ?? 'Addis Ababa ➔ Hawassa',
      seatNumber: json['seatNumber'] ?? json['seat']?['seatNumber'] ?? '',
      passengerName: json['passengerName'] ?? json['fullName'] ?? '',
      passengerPhone: json['passengerPhone'] ?? json['phone'] ?? '',
      passengerIdNumber: json['passengerIdNumber'] ?? json['passportNumber'] ?? '',
      fareETB: (json['fare'] as num?)?.toDouble() ?? (json['fareETB'] as num?)?.toDouble() ?? 650.0,
      status: json['status'] ?? 'ISSUED',
      qrToken: json['qrToken'],
      qrHash: json['qrHash'],
      qrCodeDataUrl: json['qrCodeDataUrl'],
      departureTime: depTime ?? DateTime.now(),
    );
  }
}
