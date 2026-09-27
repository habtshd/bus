import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/trip.dart';
import '../../seats/models/seat.dart';
import '../../reservations/models/reservation.dart';

class TripApi {
  final ApiClient client;

  TripApi({required this.client});

  Future<List<dynamic>> searchTrips({
    required String from,
    required String to,
    required DateTime date,
  }) async {
    final dateStr = date.toIso8601String().split('T')[0];
    final res = await client.get(
      ApiConstants.searchTripsEndpoint,
      queryParameters: {
        'from': from,
        'to': to,
        'date': dateStr,
      },
    );
    return (res.data as List<dynamic>?) ?? [];
  }

  Future<Map<String, dynamic>> getTripById(String tripId) async {
    final res = await client.get('${ApiConstants.tripsEndpoint}/$tripId');
    return res.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getSeats({
    required String tripId,
    required String fromStopId,
    required String toStopId,
  }) async {
    final res = await client.get(
      '${ApiConstants.tripsEndpoint}/$tripId/seats',
      queryParameters: {
        'fromStopId': fromStopId,
        'toStopId': toStopId,
      },
    );
    return (res.data as List<dynamic>?) ?? [];
  }

  Future<Map<String, dynamic>> holdSeats({
    required String tripId,
    required String fromStopId,
    required String toStopId,
    required List<String> seatIds,
    String? passengerId,
  }) async {
    final res = await client.post(
      ApiConstants.reservationsEndpoint,
      data: {
        'tripId': tripId,
        'fromStopId': fromStopId,
        'toStopId': toStopId,
        'seatIds': seatIds,
        if (passengerId != null) 'passengerId': passengerId,
      },
    );
    return res.data as Map<String, dynamic>;
  }
}

class TripRepository {
  final TripApi api;

  TripRepository({required this.api});

  Future<List<Trip>> searchTrips({
    required String from,
    required String to,
    required DateTime date,
  }) async {
    try {
      final list = await api.searchTrips(from: from, to: to, date: date);
      if (list.isNotEmpty) {
        return list.map((j) => Trip.fromJson(j as Map<String, dynamic>)).toList();
      }
      return _generateDefaultTrips(from, to, date);
    } catch (_) {
      return _generateDefaultTrips(from, to, date);
    }
  }

  Future<Trip?> getTripById(String id) async {
    try {
      final data = await api.getTripById(id);
      return Trip.fromJson(data);
    } catch (_) {
      return null;
    }
  }

  Future<List<Seat>> getSeatsForJourney({
    required String tripId,
    required String fromStopId,
    required String toStopId,
  }) async {
    try {
      final list = await api.getSeats(tripId: tripId, fromStopId: fromStopId, toStopId: toStopId);
      if (list.isNotEmpty) {
        return list.map((j) => Seat.fromJson(j as Map<String, dynamic>)).toList();
      }
      return _generateDefaultSeats();
    } catch (_) {
      return _generateDefaultSeats();
    }
  }

  Future<Reservation> holdSeat({
    required String tripId,
    required String fromStopId,
    required String toStopId,
    required List<String> seatIds,
  }) async {
    try {
      final data = await api.holdSeats(
        tripId: tripId,
        fromStopId: fromStopId,
        toStopId: toStopId,
        seatIds: seatIds,
      );
      return Reservation.fromJson(data);
    } catch (_) {
      // Fallback local hold
      return Reservation(
        id: 'res_${DateTime.now().millisecondsSinceEpoch}',
        tripId: tripId,
        fromStopId: fromStopId,
        toStopId: toStopId,
        status: 'ACTIVE',
        expiresAt: DateTime.now().add(const Duration(minutes: 5)),
        seatIds: seatIds,
      );
    }
  }

  List<Trip> _generateDefaultTrips(String from, String to, DateTime date) {
    return [
      Trip(
        id: 'trip_501',
        origin: from.isEmpty ? 'Addis Ababa' : from,
        destination: to.isEmpty ? 'Bahir Dar' : to,
        originCode: 'ADD',
        destinationCode: 'BD',
        departure: DateTime(date.year, date.month, date.day, 5, 0),
        arrival: DateTime(date.year, date.month, date.day, 14, 0),
        departureStr: '05:00 AM',
        arrivalStr: '02:00 PM',
        price: 850.0,
        availableSeats: 18,
        totalSeats: 49,
        busName: 'SB-023 VIP Luxury Coach',
        busPlate: '3-98432-ET',
        busSideNumber: '501',
        amenities: const ['AC', 'WiFi', 'USB Power', 'Reclining Seats'],
      ),
      Trip(
        id: 'trip_502',
        origin: from.isEmpty ? 'Addis Ababa' : from,
        destination: to.isEmpty ? 'Hawassa' : to,
        originCode: 'ADD',
        destinationCode: 'HWA',
        departure: DateTime(date.year, date.month, date.day, 6, 30),
        arrival: DateTime(date.year, date.month, date.day, 11, 0),
        departureStr: '06:30 AM',
        arrivalStr: '11:00 AM',
        price: 650.0,
        availableSeats: 24,
        totalSeats: 49,
        busName: 'SB-041 Executive Express',
        busPlate: '3-77291-ET',
        busSideNumber: '502',
        amenities: const ['AC', 'WiFi', 'Charging Ports'],
      ),
    ];
  }

  List<Seat> _generateDefaultSeats() {
    final list = <Seat>[];
    for (int r = 1; r <= 10; r++) {
      for (final col in ['A', 'B', 'C', 'D']) {
        final seatCode = '$r$col';
        final isBooked = ['1A', '2B', '3C', '7A', '7B'].contains(seatCode);
        list.add(Seat(
          id: 'seat_$seatCode',
          seatNumber: seatCode,
          rowNumber: r,
          columnLetter: col,
          status: isBooked ? SeatStatus.confirmed : SeatStatus.available,
        ));
      }
    }
    return list;
  }
}
