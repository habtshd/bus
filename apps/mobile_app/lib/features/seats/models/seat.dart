enum SeatStatus {
  available,
  held,
  confirmed,
  blocked,
}

class Seat {
  final String id;
  final String seatNumber;
  final int rowNumber;
  final String columnLetter;
  final SeatStatus status;

  const Seat({
    required this.id,
    required this.seatNumber,
    required this.rowNumber,
    required this.columnLetter,
    this.status = SeatStatus.available,
  });

  bool get isAvailable => status == SeatStatus.available;

  factory Seat.fromJson(Map<String, dynamic> json) {
    SeatStatus st = SeatStatus.available;
    final statusStr = json['status']?.toString().toUpperCase();
    if (statusStr == 'HELD' || statusStr == 'PAYMENT_PENDING') {
      st = SeatStatus.held;
    } else if (statusStr == 'CONFIRMED' || statusStr == 'SOLD' || statusStr == 'BOOKED') {
      st = SeatStatus.confirmed;
    } else if (statusStr == 'BLOCKED' || statusStr == 'MAINTENANCE') {
      st = SeatStatus.blocked;
    }

    return Seat(
      id: json['id'] ?? json['seatNumber'] ?? '',
      seatNumber: json['seatNumber'] ?? '',
      rowNumber: json['rowNumber'] ?? 1,
      columnLetter: json['columnLetter'] ?? '',
      status: st,
    );
  }
}
