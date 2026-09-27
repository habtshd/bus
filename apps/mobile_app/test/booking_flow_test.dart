import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:abyssiniabus_mobile/features/trips/models/trip.dart';
import 'package:abyssiniabus_mobile/features/reservations/models/reservation.dart';
import 'package:abyssiniabus_mobile/features/tickets/models/ticket.dart';
import 'package:abyssiniabus_mobile/features/seats/models/seat.dart';
import 'package:abyssiniabus_mobile/features/booking/models/booking_passenger.dart';
import 'package:abyssiniabus_mobile/shared/providers/app_providers.dart';
import 'package:abyssiniabus_mobile/features/seats/presentation/seat_selection_page.dart';
import 'package:abyssiniabus_mobile/features/tickets/presentation/ticket_page.dart';
import 'package:abyssiniabus_mobile/app/app.dart';

void main() {
  group('Mobile Production Architecture & Booking Tests', () {
    test('Trip model parses searchTrips flat backend response accurately', () {
      final json = {
        'id': 'trip_501',
        'routeCode': 'ETB-AA-HW-01',
        'origin': 'Addis Ababa',
        'originCode': 'ADD',
        'destination': 'Bahir Dar',
        'destinationCode': 'BD',
        'departure': '05:00 AM',
        'arrival': '02:00 PM',
        'departureTime': '2026-10-05T05:00:00.000Z',
        'arrivalTime': '2026-10-05T14:00:00.000Z',
        'price': 850.0,
        'availableSeats': 18,
        'totalSeats': 49,
        'busPlate': '3-98432-ET',
        'busSideNumber': '501',
        'busType': 'VIP_COACH',
        'amenities': ['AC', 'WiFi', 'USB Power'],
      };

      final trip = Trip.fromJson(json);
      expect(trip.id, 'trip_501');
      expect(trip.origin, 'Addis Ababa');
      expect(trip.destination, 'Bahir Dar');
      expect(trip.price, 850.0);
      expect(trip.availableSeats, 18);
      expect(trip.busPlate, '3-98432-ET');
    });

    test('Reservation model parses 5-minute atomic seat hold and expiresAt correctly', () {
      final expiresAt = DateTime.now().add(const Duration(minutes: 5));
      final json = {
        'id': 'res_9001',
        'tripId': 'trip_501',
        'fromStopId': 'ADD',
        'toStopId': 'BD',
        'status': 'ACTIVE',
        'expiresAt': expiresAt.toIso8601String(),
        'seats': ['12A', '12B'],
      };

      final res = Reservation.fromJson(json);
      expect(res.id, 'res_9001');
      expect(res.seatIds.length, 2);
      expect(res.seatIds, contains('12A'));
      expect(res.isExpired, isFalse);
      expect(res.remainingSeconds, greaterThan(280));
    });

    test('Ticket model parses cryptographic gate QR token and hash', () {
      final json = {
        'id': 'tkt_001',
        'ticketNumber': 'TKT-20261005-92831',
        'bookingReference': 'BK-20261005-00125',
        'seatNumber': '12A',
        'passengerName': 'John Smith',
        'passengerPhone': '+251911223344',
        'passengerIdNumber': 'KB-12-0941',
        'fareETB': 850.0,
        'status': 'CONFIRMED',
        'qrToken': 'ABY-QR-990812',
        'qrHash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      };

      final ticket = Ticket.fromJson(json);
      expect(ticket.ticketNumber, 'TKT-20261005-92831');
      expect(ticket.qrToken, 'ABY-QR-990812');
      expect(ticket.qrHash, isNotNull);
      expect(ticket.seatNumber, '12A');
    });

    test('BookingPassenger model serializes correctly', () {
      const passenger = BookingPassenger(
        seatId: '12A',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+251911223344',
        passportNumber: 'KB-12-0941',
      );

      final map = passenger.toJson();
      expect(map['seatId'], '12A');
      expect(map['firstName'], 'John');
      expect(map['passportNumber'], 'KB-12-0941');
    });

    testWidgets('SeatSelectionPage allows selecting seat and updates total fare', (WidgetTester tester) async {
      final trip = Trip(
        id: 'trip_501',
        origin: 'Addis Ababa',
        destination: 'Bahir Dar',
        originCode: 'ADD',
        destinationCode: 'BD',
        departureStr: '05:00 AM',
        arrivalStr: '02:00 PM',
        price: 850.0,
        availableSeats: 18,
        busName: 'SB-023 VIP Coach',
        departure: DateTime(2026, 10, 5, 5, 0),
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: SeatSelectionPage(tripId: 'trip_501', tripExtra: trip),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Select Seat • Trip #501'), findsOneWidget);
      expect(find.text('ETB 0'), findsOneWidget);

      // Tap on seat 04A
      final seat04A = find.text('04A');
      expect(seat04A, findsOneWidget);
      await tester.tap(seat04A);
      await tester.pump();

      // Check updated total fare
      expect(find.text('ETB 850'), findsOneWidget);
      expect(find.text('1 Seat(s): 04A'), findsOneWidget);
    });

    testWidgets('TicketPage renders official boarding pass with QR and manifest info', (WidgetTester tester) async {
      final ticket = Ticket(
        id: 'tkt_demo',
        ticketNumber: 'TKT-92831',
        bookingReference: 'BK-20261005-00125',
        tripCode: 'ETB-AA-BD-01',
        route: 'Addis Ababa ➔ Bahir Dar',
        seatNumber: '12A',
        passengerName: 'John Smith',
        passengerPhone: '+251911223344',
        passengerIdNumber: 'KB-12-0941',
        fareETB: 850.0,
        status: 'CONFIRMED',
        qrToken: 'ABY-QR-990812',
        departureTime: DateTime.now().add(const Duration(hours: 2)),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: TicketPage(ticketId: 'tkt_demo', ticketExtra: ticket),
        ),
      );

      expect(find.text('Digital Boarding Pass'), findsOneWidget);
      expect(find.text('ABYSSINIA BUS'), findsOneWidget);
      expect(find.text('SCAN AT BUS DOOR FOR BOARDING'), findsOneWidget);
      expect(find.text('12A'), findsOneWidget);
      expect(find.text('BK-20261005-00125'), findsOneWidget);
      expect(find.text('Track Bus Live'), findsOneWidget);
    });
  });
}
