import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/app_providers.dart';
import '../../trips/models/trip.dart';
import '../../reservations/models/reservation.dart';
import '../models/booking_passenger.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  final String tripId;
  final Map<String, dynamic>? checkoutData;

  const CheckoutPage({
    Key? key,
    required this.tripId,
    this.checkoutData,
  }) : super(key: key);

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  late Trip _trip;
  late Reservation _reservation;
  late List<String> _seats;

  final Map<String, TextEditingController> _firstNames = {};
  final Map<String, TextEditingController> _lastNames = {};
  final Map<String, TextEditingController> _phones = {};
  final Map<String, TextEditingController> _nationalIds = {};

  @override
  void initState() {
    super.initState();
    final data = widget.checkoutData ?? {};
    _trip = data['trip'] ??
        Trip(
          id: widget.tripId,
          origin: 'Addis Ababa',
          destination: 'Bahir Dar',
          originCode: 'ADD',
          destinationCode: 'BD',
          departure: DateTime.now().add(const Duration(hours: 3)),
          price: 850.0,
          availableSeats: 18,
          busName: 'SB-023 VIP Coach',
        );

    _seats = (data['seats'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? ['12A'];
    _reservation = data['reservation'] ??
        Reservation(
          id: 'res_mock',
          tripId: _trip.id,
          fromStopId: _trip.originCode,
          toStopId: _trip.destinationCode,
          status: 'ACTIVE',
          expiresAt: DateTime.now().add(const Duration(minutes: 5)),
          seatIds: _seats,
        );

    for (final seat in _seats) {
      _firstNames[seat] = TextEditingController(text: 'John');
      _lastNames[seat] = TextEditingController(text: 'Smith');
      _phones[seat] = TextEditingController(text: '+251911223344');
      _nationalIds[seat] = TextEditingController(text: 'KB-12-0941');
    }
  }

  @override
  void dispose() {
    for (final c in _firstNames.values) c.dispose();
    for (final c in _lastNames.values) c.dispose();
    for (final c in _phones.values) c.dispose();
    for (final c in _nationalIds.values) c.dispose();
    super.dispose();
  }

  String _formatTimer(int totalSecs) {
    final mins = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSecs % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  void _proceedToPayment() {
    final passengers = _seats.map((seat) {
      return BookingPassenger(
        seatId: seat,
        firstName: _firstNames[seat]!.text.trim(),
        lastName: _lastNames[seat]!.text.trim(),
        phone: _phones[seat]!.text.trim(),
        passportNumber: _nationalIds[seat]!.text.trim(),
        email: '${_firstNames[seat]!.text.toLowerCase()}@example.com',
      );
    }).toList();

    context.push('/payment/${_trip.id}', extra: {
      'trip': _trip,
      'reservation': _reservation,
      'passengers': passengers,
      'seats': _seats,
    });
  }

  @override
  Widget build(BuildContext context) {
    final resState = ref.watch(reservationProvider);
    final remainingSecs = resState.secondsRemaining > 0 ? resState.secondsRemaining : 295;
    final totalFare = _seats.length * _trip.price;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Passenger Details & Checkout'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Column(
        children: [
          // Reservation Timer Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF78350F),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.timer, color: Color(0xFFFDE68A), size: 18),
                    const SizedBox(width: 8),
                    Text('Seats Held: ${_seats.join(', ')}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(6)),
                  child: Text(_formatTimer(remainingSecs), style: const TextStyle(color: Color(0xFFFDE68A), fontWeight: FontWeight.w900, fontSize: 14)),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Order Summary Card
                  Card(
                    color: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('TRIP SUMMARY', style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                          const SizedBox(height: 8),
                          Text('${_trip.origin} ➔ ${_trip.destination}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                          Text('${_trip.departureStr} • ${_seats.length} Passenger(s)', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                          const Divider(color: Colors.white12, height: 20),
                          _buildSummaryRow('PRICE', 'ETB ${totalFare.toInt()}'),
                          const SizedBox(height: 6),
                          _buildSummaryRow('FEES', 'ETB 0'),
                          const Divider(color: Colors.white12, height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('TOTAL (BACKEND AUTHORITATIVE)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('ETB ${totalFare.toInt()}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 20, fontWeight: FontWeight.w900)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Federal Police Highway Manifest Passenger Information', style: TextStyle(color: Colors.white54, fontSize: 12)),
                  const SizedBox(height: 10),
                  for (int i = 0; i < _seats.length; i++)
                    _buildPassengerCard(_seats[i], i + 1),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _proceedToPayment,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('CONTINUE TO PAYMENT ➔', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildPassengerCard(String seat, int index) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white10)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Passenger $index', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: const Color(0xFFF59E0B), borderRadius: BorderRadius.circular(6)),
                  child: Text('Seat $seat', style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _firstNames[seat],
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(labelText: 'First Name', labelStyle: TextStyle(color: Colors.white60, fontSize: 12)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _lastNames[seat],
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(labelText: 'Last Name', labelStyle: TextStyle(color: Colors.white60, fontSize: 12)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _phones[seat],
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(labelText: 'Phone Number (+251...)', labelStyle: TextStyle(color: Colors.white60, fontSize: 12)),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _nationalIds[seat],
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(labelText: 'National / Kebele ID / Passport #', labelStyle: TextStyle(color: Colors.white60, fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }
}
