import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/app_providers.dart';
import '../../trips/models/trip.dart';
import '../models/seat.dart';

class SeatSelectionPage extends ConsumerStatefulWidget {
  final String tripId;
  final Trip? tripExtra;

  const SeatSelectionPage({
    Key? key,
    required this.tripId,
    this.tripExtra,
  }) : super(key: key);

  @override
  ConsumerState<SeatSelectionPage> createState() => _SeatSelectionPageState();
}

class _SeatSelectionPageState extends ConsumerState<SeatSelectionPage> {
  late Trip _trip;

  @override
  void initState() {
    super.initState();
    _trip = widget.tripExtra ??
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

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(seatSelectionProvider.notifier).loadSeatsForTrip(_trip);
    });
  }

  void _handleHoldAndProceed() async {
    final seatState = ref.read(seatSelectionProvider);
    if (seatState.selectedSeats.isEmpty) return;

    final reservation = await ref.read(reservationProvider.notifier).holdSeats(
      tripId: _trip.id,
      fromStopId: _trip.originCode,
      toStopId: _trip.destinationCode,
      seatIds: seatState.selectedSeats,
    );

    if (reservation != null && mounted) {
      context.push('/checkout/${_trip.id}', extra: {
        'trip': _trip,
        'reservation': reservation,
        'seats': seatState.selectedSeats,
      });
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not hold selected seat(s). Please choose another.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final seatState = ref.watch(seatSelectionProvider);
    final resState = ref.watch(reservationProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Select Seat • Trip #${_trip.id.replaceAll('trip_', '')}', style: const TextStyle(fontSize: 15)),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Column(
        children: [
          // Legend
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
          if (seatState.isLoading)
            const LinearProgressIndicator(color: Color(0xFFF59E0B), backgroundColor: Color(0xFF1E293B)),
          // Seats Layout
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
              child: Column(
                children: [
                  // Front Driver Cabin
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(10)),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('ENTRY DOOR 🚪', style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold)),
                        Text('DRIVER CABIN 🚌', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  // 2x2 rows
                  for (int row = 1; row <= 10; row++)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildSeatButton('${row.toString().padLeft(2, '0')}A', seatState),
                          const SizedBox(width: 8),
                          _buildSeatButton('${row.toString().padLeft(2, '0')}B', seatState),
                          const SizedBox(width: 32), // Aisle
                          _buildSeatButton('${row.toString().padLeft(2, '0')}C', seatState),
                          const SizedBox(width: 8),
                          _buildSeatButton('${row.toString().padLeft(2, '0')}D', seatState),
                        ],
                      ),
                    ),
                  const SizedBox(height: 14),
                  const Text('REAR CABIN', style: TextStyle(color: Colors.white24, fontSize: 10, letterSpacing: 1)),
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
                        Text(
                          '${seatState.selectedSeats.length} Seat(s): ${seatState.selectedSeats.isEmpty ? 'None' : seatState.selectedSeats.join(', ')}',
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        Text(
                          'ETB ${seatState.totalFare.toInt()}',
                          style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 20, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: seatState.selectedSeats.isEmpty || resState.isHolding ? null : _handleHoldAndProceed,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: resState.isHolding
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Hold & Continue ➔', style: TextStyle(fontWeight: FontWeight.bold)),
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
        Container(width: 14, height: 14, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _buildSeatButton(String seatNumber, SeatSelectionState state) {
    final cleanNum = seatNumber.replaceFirst(RegExp(r'^0'), '');
    final seat = state.allSeats.firstWhere(
      (s) => s.seatNumber == seatNumber || s.seatNumber == cleanNum,
      orElse: () => Seat(id: seatNumber, seatNumber: seatNumber, rowNumber: 1, columnLetter: 'A', status: SeatStatus.available),
    );

    final isSelected = state.selectedSeats.contains(seatNumber) || state.selectedSeats.contains(cleanNum);
    final isOccupied = seat.status == SeatStatus.confirmed || seat.status == SeatStatus.held || seat.status == SeatStatus.blocked;

    Color bg = const Color(0xFF334155);
    Color fg = Colors.white;
    if (isOccupied) {
      bg = const Color(0xFF7F1D1D);
      fg = Colors.white38;
    } else if (isSelected) {
      bg = const Color(0xFFF59E0B);
      fg = Colors.black;
    }

    return GestureDetector(
      onTap: isOccupied ? null : () => ref.read(seatSelectionProvider.notifier).toggleSeat(seatNumber),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? Colors.white : Colors.transparent, width: 1.5),
        ),
        alignment: Alignment.center,
        child: Text(seatNumber, style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
    );
  }
}
