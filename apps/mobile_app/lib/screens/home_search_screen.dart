import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'booking_flow_screens.dart';

class HomeSearchScreen extends StatefulWidget {
  const HomeSearchScreen({Key? key}) : super(key: key);

  @override
  _HomeSearchScreenState createState() => _HomeSearchScreenState();
}

class _HomeSearchScreenState extends State<HomeSearchScreen> {
  String _selectedOrigin = 'Addis Ababa';
  String _selectedDestination = 'Hawassa';
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;

  final List<String> _origins = ['Addis Ababa', 'Hawassa', 'Bahir Dar', 'Dire Dawa'];
  final List<String> _destinations = ['Hawassa', 'Bahir Dar', 'Dire Dawa', 'Gondar', 'Jimma'];

  void _searchTrips() async {
    setState(() => _isLoading = true);
    final trips = await ApiService.searchTrips(
      from: _selectedOrigin,
      to: _selectedDestination,
      date: _selectedDate,
    );
    setState(() => _isLoading = false);

    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => RouteResultsScreen(
            origin: _selectedOrigin,
            destination: _selectedDestination,
            date: _selectedDate,
            allTrips: trips,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Abyssinia Bus', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Color(0xFFF59E0B)),
            onPressed: () {},
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Book Intercity Coach',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    // Origin
                    DropdownButtonFormField<String>(
                      value: _selectedOrigin,
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'From (Origin)',
                        labelStyle: const TextStyle(color: Colors.white70),
                        prefixIcon: const Icon(Icons.location_on, color: Color(0xFFF59E0B)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      items: _origins
                          .map((o) => DropdownMenuItem(value: o, child: Text(o)))
                          .toList(),
                      onChanged: (val) => setState(() => _selectedOrigin = val!),
                    ),
                    const SizedBox(height: 12),
                    // Destination
                    DropdownButtonFormField<String>(
                      value: _selectedDestination,
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'To (Destination)',
                        labelStyle: const TextStyle(color: Colors.white70),
                        prefixIcon: const Icon(Icons.flag, color: Color(0xFF10B981)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      items: _destinations
                          .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                          .toList(),
                      onChanged: (val) => setState(() => _selectedDestination = val!),
                    ),
                    const SizedBox(height: 12),
                    // Date
                    ListTile(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(color: Colors.white24),
                      ),
                      leading: const Icon(Icons.calendar_today, color: Color(0xFF38BDF8)),
                      title: Text(
                        'Travel Date: ${_selectedDate.toLocal().toString().split(' ')[0]}',
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      trailing: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _selectedDate,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 30)),
                        );
                        if (picked != null) {
                          setState(() => _selectedDate = picked);
                        }
                      },
                    ),
                    const SizedBox(height: 18),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _searchTrips,
                      icon: const Icon(Icons.search),
                      label: _isLoading
                          ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Find Scheduled Buses', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Popular Routes
            const Text(
              'Popular Destinations',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 10),
            _buildRouteCard('Addis Ababa ➔ Hawassa', '275 km • 4.5 hrs', '650 ETB', 'VIP Luxury 2x2 AC'),
            _buildRouteCard('Addis Ababa ➔ Bahir Dar', '560 km • 9.0 hrs', '1,200 ETB', 'Standard 2x3 Express'),
            _buildRouteCard('Addis Ababa ➔ Dire Dawa', '515 km • 8.5 hrs', '1,100 ETB', 'VIP Luxury 2x2 Coach'),
            _buildRouteCard('Addis Ababa ➔ Gondar', '730 km • 12.0 hrs', '1,450 ETB', 'Executive Recliner'),
          ],
        ),
      ),
    );
  }

  Widget _buildRouteCard(String route, String details, String fare, String busType) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: ListTile(
        title: Text(route, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
        subtitle: Text('$details • $busType', style: const TextStyle(color: Colors.white54, fontSize: 12)),
        trailing: Text(fare, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFF59E0B), fontSize: 15)),
        onTap: () {
          final parts = route.split(' ➔ ');
          setState(() {
            _selectedOrigin = parts[0];
            _selectedDestination = parts[1];
          });
          _searchTrips();
        },
      ),
    );
  }
}
