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
  final DateTime departureTime;

  const Ticket({
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
    required this.departureTime,
  });

  factory Ticket.fromJson(Map<String, dynamic> json, {String? bookingRef, String? tripRoute, DateTime? depTime}) {
    return Ticket(
      id: json['id'] ?? '',
      ticketNumber: json['ticketNumber'] ?? '',
      bookingReference: bookingRef ?? json['bookingReference'] ?? json['booking']?['bookingReference'] ?? '',
      tripCode: json['tripCode'] ?? '',
      route: tripRoute ?? json['route'] ?? 'Addis Ababa ➔ Bahir Dar',
      seatNumber: json['seatNumber'] ?? json['seat']?['seatNumber'] ?? '',
      passengerName: json['passengerName'] ?? json['fullName'] ?? '',
      passengerPhone: json['passengerPhone'] ?? json['phone'] ?? '',
      passengerIdNumber: json['passengerIdNumber'] ?? json['passportNumber'] ?? '',
      fareETB: (json['fare'] as num?)?.toDouble() ?? (json['fareETB'] as num?)?.toDouble() ?? 850.0,
      status: json['status'] ?? 'ISSUED',
      qrToken: json['qrToken'],
      qrHash: json['qrHash'],
      departureTime: depTime ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'ticketNumber': ticketNumber,
    'bookingReference': bookingReference,
    'tripCode': tripCode,
    'route': route,
    'seatNumber': seatNumber,
    'passengerName': passengerName,
    'passengerPhone': passengerPhone,
    'passengerIdNumber': passengerIdNumber,
    'fareETB': fareETB,
    'status': status,
    'qrToken': qrToken,
    'qrHash': qrHash,
    'departureTime': departureTime.toIso8601String(),
  };
}
