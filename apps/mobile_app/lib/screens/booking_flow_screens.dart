import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'ticket_profile_screens.dart';

// --- Day 20: Route Results Screen ---
class RouteResultsScreen extends StatelessWidget {
  final String origin;
  final String destination;
  final DateTime date;
  final List<Trip> allTrips;

  const RouteResultsScreen({
    Key? key,
    required this.origin,
    required this.destination,
    required this.date,
    required this.allTrips,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final filtered = allTrips.where((t) {
      return t.destinationCity.toLowerCase().contains(destination.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('$origin ➔ $destination', style: const TextStyle(fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: filtered.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.directions_bus, size: 48, color: Colors.white38),
                  const SizedBox(height: 12),
                  Text('No direct trips found for $destination', style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Change Route'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(14),
              itemCount: filtered.length,
              itemBuilder: (ctx, i) {
                final trip = filtered[i];
                final depTime = '${trip.departureTime.hour.toString().padLeft(2, '0')}:${trip.departureTime.minute.toString().padLeft(2, '0')}';
                return Card(
                  color: const Color(0xFF1E293B),
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0284C7).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(trip.tripCode, style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 11)),
                            ),
                            Text('${trip.fareETB.toInt()} ETB', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 18, fontWeight: FontWeight.w900)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text('${trip.originCity} ➔ ${trip.destinationCity}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('${trip.bus.busModel} (${trip.bus.plateNumber})', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                        const Divider(color: Colors.white12, height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.access_time, size: 14, color: Color(0xFFF59E0B)),
                                const SizedBox(width: 4),
                                Text(depTime, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                              ],
                            ),
                            Text('${trip.availableSeatsCount} seats available', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12)),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => SeatSelectionScreen(trip: trip)),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFF59E0B),
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              ),
                              child: const Text('Select Seat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

// --- Day 20: Seat Selection Screen ---
class SeatSelectionScreen extends StatefulWidget {
  final Trip trip;
  const SeatSelectionScreen({Key? key, required this.trip}) : super(key: key);

  @override
  _SeatSelectionScreenState createState() => _SeatSelectionScreenState();
}

class _SeatSelectionScreenState extends State<SeatSelectionScreen> {
  final List<String> _selectedSeats = [];
  final List<String> _bookedSeats = ['1A', '2B', '3C']; // Sample booked

  void _toggleSeat(String seat) {
    if (_bookedSeats.contains(seat)) return;
    setState(() {
      if (_selectedSeats.contains(seat)) {
        _selectedSeats.remove(seat);
      } else {
        if (_selectedSeats.length >= 4) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Max 4 seats allowed')));
          return;
        }
        _selectedSeats.add(seat);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final totalFare = _selectedSeats.length * widget.trip.fareETB;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Select Seat - ${widget.trip.tripCode}'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Column(
        children: [
          // Bus Cabin Header
          Container(
            padding: const EdgeInsets.all(12),
            color: const Color(0xFF1E293B),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegend(const Color(0xFF334155), 'Available'),
                _buildLegend(const Color(0xFFF59E0B), 'Selected'),
                _buildLegend(const Color(0xFF991B1B), 'Booked'),
              ],
            ),
          ),
          // Seats Grid
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 40),
              child: Column(
                children: [
                  const Text('🚌 FRONT / DRIVER CABIN', style: TextStyle(color: Colors.white38, fontSize: 11, letterSpacing: 1)),
                  const SizedBox(height: 14),
                  // Generate 11 rows of 2x2 (A, B, C, D)
                  for (int row = 1; row <= 10; row++)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildSeatButton('${row}A'),
                          const SizedBox(width: 8),
                          _buildSeatButton('${row}B'),
                          const SizedBox(width: 32), // Aisle
                          _buildSeatButton('${row}C'),
                          const SizedBox(width: 8),
                          _buildSeatButton('${row}D'),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
          // Bottom Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B),
              border: Border(top: BorderSide(color: Colors.white12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('${_selectedSeats.length} Seat(s): ${_selectedSeats.join(', ')}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      Text('${totalFare.toInt()} ETB', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 18, fontWeight: FontWeight.w900)),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: _selectedSeats.isEmpty
                      ? null
                      : () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PassengerInfoScreen(
                                trip: widget.trip,
                                selectedSeats: _selectedSeats,
                                totalFare: totalFare,
                              ),
                            ),
                          );
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  child: const Text('Continue to Details', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(Color color, String label) {
    return Row(
      children: [
        Container(width: 14, height: 14, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _buildSeatButton(String seat) {
    final isBooked = _bookedSeats.contains(seat);
    final isSelected = _selectedSeats.contains(seat);

    Color bg = const Color(0xFF334155);
    Color fg = Colors.white;
    if (isBooked) {
      bg = const Color(0xFF7F1D1D);
      fg = Colors.white38;
    } else if (isSelected) {
      bg = const Color(0xFFF59E0B);
      fg = Colors.black;
    }

    return GestureDetector(
      onTap: () => _toggleSeat(seat),
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
        alignment: Alignment.center,
        child: Text(seat, style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
    );
  }
}

// --- Day 20: Passenger Information Screen ---
class PassengerInfoScreen extends StatefulWidget {
  final Trip trip;
  final List<String> selectedSeats;
  final double totalFare;

  const PassengerInfoScreen({
    Key? key,
    required this.trip,
    required this.selectedSeats,
    required this.totalFare,
  }) : super(key: key);

  @override
  _PassengerInfoScreenState createState() => _PassengerInfoScreenState();
}

class _PassengerInfoScreenState extends State<PassengerInfoScreen> {
  final _nameCtrl = TextEditingController(text: 'Mulugeta Tesfaye');
  final _phoneCtrl = TextEditingController(text: '+251 91 199 8877');
  final _idCtrl = TextEditingController(text: 'KB-12-0941');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Passenger Details'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(8)),
              child: Text(
                'Trip: ${widget.trip.tripCode} | Seats: ${widget.selectedSeats.join(', ')} (${widget.totalFare.toInt()} ETB)',
                style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Federal Police Highway Manifest Info',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _nameCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Full Name (as on ID card)',
                labelStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Phone Number (+251)',
                labelStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _idCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Kebele / National ID Card Number',
                labelStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PaymentScreen(
                      trip: widget.trip,
                      selectedSeats: widget.selectedSeats,
                      totalFare: widget.totalFare,
                      passengerName: _nameCtrl.text,
                      passengerPhone: _phoneCtrl.text,
                      passengerId: _idCtrl.text,
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Proceed to Payment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Day 20: Payment & Booking Screen ---
class PaymentScreen extends StatefulWidget {
  final Trip trip;
  final List<String> selectedSeats;
  final double totalFare;
  final String passengerName;
  final String passengerPhone;
  final String passengerId;

  const PaymentScreen({
    Key? key,
    required this.trip,
    required this.selectedSeats,
    required this.totalFare,
    required this.passengerName,
    required this.passengerPhone,
    required this.passengerId,
  }) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = 'TELEBIRR';
  bool _isPaying = false;

  void _handlePay() async {
    setState(() => _isPaying = true);

    final passengersPayload = widget.selectedSeats.map((s) => {
      'seatNumber': s,
      'passengerName': widget.passengerName,
      'passengerPhone': widget.passengerPhone,
      'passengerIdNumber': widget.passengerId,
    }).toList();

    final result = await ApiService.checkout(
      tripId: widget.trip.id,
      customerName: widget.passengerName,
      customerPhone: widget.passengerPhone,
      paymentMethod: _selectedMethod,
      passengers: passengersPayload,
    );

    setState(() => _isPaying = false);

    if (result != null && result['bookingReference'] != null) {
      final ticketJson = result['tickets'][0];
      final ticket = Ticket.fromJson(
        ticketJson,
        bookingRef: result['bookingReference'],
        tripRoute: result['trip']['route'],
        depTime: widget.trip.departureTime,
      );

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => QrTicketScreen(ticket: ticket)),
        (route) => route.isFirst,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment failed or seat conflict. Please retry.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Amount to Pay:', style: TextStyle(color: Colors.white70)),
                  Text('${widget.totalFare.toInt()} ETB', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 20, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('Choose Payment Gateway', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildMethodCard('TELEBIRR', 'telebirr (Ethio Telecom)', const Color(0xFF0284C7)),
            _buildMethodCard('CBE_BIRR', 'CBE Birr (Commercial Bank)', const Color(0xFF7E22CE)),
            _buildMethodCard('CHAPA_GATEWAY', 'Chapa (Debit Card / Awash)', const Color(0xFF10B981)),
            const Spacer(),
            ElevatedButton(
              onPressed: _isPaying ? null : _handlePay,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isPaying
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text('Confirm Pay ${widget.totalFare.toInt()} ETB', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMethodCard(String key, String title, Color color) {
    final isSelected = _selectedMethod == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = key),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          border: Border.all(color: isSelected ? color : Colors.transparent, width: 2),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(isSelected ? Icons.radio_button_checked : Icons.radio_button_off, color: isSelected ? color : Colors.white54),
            const SizedBox(width: 12),
            Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
          ],
        ),
      ),
    );
  }
}
