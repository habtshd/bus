import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/app_providers.dart';

class SearchPage extends ConsumerWidget {
  const SearchPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchState = ref.watch(searchProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Search Scheduled Trips'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ListTile(
              tileColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              leading: const Icon(Icons.trip_origin, color: Color(0xFFF59E0B)),
              title: const Text('Origin', style: TextStyle(color: Colors.white54, fontSize: 11)),
              subtitle: Text(searchState.origin, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white30),
            ),
            const SizedBox(height: 12),
            ListTile(
              tileColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              leading: const Icon(Icons.location_on, color: Color(0xFF10B981)),
              title: const Text('Destination', style: TextStyle(color: Colors.white54, fontSize: 11)),
              subtitle: Text(searchState.destination, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white30),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                ref.read(searchProvider.notifier).search();
                context.push('/trips');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('FIND TRIPS ➔', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
