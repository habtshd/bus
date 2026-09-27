class TrackingInfo {
  final String tripId;
  final String busName;
  final String busPlate;
  final String status;
  final String currentLocation;
  final String nextStop;
  final String eta;
  final int speedKmh;
  final double distanceRemainingKm;
  final String driverName;
  final String conductorName;

  const TrackingInfo({
    required this.tripId,
    required this.busName,
    required this.busPlate,
    required this.status,
    required this.currentLocation,
    required this.nextStop,
    required this.eta,
    required this.speedKmh,
    required this.distanceRemainingKm,
    required this.driverName,
    required this.conductorName,
  });

  factory TrackingInfo.fromJson(Map<String, dynamic> json) {
    return TrackingInfo(
      tripId: json['tripId'] ?? '',
      busName: json['busName'] ?? 'SB-023 Coach',
      busPlate: json['busPlate'] ?? '3-98432-ET',
      status: json['status'] ?? 'ON TIME',
      currentLocation: json['currentLocation'] ?? 'Debre Sina Pass',
      nextStop: json['nextStop'] ?? 'Dessie Terminal',
      eta: json['eta'] ?? '01:45 PM',
      speedKmh: json['speedKmh'] ?? 74,
      distanceRemainingKm: (json['distanceRemainingKm'] as num?)?.toDouble() ?? 184.0,
      driverName: json['driverName'] ?? 'Capt. Kebede Worku',
      conductorName: json['conductorName'] ?? 'Alemu Girma',
    );
  }
}
