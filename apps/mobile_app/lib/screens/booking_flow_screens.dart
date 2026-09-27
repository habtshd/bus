import 'dart:async';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'ticket_profile_screens.dart';

// ============================================================================
// 1. ROUTE RESULTS SCREEN (Search Results)
// ============================================================================
class RouteResultsScreen extends StatefulWidget {
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
  _RouteResultsScreenState createState() => _RouteResultsScreenState();
}

class _RouteResultsScreenState extends State<RouteResultsScreen> {
  late List<Trip> _trips;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _trips = widget.allTrips;
    _fetchLiveSearchResults();
  }

  void _fetchLiveSearchResults() async {
    setState(() => _isLoading = true);
    final results = await ApiService.searchTrips(
      from: widget.origin,
      to: widget.destination,
      date: widget.date,
    );
    if (mounted) {
      setState(() {
        if (results.isNotEmpty) {
          _trips = results;
        }
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${widget.origin} ➔ ${widget.destination}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('${widget.date.toLocal().toString().split(' ')[0]} • ${_trips.length} departure(s)', style: const TextStyle(fontSize: 12, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchLiveSearchResults,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : _trips.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.directions_bus, size: 54, color: Colors.white24),
                      const SizedBox(height: 14),
                      Text('No scheduled trips for ${widget.destination}', style: const TextStyle(color: Colors.white70, fontSize: 16)),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: Colors.black),
                        child: const Text('Change Search Route'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(14),
                  itemCount: _trips.length,
                  itemBuilder: (ctx, i) {
                    final trip = _trips[i];
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                        side: const BorderSide(color: Colors.white10),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0284C7).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(trip.tripCode, style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                                Text('${trip.fareETB.toInt()} ETB', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 20, fontWeight: FontWeight.w900)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text('${trip.originCity} ➔ ${trip.destinationCity}', style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('${trip.bus.busModel} • Plate: ${trip.bus.plateNumber}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 6,
                              children: trip.amenities.map((a) => Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.06), borderRadius: BorderRadius.circular(4)),
                                child: Text(a, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                              )).toList(),
                            ),
                            const Divider(color: Colors.white12, height: 22),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 16, color: Color(0xFFF59E0B)),
                                    const SizedBox(width: 4),
                                    Text('${trip.departureStr} - ${trip.arrivalStr}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                                  child: Text('${trip.availableSeatsCount} seats left', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
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
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  child: const Text('Select Seats', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
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

// ============================================================================
// 2. SEAT SELECTION SCREEN (Segment Inventory & 5-Min Hold)
// ============================================================================
class SeatSelectionScreen extends StatefulWidget {
  final Trip trip;
  const SeatSelectionScreen({Key? key, required this.trip}) : super(key: key);

  @override
  _SeatSelectionScreenState createState() => _SeatSelectionScreenState();
}

class _SeatSelectionScreenState extends State<SeatSelectionScreen> {
  final List<String> _selectedSeats = [];
  final Set<String> _bookedSeats = {'1A', '2B', '3C', '7A', '7B'};
  bool _isHolding = false;
  bool _isLoadingSeats = false;

  @override
  void initState() {
    super.initState();
    _loadLiveSeatInventory();
  }

  void _loadLiveSeatInventory() async {
    setState(() => _isLoadingSeats = true);
    final seats = await ApiService.getAvailableSeats(
      tripId: widget.trip.id,
      fromStopId: widget.trip.originCode,
      toStopId: widget.trip.destinationCode,
    );
    if (mounted && seats.isNotEmpty) {
      setState(() {
        _bookedSeats.clear();
        final availableSet = seats.map((s) => s.seatNumber.toUpperCase()).toSet();
        for (int r = 1; r <= 10; r++) {
          for (final col in ['A', 'B', 'C', 'D']) {
            final seatCode = '$r$col';
            if (!availableSet.contains(seatCode)) {
              _bookedSeats.add(seatCode);
            }
          }
        }
        _isLoadingSeats = false;
      });
    } else {
      if (mounted) setState(() => _isLoadingSeats = false);
    }
  }

  void _toggleSeat(String seat) {
    if (_bookedSeats.contains(seat)) return;
    setState(() {
      if (_selectedSeats.contains(seat)) {
        _selectedSeats.remove(seat);
      } else {
        if (_selectedSeats.length >= 4) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Max 4 seats allowed per reservation')));
          return;
        }
        _selectedSeats.add(seat);
      }
    });
  }

  void _handleHoldAndContinue() async {
    if (_selectedSeats.isEmpty) return;

    setState(() => _isHolding = true);

    // Call backend POST /api/v1/reservations for 5-minute atomic seat lock
    final reservation = await ApiService.createReservation(
      tripId: widget.trip.id,
      fromStopId: widget.trip.originCode,
      toStopId: widget.trip.destinationCode,
      seatIds: _selectedSeats,
    );

    setState(() => _isHolding = false);

    // If reservation succeeded or fallback is used
    final effectiveReservation = reservation ?? Reservation(
      id: 'res_${DateTime.now().millisecondsSinceEpoch}',
      tripId: widget.trip.id,
      fromStopId: widget.trip.originCode,
      toStopId: widget.trip.destinationCode,
      status: 'ACTIVE',
      expiresAt: DateTime.now().add(const Duration(minutes: 5)),
      seatIds: _selectedSeats,
    );

    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PassengerInfoScreen(
            trip: widget.trip,
            reservation: effectiveReservation,
            selectedSeats: _selectedSeats,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalFare = _selectedSeats.length * widget.trip.fareETB;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Seat Map • ${widget.trip.tripCode}', style: const TextStyle(fontSize: 16)),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Column(
        children: [
          // Cabin Legend
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF1E293B),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegend(const Color(0xFF334155), 'Available'),
                _buildLegend(const Color(0xFFF59E0B), 'Selected'),
                _buildLegend(const Color(0xFF7F1D1D), 'Occupied'),
              ],
            ),
          ),
          if (_isLoadingSeats)
            const LinearProgressIndicator(color: Color(0xFFF59E0B), backgroundColor: Color(0xFF1E293B)),
          // Seats Grid
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(20)),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.airline_seat_recline_normal, size: 16, color: Colors.white54),
                        SizedBox(width: 6),
                        Text('🚌 DRIVER & ENTRY DOOR (FRONT)', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  for (int row = 1; row <= 10; row++)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildSeatButton('${row}A'),
                          const SizedBox(width: 8),
                          _buildSeatButton('${row}B'),
                          const SizedBox(width: 34), // Aisle
                          _buildSeatButton('${row}C'),
                          const SizedBox(width: 8),
                          _buildSeatButton('${row}D'),
                        ],
                      ),
                    ),
                  const SizedBox(height: 12),
                  const Text('REAR OF BUS', style: TextStyle(color: Colors.white24, fontSize: 10, letterSpacing: 1)),
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
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('${_selectedSeats.length} Seat(s): ${_selectedSeats.isEmpty ? 'None' : _selectedSeats.join(', ')}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                        Text('${totalFare.toInt()} ETB', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 20, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _selectedSeats.isEmpty || _isHolding ? null : _handleHoldAndContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _isHolding
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Hold Seats (5m) ➔', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(Color color, String label) {
    return Row(
      children: [
        Container(width: 14, height: 14, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
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
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? Colors.white : Colors.transparent, width: 1.5),
        ),
        alignment: Alignment.center,
        child: Text(seat, style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 12)),
      ),
    );
  }
}

// ============================================================================
// 3. PASSENGER INFO SCREEN (Manifest Data & Countdown Timer)
// ============================================================================
class PassengerInfoScreen extends StatefulWidget {
  final Trip trip;
  final Reservation reservation;
  final List<String> selectedSeats;

  const PassengerInfoScreen({
    Key? key,
    required this.trip,
    required this.reservation,
    required this.selectedSeats,
  }) : super(key: key);

  @override
  _PassengerInfoScreenState createState() => _PassengerInfoScreenState();
}

class _PassengerInfoScreenState extends State<PassengerInfoScreen> {
  late Timer _countdownTimer;
  late int _secondsRemaining;

  // Controllers for each passenger
  final Map<String, TextEditingController> _firstNames = {};
  final Map<String, TextEditingController> _lastNames = {};
  final Map<String, TextEditingController> _phones = {};
  final Map<String, TextEditingController> _ids = {};

  @override
  void initState() {
    super.initState();
    _secondsRemaining = widget.reservation.remainingSeconds;
    if (_secondsRemaining <= 0) _secondsRemaining = 300; // default 5 mins

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        _countdownTimer.cancel();
        _showExpiryDialog();
      }
    });

    for (final seat in widget.selectedSeats) {
      _firstNames[seat] = TextEditingController(text: 'Abebe');
      _lastNames[seat] = TextEditingController(text: 'Kebede');
      _phones[seat] = TextEditingController(text: '+251911223344');
      _ids[seat] = TextEditingController(text: 'KB-04-19283');
    }
  }

  @override
  void dispose() {
    _countdownTimer.cancel();
    for (final c in _firstNames.values) c.dispose();
    for (final c in _lastNames.values) c.dispose();
    for (final c in _phones.values) c.dispose();
    for (final c in _ids.values) c.dispose();
    super.dispose();
  }

  void _showExpiryDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Reservation Expired', style: TextStyle(color: Colors.white)),
        content: const Text('Your 5-minute seat hold has expired. The inventory has been released.', style: TextStyle(color: Colors.white70)),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B)),
            child: const Text('Return to Seat Selection', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  String _formatTimer(int totalSecs) {
    final mins = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSecs % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Passenger Details'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Column(
        children: [
          // 5-Minute Hold Countdown Banner
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
                    Text('Seats Held: ${widget.selectedSeats.join(', ')}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.black38, borderRadius: BorderRadius.circular(6)),
                  child: Text(_formatTimer(_secondsRemaining), style: const TextStyle(color: Color(0xFFFDE68A), fontWeight: FontWeight.w900, fontSize: 14)),
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
                  const Text('FDRE Federal Police Highway Manifest Requirements', style: TextStyle(color: Colors.white54, fontSize: 12)),
                  const SizedBox(height: 12),
                  for (int i = 0; i < widget.selectedSeats.length; i++)
                    _buildPassengerCard(widget.selectedSeats[i], i + 1),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      final passengers = widget.selectedSeats.map((seat) {
                        return {
                          'seatId': seat,
                          'firstName': _firstNames[seat]!.text.trim(),
                          'lastName': _lastNames[seat]!.text.trim(),
                          'phone': _phones[seat]!.text.trim(),
                          'passengerIdNumber': _ids[seat]!.text.trim(),
                          'email': '${_firstNames[seat]!.text.toLowerCase()}@example.com',
                        };
                      }).toList();

                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PaymentScreen(
                            trip: widget.trip,
                            reservation: widget.reservation,
                            selectedSeats: widget.selectedSeats,
                            passengers: passengers,
                            secondsRemaining: _secondsRemaining,
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
                    child: const Text('Proceed to Checkout ➔', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPassengerCard(String seat, int index) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white12)),
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
                    decoration: InputDecoration(
                      labelText: 'First Name',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _lastNames[seat],
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Last Name',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _phones[seat],
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Mobile Phone (+251...)',
                labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _ids[seat],
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Kebele / National ID Card #',
                labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// 4. PAYMENT & CHECKOUT SCREEN (Server-Side Fare & Webhook Simulation)
// ============================================================================
class PaymentScreen extends StatefulWidget {
  final Trip trip;
  final Reservation reservation;
  final List<String> selectedSeats;
  final List<Map<String, dynamic>> passengers;
  final int secondsRemaining;

  const PaymentScreen({
    Key? key,
    required this.trip,
    required this.reservation,
    required this.selectedSeats,
    required this.passengers,
    required this.secondsRemaining,
  }) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = 'TELEBIRR';
  bool _isProcessing = false;
  late int _timer;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _timer = widget.secondsRemaining;
    _ticker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timer > 0) {
        setState(() => _timer--);
      } else {
        _ticker?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _handlePay() async {
    setState(() => _isProcessing = true);

    // Call backend POST /api/v1/bookings with reservationId and passengers
    final bookingRes = await ApiService.createBooking(
      reservationId: widget.reservation.id,
      passengers: widget.passengers,
      paymentMethod: _selectedMethod,
      channel: 'PASSENGER_APP',
    );

    if (bookingRes != null && bookingRes['id'] != null) {
      final bookingId = bookingRes['id'];
      final bookingRef = bookingRes['bookingReference'] ?? 'BK-WEB-001';
      final totalAmount = (bookingRes['total'] as num?)?.toDouble() ?? (widget.selectedSeats.length * widget.trip.fareETB);

      // Simulate payment gateway completion callback
      final paymentRef = bookingRes['payment']?['paymentReference'] ?? 'PAY-$bookingId';
      await ApiService.simulatePaymentWebhook(
        paymentReference: paymentRef,
        amount: totalAmount,
        provider: _selectedMethod,
      );

      // Fetch confirmed booking with issued ticket
      final confirmed = await ApiService.getBooking(bookingId);

      setState(() => _isProcessing = false);

      final ticketData = confirmed != null && confirmed['tickets'] != null && (confirmed['tickets'] as List).isNotEmpty
          ? confirmed['tickets'][0]
          : null;

      final issuedTicket = ticketData != null
          ? Ticket.fromJson(ticketData, bookingRef: bookingRef, tripRoute: '${widget.trip.originCity} ➔ ${widget.trip.destinationCity}', depTime: widget.trip.departureTime)
          : Ticket(
              id: 'tkt_${DateTime.now().millisecondsSinceEpoch}',
              ticketNumber: 'TKT-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
              bookingReference: bookingRef,
              tripCode: widget.trip.tripCode,
              route: '${widget.trip.originCity} ➔ ${widget.trip.destinationCity}',
              seatNumber: widget.selectedSeats.first,
              passengerName: '${widget.passengers.first['firstName']} ${widget.passengers.first['lastName']}',
              passengerPhone: widget.passengers.first['phone'] ?? '+251911223344',
              passengerIdNumber: widget.passengers.first['passengerIdNumber'] ?? 'KB-04-19283',
              fareETB: totalAmount,
              status: 'ISSUED',
              departureTime: widget.trip.departureTime,
            );

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => QrTicketScreen(ticket: issuedTicket)),
          (route) => route.isFirst,
        );
      }
    } else {
      setState(() => _isProcessing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment initiation failed. Please check reservation status or try another method.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final subtotal = widget.selectedSeats.length * widget.trip.fareETB;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Checkout & Payment'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Order Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Trip: ${widget.trip.tripCode}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      Text('${widget.selectedSeats.length} Seat(s): ${widget.selectedSeats.join(', ')}', style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Divider(color: Colors.white12, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Official Fare (Subtotal):', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Text('${subtotal.toInt()} ETB', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Booking & Insurance Fee:', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Text('0.00 ETB', style: TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Divider(color: Colors.white12, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Amount to Pay:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('${subtotal.toInt()} ETB', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 22, fontWeight: FontWeight.w900)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('Choose Payment Gateway', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            _buildGatewayCard('TELEBIRR', 'telebirr (Ethio Telecom SuperApp)', Icons.phone_android, const Color(0xFF0284C7)),
            _buildGatewayCard('CBE_BIRR', 'CBE Birr (Commercial Bank of Ethiopia)', Icons.account_balance, const Color(0xFF7E22CE)),
            _buildGatewayCard('CHAPA', 'Chapa Gateway (Debit Cards / Awash)', Icons.credit_card, const Color(0xFF10B981)),
            const Spacer(),
            ElevatedButton(
              onPressed: _isProcessing ? null : _handlePay,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isProcessing
                  ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                  : Text('Pay & Issue Ticket (${subtotal.toInt()} ETB)', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGatewayCard(String key, String title, IconData icon, Color accent) {
    final isSelected = _selectedMethod == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = key),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          border: Border.all(color: isSelected ? accent : Colors.white12, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: accent, size: 24),
            const SizedBox(width: 14),
            Expanded(
              child: Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
            ),
            Icon(isSelected ? Icons.check_circle : Icons.radio_button_unchecked, color: isSelected ? accent : Colors.white30, size: 20),
          ],
        ),
      ),
    );
  }
}
