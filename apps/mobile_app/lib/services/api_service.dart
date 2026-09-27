import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // Use localhost for desktop/web testing, or 10.0.2.2 for Android emulator
  static const String baseUrl = 'http://localhost:4000/api/v1';

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  /// Search trips with origin, destination, and travel date
  static Future<List<Trip>> searchTrips({
    String from = 'Addis Ababa',
    String to = 'Hawassa',
    DateTime? date,
  }) async {
    try {
      final dateStr = (date ?? DateTime.now()).toIso8601String().split('T')[0];
      final uri = Uri.parse('$baseUrl/trips/search').replace(queryParameters: {
        'from': from,
        'to': to,
        'date': dateStr,
      });

      final response = await http.get(uri, headers: _headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          return data.map((json) => Trip.fromJson(json)).toList();
        }
      }
      return await getTrips();
    } catch (e) {
      print('searchTrips fallback: $e');
      return await getTrips();
    }
  }

  /// Get all scheduled trips fallback
  static Future<List<Trip>> getTrips() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/trips'), headers: _headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((json) => Trip.fromJson(json)).toList();
      }
      return _generateDefaultTrips();
    } catch (e) {
      print('getTrips offline fallback: $e');
      return _generateDefaultTrips();
    }
  }

  /// Get available segment seats
  static Future<List<Seat>> getAvailableSeats({
    required String tripId,
    required String fromStopId,
    required String toStopId,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/trips/$tripId/seats').replace(queryParameters: {
        'fromStopId': fromStopId,
        'toStopId': toStopId,
      });
      final response = await http.get(uri, headers: _headers);
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((json) => Seat.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('getAvailableSeats error: $e');
      return [];
    }
  }

  /// Hold seat inventory atomically for 5 minutes
  static Future<Reservation?> createReservation({
    required String tripId,
    required String fromStopId,
    required String toStopId,
    required List<String> seatIds,
    String? passengerId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/reservations'),
        headers: _headers,
        body: jsonEncode({
          'tripId': tripId,
          'fromStopId': fromStopId,
          'toStopId': toStopId,
          'seatIds': seatIds,
          'passengerId': passengerId,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Reservation.fromJson(data);
      }
      return null;
    } catch (e) {
      print('createReservation error: $e');
      return null;
    }
  }

  /// Create booking from confirmed reservation (server-side fare calculation)
  static Future<Map<String, dynamic>?> createBooking({
    required String reservationId,
    required List<Map<String, dynamic>> passengers,
    String paymentMethod = 'TELEBIRR',
    String channel = 'PASSENGER_APP',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: _headers,
        body: jsonEncode({
          'reservationId': reservationId,
          'passengers': passengers,
          'paymentMethod': paymentMethod,
          'channel': channel,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      print('createBooking failed: ${response.statusCode} - ${response.body}');
      return null;
    } catch (e) {
      print('createBooking error: $e');
      return null;
    }
  }

  /// Simulate payment webhook confirmation (Telebirr/Chapa callback)
  static Future<bool> simulatePaymentWebhook({
    required String paymentReference,
    required double amount,
    String provider = 'TELEBIRR',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payments/webhook'),
        headers: _headers,
        body: jsonEncode({
          'provider': provider,
          'transactionId': 'TX-${DateTime.now().millisecondsSinceEpoch}',
          'paymentReference': paymentReference,
          'amount': amount,
          'currency': 'ETB',
          'status': 'SUCCESS',
        }),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('simulatePaymentWebhook error: $e');
      return false;
    }
  }

  /// Get booking with tickets
  static Future<Map<String, dynamic>?> getBooking(String query) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bookings/$query'), headers: _headers);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      final searchRes = await http.get(Uri.parse('$baseUrl/bookings/search?q=$query'), headers: _headers);
      if (searchRes.statusCode == 200) {
        final data = jsonDecode(searchRes.body);
        if (data is List && data.isNotEmpty) {
          return data[0];
        } else if (data['bookings'] != null && (data['bookings'] as List).isNotEmpty) {
          return data['bookings'][0];
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Cancel booking
  static Future<bool> cancelBooking(String bookingId, String reason) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings/$bookingId/cancel'),
        headers: _headers,
        body: jsonEncode({'reason': reason}),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  static List<Trip> _generateDefaultTrips() {
    return [
      Trip(
        id: 'trip-aa-hwa-01',
        tripCode: 'ETB-AA-HW-01',
        originCity: 'Addis Ababa',
        destinationCity: 'Hawassa',
        originTerminal: 'Addis Ababa Kality Terminal',
        destinationTerminal: 'Hawassa Central Bus Station',
        departureTime: DateTime.now().add(const Duration(hours: 2)),
        estimatedArrivalTime: DateTime.now().add(const Duration(hours: 6, minutes: 30)),
        departureStr: '05:00',
        arrivalStr: '09:30',
        fareETB: 650.0,
        status: 'OPEN',
        availableSeatsCount: 42,
        totalSeats: 49,
        bus: Bus(
          id: 'bus-1',
          plateNumber: '3-98432-ET',
          sideNumber: '501',
          busModel: 'Scania Marcopolo G7',
          busType: 'LUXURY_COACH',
          totalSeats: 49,
        ),
      ),
      Trip(
        id: 'trip-aa-bd-01',
        tripCode: 'ETB-AA-BD-02',
        originCity: 'Addis Ababa',
        destinationCity: 'Bahir Dar',
        originTerminal: 'Addis Ababa Autopark Terminal',
        destinationTerminal: 'Bahir Dar Station',
        departureTime: DateTime.now().add(const Duration(hours: 3)),
        estimatedArrivalTime: DateTime.now().add(const Duration(hours: 12)),
        departureStr: '05:30',
        arrivalStr: '14:30',
        fareETB: 1200.0,
        status: 'OPEN',
        availableSeatsCount: 36,
        totalSeats: 49,
        bus: Bus(
          id: 'bus-2',
          plateNumber: '3-77291-ET',
          sideNumber: '502',
          busModel: 'Volvo B11R Luxury',
          busType: 'VIP_COACH',
          totalSeats: 49,
        ),
      ),
    ];
  }
}
