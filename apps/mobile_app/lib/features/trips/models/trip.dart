class Trip {
  final String id;
  final String origin;
  final String destination;
  final String originCode;
  final String destinationCode;
  final DateTime departure;
  final DateTime? arrival;
  final String departureStr;
  final String arrivalStr;
  final double price;
  final int availableSeats;
  final int totalSeats;
  final String busName;
  final String busPlate;
  final String busSideNumber;
  final List<String> amenities;

  const Trip({
    required this.id,
    required this.origin,
    required this.destination,
    this.originCode = 'ADD',
    this.destinationCode = 'HWA',
    required this.departure,
    this.arrival,
    this.departureStr = '05:00 AM',
    this.arrivalStr = '02:00 PM',
    required this.price,
    required this.availableSeats,
    this.totalSeats = 49,
    required this.busName,
    this.busPlate = '3-98432-ET',
    this.busSideNumber = '501',
    this.amenities = const ['AC', 'WiFi', 'USB Power'],
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    if (json.containsKey('origin') && json.containsKey('destination')) {
      final dep = DateTime.tryParse(json['departureTime']?.toString() ?? '') ?? DateTime.now();
      final arr = DateTime.tryParse(json['arrivalTime']?.toString() ?? '') ?? dep.add(const Duration(hours: 8));

      return Trip(
        id: json['id'] ?? '',
        origin: json['origin'] ?? 'Addis Ababa',
        destination: json['destination'] ?? 'Bahir Dar',
        originCode: json['originCode'] ?? 'ADD',
        destinationCode: json['destinationCode'] ?? 'BD',
        departure: dep,
        arrival: arr,
        departureStr: json['departure'] ?? '05:00 AM',
        arrivalStr: json['arrival'] ?? '02:00 PM',
        price: (json['price'] as num?)?.toDouble() ?? 850.0,
        availableSeats: json['availableSeats'] ?? 18,
        totalSeats: json['totalSeats'] ?? 49,
        busName: json['busType'] ?? 'Scania SB-023 Coach',
        busPlate: json['busPlate'] ?? '3-98432-ET',
        busSideNumber: json['busSideNumber'] ?? '501',
        amenities: json['amenities'] != null ? List<String>.from(json['amenities']) : ['AC', 'WiFi'],
      );
    }

    final route = json['route'] ?? {};
    final originStop = route['originStop'] ?? route['originStation'] ?? {};
    final destStop = route['destinationStop'] ?? route['destinationStation'] ?? {};

    return Trip(
      id: json['id'] ?? '',
      origin: originStop['name'] ?? originStop['city'] ?? 'Addis Ababa',
      destination: destStop['name'] ?? destStop['city'] ?? 'Bahir Dar',
      originCode: originStop['code'] ?? 'ADD',
      destinationCode: destStop['code'] ?? 'BD',
      departure: DateTime.tryParse(json['scheduledDeparture'] ?? '') ?? DateTime.now(),
      arrival: DateTime.tryParse(json['scheduledArrival'] ?? '') ?? DateTime.now().add(const Duration(hours: 9)),
      departureStr: '05:00 AM',
      arrivalStr: '02:00 PM',
      price: (json['price'] as num?)?.toDouble() ?? (json['fareETB'] as num?)?.toDouble() ?? 850.0,
      availableSeats: json['availableSeats'] ?? 18,
      totalSeats: json['totalSeats'] ?? 49,
      busName: json['bus']?['busModel'] ?? 'SB-023 Executive Coach',
      busPlate: json['bus']?['plateNumber'] ?? '3-98432-ET',
      busSideNumber: json['bus']?['sideNumber'] ?? '501',
      amenities: const ['AC', 'WiFi', 'USB Power'],
    );
  }
}
