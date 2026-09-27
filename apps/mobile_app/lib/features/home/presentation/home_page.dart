import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/app_providers.dart';

class HomePage extends ConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchState = ref.watch(searchProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('ABYSSINIA BUS', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.2)),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.support_agent, color: Color(0xFFF59E0B)),
            onPressed: () => context.push('/support'),
          ),
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Search Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Colors.white10),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.directions_bus, color: Color(0xFFF59E0B), size: 22),
                        SizedBox(width: 8),
                        Text('Book Intercity Coach', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // From
                    _buildSelector(
                      context,
                      label: 'From (Origin Terminal)',
                      value: searchState.origin,
                      icon: Icons.trip_origin,
                      iconColor: const Color(0xFFF59E0B),
                      onTap: () => _pickOrigin(context, ref),
                    ),
                    const SizedBox(height: 10),
                    // To
                    _buildSelector(
                      context,
                      label: 'To (Destination City)',
                      value: searchState.destination,
                      icon: Icons.location_on,
                      iconColor: const Color(0xFF10B981),
                      onTap: () => _pickDestination(context, ref),
                    ),
                    const SizedBox(height: 10),
                    // Date
                    _buildSelector(
                      context,
                      label: 'Travel Date',
                      value: searchState.date.toLocal().toString().split(' ')[0],
                      icon: Icons.calendar_today,
                      iconColor: const Color(0xFF38BDF8),
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: searchState.date,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 30)),
                        );
                        if (picked != null) {
                          ref.read(searchProvider.notifier).updateCriteria(date: picked);
                        }
                      },
                    ),
                    const SizedBox(height: 18),
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.read(searchProvider.notifier).search();
                        context.push('/trips');
                      },
                      icon: const Icon(Icons.search),
                      label: const Text('SEARCH SCHEDULED BUSES', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Quick Access Section
            Row(
              children: [
                Expanded(
                  child: _buildQuickAction(
                    context,
                    title: 'My Bookings',
                    subtitle: 'View QR Tickets',
                    icon: Icons.confirmation_number,
                    color: const Color(0xFF0284C7),
                    route: '/bookings',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickAction(
                    context,
                    title: 'Live Tracking',
                    subtitle: 'GPS Telemetry',
                    icon: Icons.gps_fixed,
                    color: const Color(0xFF10B981),
                    route: '/trips/trip_501/tracking',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Popular Ethiopian Intercity Routes
            const Text('Popular Ethiopian Corridors', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildCorridorCard(context, ref, 'Addis Ababa ➔ Bahir Dar', '560 km • 9h', 'ETB 850', 'VIP Luxury Coach'),
            _buildCorridorCard(context, ref, 'Addis Ababa ➔ Hawassa', '275 km • 4.5h', 'ETB 650', 'Executive Express'),
            _buildCorridorCard(context, ref, 'Addis Ababa ➔ Dire Dawa', '515 km • 8.5h', 'ETB 1,100', 'VIP 2x2 Coach'),
            _buildCorridorCard(context, ref, 'Addis Ababa ➔ Gondar', '730 km • 12h', 'ETB 1,450', 'Executive Sleeper'),
          ],
        ),
      ),
    );
  }

  Widget _buildSelector(BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  const SizedBox(height: 2),
                  Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const Icon(Icons.arrow_drop_down, color: Colors.white54),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white10)),
      child: InkWell(
        onTap: () => context.push(route),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCorridorCard(BuildContext context, WidgetRef ref, String route, String specs, String fare, String busType) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Colors.white10)),
      child: ListTile(
        title: Text(route, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('$specs • $busType', style: const TextStyle(color: Colors.white54, fontSize: 12)),
        trailing: Text(fare, style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.w900, fontSize: 15)),
        onTap: () {
          final parts = route.split(' ➔ ');
          ref.read(searchProvider.notifier).updateCriteria(
            origin: parts[0],
            destination: parts[1],
          );
          ref.read(searchProvider.notifier).search();
          context.push('/trips');
        },
      ),
    );
  }

  void _pickOrigin(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      builder: (ctx) => ListView(
        shrinkWrap: true,
        children: ['Addis Ababa', 'Bahir Dar', 'Hawassa', 'Dire Dawa'].map((city) {
          return ListTile(
            title: Text(city, style: const TextStyle(color: Colors.white)),
            onTap: () {
              ref.read(searchProvider.notifier).updateCriteria(origin: city);
              Navigator.pop(ctx);
            },
          );
        }).toList(),
      ),
    );
  }

  void _pickDestination(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      builder: (ctx) => ListView(
        shrinkWrap: true,
        children: ['Bahir Dar', 'Hawassa', 'Dire Dawa', 'Gondar', 'Dessie', 'Jimma'].map((city) {
          return ListTile(
            title: Text(city, style: const TextStyle(color: Colors.white)),
            onTap: () {
              ref.read(searchProvider.notifier).updateCriteria(destination: city);
              Navigator.pop(ctx);
            },
          );
        }).toList(),
      ),
    );
  }
}
