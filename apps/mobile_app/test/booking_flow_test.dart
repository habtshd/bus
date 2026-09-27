import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:abyssiniabus_mobile/models/models.dart';
import 'package:abyssiniabus_mobile/screens/booking_flow_screens.dart';
import 'package:abyssiniabus_mobile/screens/ticket_profile_screens.dart';

void main() {
  group('Mobile Models & End-to-End Booking Tests', () {
    test('Trip model parses searchTrips flat backend response accurately', () {
      final json = {
        'id': 'trip_501',
        'routeCode': 'ETB-AA-HW-01',
        'origin': 'Addis Ababa',
        'originCode': 'ADD',
        'destination': 'Hawassa',
        'destinationCode': 'HWA',
        'departure': '05:00',
        'arrival': '09:30',
        'departureTime': '2026-10-05T05:00:00.000Z',
        'arrivalTime': '2026-10-05T09:30:00.000Z',
        'price': 650.0,
        'availableSeats': 45,
        'totalSeats': 49,
        'busPlate': '3-98432-ET',
        'busSideNumber': '501',
        'busType': 'LUXURY_COACH',
        'amenities': ['AC', 'WiFi', 'USB Power'],
      };

      final trip = Trip.fromJson(json);
      expect(trip.id, 'trip_501');
      expect(trip.tripCode, 'ETB-AA-HW-01');
      expect(trip.originCity, 'Addis Ababa');
      expect(trip.destinationCity, 'Hawassa');
      expect(trip.fareETB, 650.0);
      expect(trip.availableSeatsCount, 45);
      expect(trip.bus.plateNumber, '3-98432-ET');
    });

    test('Reservation model parses 5-minute atomic seat hold and expiresAt correctly', () {
      final expiresAt = DateTime.now().add(const Duration(minutes: 5));
      final json = {
        'id': 'res_9001',
        'tripId': 'trip_501',
        'fromStopId': 'ADD',
        'toStopId': 'HWA',
        'status': 'ACTIVE',
        'expiresAt': expiresAt.toIso8601String(),
        'seats': ['1A', '1B'],
      };

      final res = Reservation.fromJson(json);
      expect(res.id, 'res_9001');
      expect(res.seatIds.length, 2);
      expect(res.seatIds, contains('1A'));
      expect(res.isExpired, isFalse);
      expect(res.remainingSeconds, greaterThan(280));
    });

    test('Ticket model parses cryptographic gate QR token and hash', () {
      final json = {
        'id': 'tkt_001',
        'ticketNumber': 'TKT-20261005-92831',
        'bookingReference': 'BK-20261005-00125',
        'seatNumber': '1A',
        'passengerName': 'Mulugeta Tesfaye',
        'passengerPhone': '+251911998877',
        'passengerIdNumber': 'KB-12-0941',
        'fareETB': 650.0,
        'status': 'ISSUED',
        'qrToken': 'ABY-QR-990812',
        'qrHash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      };

      final ticket = Ticket.fromJson(json);
      expect(ticket.ticketNumber, 'TKT-20261005-92831');
      expect(ticket.qrToken, 'ABY-QR-990812');
      expect(ticket.qrHash, isNotNull);
      expect(ticket.seatNumber, '1A');
    });

    testWidgets('SeatSelectionScreen allows selecting seat and displaying fare', (WidgetTester tester) async {
      final trip = Trip(
        id: 'trip-test',
        tripCode: 'ETB-AA-HW-01',
        originCity: 'Addis Ababa',
        destinationCity: 'Hawassa',
        originTerminal: 'Kality Terminal',
        destinationTerminal: 'Hawassa Terminal',
        departureTime: DateTime.now().add(const Duration(hours: 4)),
        estimatedArrivalTime: DateTime.now().add(const Duration(hours: 8)),
        fareETB: 650.0,
        status: 'OPEN',
        availableSeatsCount: 40,
        totalSeats: 49,
        bus: Bus(
          id: 'b-1',
          plateNumber: '3-98432-ET',
          sideNumber: '501',
          busModel: 'Scania',
          busType: 'LUXURY_COACH',
          totalSeats: 49,
        ),
      );

      await tester.pumpWidget(MaterialApp(
        home: SeatSelectionScreen(trip: trip),
      ));

      // Check seat map header
      expect(find.text('Seat Map • ETB-AA-HW-01'), findsOneWidget);
      expect(find.text('0 ETB'), findsOneWidget);

      // Tap on available seat 4A
      final seat4A = find.text('4A');
      expect(seat4A, findsOneWidget);
      await tester.tap(seat4A);
      await tester.pump();

      // Check updated total fare
      expect(find.text('650 ETB'), findsOneWidget);
      expect(find.text('1 Seat(s): 4A'), findsOneWidget);
    });

    testWidgets('QrTicketScreen renders cryptographic boarding pass and gate instructions', (WidgetTester tester) async {
      final ticket = Ticket(
        id: 'tkt_demo',
        ticketNumber: 'TKT-20261005-92831',
        bookingReference: 'BK-20261005-00125',
        tripCode: 'ETB-AA-HW-01',
        route: 'Addis Ababa ➔ Hawassa',
        seatNumber: '12A',
        passengerName: 'Mulugeta Tesfaye',
        passengerPhone: '+251911998877',
        passengerIdNumber: 'KB-12-0941',
        fareETB: 650.0,
        status: 'CONFIRMED',
        qrToken: 'ABY-QR-990812',
        departureTime: DateTime.now().add(const Duration(hours: 2)),
      );

      await tester.pumpWidget(MaterialApp(
        home: QrTicketScreen(ticket: ticket),
      ));

      expect(find.text('Digital Boarding Pass'), findsOneWidget);
      expect(find.text('ABYSSINIA BUS'), findsOneWidget);
      expect(find.text('SCAN AT BUS DOOR GATE FOR BOARDING'), findsOneWidget);
      expect(find.text('12A'), findsOneWidget);
      expect(find.text('BK-20261005-00125'), findsOneWidget);
      expect(find.text('Live GPS Track'), findsOneWidget);
    });
  });
}
