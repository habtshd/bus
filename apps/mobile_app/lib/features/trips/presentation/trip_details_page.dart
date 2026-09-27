import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/app_providers.dart';
import '../models/trip.dart';

class TripDetailsPage extends ConsumerWidget {
  final String tripId;
  final Trip? tripExtra;

  const TripDetailsPage({
    Key? key,
    required this.tripId,
    this.tripExtra,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trip = tripExtra ??
        Trip(
          id: tripId,
          origin: 'Addis Ababa',
          destination: 'Bahir Dar',
          originCode: 'ADD',
          destinationCode: 'BD',
          departure: DateTime.now().add(const Duration(hours: 3)),
          departureStr: '05:00 AM',
          arrivalStr: '02:00 PM',
          price: 850.0,
          availableSeats: 18,
          busName: 'SB-023 VIP Coach',
        );

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Trip #${trip.id.replaceAll('trip_', '')}', style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Route Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${trip.origin} ➔ ${trip.destination}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                        Text('ETB ${trip.price.toInt()}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFFF59E0B))),
                      ],
                    ),
                    const SizedBox(height: 14),
                    _buildStopTile('Departure', trip.departureStr, '${trip.origin} Main Coach Terminal', Icons.trip_origin, const Color(0xFFF59E0B)),
                    const Padding(
                      padding: EdgeInsets.only(left: 11),
                      child: SizedBox(height: 24, child: VerticalDivider(color: Colors.white24, thickness: 1.5)),
                    ),
                    _buildStopTile('Arrival (Est.)', trip.arrivalStr, '${trip.destination} Central Station', Icons.location_on, const Color(0xFF10B981)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Bus & Amenities Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Coach & Service Specifications', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildSpecBadge(Icons.directions_bus, 'Bus: ${trip.busName}'),
                        const SizedBox(width: 8),
                        _buildSpecBadge(Icons.access_time, 'Duration: 9h'),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _buildSpecBadge(Icons.luggage, 'Luggage: 25kg free'),
                        const SizedBox(width: 8),
                        _buildSpecBadge(Icons.wifi, 'Onboard WiFi & AC'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Company Policy Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Cancellation & Refund Policy', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    SizedBox(height: 8),
                    Text('• >24 hrs before departure: 100% refund or free reschedule.\n• 12-24 hrs before departure: 90% refund (10% administration fee).\n• <2 hrs before departure: Non-refundable.', style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.5)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                ref.read(seatSelectionProvider.notifier).loadSeatsForTrip(trip);
                context.push('/trips/${trip.id}/seats', extra: trip);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('SELECT SEAT ➔', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStopTile(String tag, String time, String station, IconData icon, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(time, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(width: 8),
                Text('($tag)', style: const TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 2),
            Text(station, style: const TextStyle(color: Colors.white70, fontSize: 13)),
          ],
        ),
      ],
    );
  }

  Widget _buildSpecBadge(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.06), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: const Color(0xFFF59E0B)),
          const SizedBox(width: 6),
          Text(text, style: const TextStyle(color: Colors.white, fontSize: 11)),
        ],
      ),
    );
  }
}
