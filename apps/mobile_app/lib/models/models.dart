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
      nameEn: json['nameEn'] ?? json['city'] ?? '',
      nameAm: json['nameAm'] ?? '',
      city: json['city'] ?? '',
      terminalArea: json['terminalArea'] ?? '',
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
      plateNumber: json['plateNumber'] ?? '',
      sideNumber: json['sideNumber'] ?? '',
      busModel: json['busModel'] ?? '',
      busType: json['busType'] ?? 'LUXURY_2X2',
      totalSeats: json['totalSeats'] ?? 45,
    );
  }
}

class Trip {
  final String id;
  final String tripCode;
  final String originCity;
  final String destinationCity;
  final String originTerminal;
  final String destinationTerminal;
  final DateTime departureTime;
  final DateTime estimatedArrivalTime;
  final double fareETB;
  final String status;
  final int availableSeatsCount;
  final int totalSeats;
  final Bus bus;
  final String driverName;
  final String conductorName;

  Trip({
    required this.id,
    required this.tripCode,
    required this.originCity,
    required this.destinationCity,
    required this.originTerminal,
    required this.destinationTerminal,
    required this.departureTime,
    required this.estimatedArrivalTime,
    required this.fareETB,
    required this.status,
    required this.availableSeatsCount,
    required this.totalSeats,
    required this.bus,
    required this.driverName,
    required this.conductorName,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    final route = json['route'] ?? {};
    final originStation = route['originStation'] ?? {};
    final destStation = route['destinationStation'] ?? {};

    return Trip(
      id: json['id'] ?? '',
      tripCode: json['tripCode'] ?? '',
      originCity: originStation['city'] ?? 'Addis Ababa',
      destinationCity: destStation['city'] ?? 'Hawassa',
      originTerminal: originStation['nameEn'] ?? 'Main Terminal',
      destinationTerminal: destStation['nameEn'] ?? 'Arrival Station',
      departureTime: DateTime.tryParse(json['departureTime'] ?? '') ?? DateTime.now(),
      estimatedArrivalTime: DateTime.tryParse(json['estimatedArrivalTime'] ?? '') ?? DateTime.now(),
      fareETB: (json['fareETB'] as num?)?.toDouble() ?? 650.0,
      status: json['status'] ?? 'SCHEDULED',
      availableSeatsCount: json['availableSeatsCount'] ?? 45,
      totalSeats: json['totalSeats'] ?? 45,
      bus: Bus.fromJson(json['bus'] ?? {}),
      driverName: json['driverName'] ?? 'Kebede Worku',
      conductorName: json['conductorName'] ?? 'Alemu Girma',
    );
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
    this.qrCodeDataUrl,
    required this.departureTime,
  });

  factory Ticket.fromJson(Map<String, dynamic> json, {String? bookingRef, String? tripRoute, DateTime? depTime}) {
    return Ticket(
      id: json['id'] ?? '',
      ticketNumber: json['ticketNumber'] ?? '',
      bookingReference: bookingRef ?? json['bookingReference'] ?? '',
      tripCode: json['tripCode'] ?? '',
      route: tripRoute ?? json['route'] ?? 'Addis Ababa ➔ Hawassa',
      seatNumber: json['seatNumber'] ?? '',
      passengerName: json['passengerName'] ?? '',
      passengerPhone: json['passengerPhone'] ?? '',
      passengerIdNumber: json['passengerIdNumber'] ?? '',
      fareETB: (json['fareETB'] as num?)?.toDouble() ?? 650.0,
      status: json['status'] ?? 'ISSUED',
      qrCodeDataUrl: json['qrCodeDataUrl'],
      departureTime: depTime ?? DateTime.now(),
    );
  }
}
