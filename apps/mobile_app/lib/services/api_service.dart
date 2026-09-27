import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // Supports local Windows machine or Android Emulator (10.0.2.2)
  static const String baseUrl = 'http://localhost:4000/api';

  static Future<List<Trip>> getTrips() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/trips'));
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((json) => Trip.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching trips: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>?> getTripDetails(String tripId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/trips/$tripId'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Error fetching trip details: $e');
      return null;
    }
  }

  static Future<bool> holdSeat(String tripId, List<String> seats, String sessionId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings/hold-seat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tripId': tripId,
          'seatNumbers': seats,
          'sessionId': sessionId,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<Map<String, dynamic>?> checkout({
    required String tripId,
    required String customerName,
    required String customerPhone,
    required String paymentMethod,
    required List<Map<String, dynamic>> passengers,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings/online-checkout'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tripId': tripId,
          'customerName': customerName,
          'customerPhone': customerPhone,
          'paymentMethod': paymentMethod,
          'passengers': passengers,
        }),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Checkout error: $e');
      return null;
    }
  }

  static Future<Map<String, dynamic>?> lookupBooking(String query) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bookings/$query'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      // Fallback to search
      final searchRes = await http.get(Uri.parse('$baseUrl/bookings/search?q=$query'));
      if (searchRes.statusCode == 200) {
        final data = jsonDecode(searchRes.body);
        if (data['bookings'] != null && (data['bookings'] as List).isNotEmpty) {
          return data['bookings'][0];
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
