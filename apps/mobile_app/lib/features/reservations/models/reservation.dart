class Reservation {
  final String id;
  final String tripId;
  final String fromStopId;
  final String toStopId;
  final String status;
  final DateTime expiresAt;
  final List<String> seatIds;

  const Reservation({
    required this.id,
    required this.tripId,
    required this.fromStopId,
    required this.toStopId,
    required this.status,
    required this.expiresAt,
    required this.seatIds,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  int get remainingSeconds {
    final diff = expiresAt.difference(DateTime.now()).inSeconds;
    return diff > 0 ? diff : 0;
  }

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
}
