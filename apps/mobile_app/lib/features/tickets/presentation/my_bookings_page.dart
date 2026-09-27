import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/ticket.dart';

class MyBookingsPage extends StatelessWidget {
  const MyBookingsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(
          title: const Text('My Bookings'),
          backgroundColor: const Color(0xFF1E293B),
          bottom: const TabBar(
            indicatorColor: Color(0xFFF59E0B),
            labelColor: Color(0xFFF59E0B),
            unselectedLabelColor: Colors.white54,
            tabs: [
              Tab(text: 'Upcoming'),
              Tab(text: 'Completed'),
              Tab(text: 'Cancelled'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildUpcomingList(context),
            _buildCompletedList(context),
            _buildCancelledList(context),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingList(BuildContext context) {
    final upcoming = [
      {
        'id': 'tkt_901',
        'ref': 'BK-20261005-00125',
        'route': 'Addis Ababa ➔ Bahir Dar',
        'date': '05 Oct 2026, 05:00 AM',
        'seat': '12A',
        'bus': 'SB-023',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: upcoming.length,
      itemBuilder: (ctx, i) {
        final b = upcoming[i];
        final ticket = Ticket(
          id: b['id']!,
          ticketNumber: 'TKT-92831',
          bookingReference: b['ref']!,
          tripCode: 'ETB-AA-BD-01',
          route: b['route']!,
          seatNumber: b['seat']!,
          passengerName: 'John Smith',
          passengerPhone: '+251911223344',
          passengerIdNumber: 'KB-12-0941',
          fareETB: 850.0,
          status: 'CONFIRMED',
          qrToken: 'ABY-QR-990812',
          departureTime: DateTime.now().add(const Duration(hours: 4)),
        );

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
                    Text(b['route']!, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                      child: const Text('CONFIRMED', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${b['date']} • Seat ${b['seat']} • Bus ${b['bus']}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const Divider(color: Colors.white12, height: 22),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => context.push('/tickets/${ticket.id}', extra: ticket),
                        icon: const Icon(Icons.qr_code, size: 16),
                        label: const Text('Ticket'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFF59E0B),
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => context.push('/trips/trip_501/tracking'),
                        icon: const Icon(Icons.gps_fixed, size: 16),
                        label: const Text('Track'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF38BDF8),
                          side: const BorderSide(color: Color(0xFF38BDF8)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showManageDialog(context),
                        icon: const Icon(Icons.tune, size: 16),
                        label: const Text('Manage'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white70,
                          side: const BorderSide(color: Colors.white24),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCompletedList(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildHistoryCard(
          route: 'Addis Ababa ➔ Hawassa',
          date: '15 Sep 2026, 06:30 AM',
          seat: '07B',
          status: 'COMPLETED',
          statusColor: const Color(0xFF38BDF8),
        ),
      ],
    );
  }

  Widget _buildCancelledList(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildHistoryCard(
          route: 'Addis Ababa ➔ Dire Dawa',
          date: '02 Aug 2026, 05:00 AM',
          seat: '14C',
          status: 'REFUNDED',
          statusColor: Colors.redAccent,
        ),
      ],
    );
  }

  Widget _buildHistoryCard({
    required String route,
    required String date,
    required String seat,
    required String status,
    required Color statusColor,
  }) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Colors.white10)),
      child: ListTile(
        title: Text(route, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text('$date • Seat $seat', style: const TextStyle(color: Colors.white54, fontSize: 12)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: statusColor.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
          child: Text(status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  void _showManageDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Manage Reservation', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.change_circle, color: Color(0xFFF59E0B)),
              title: const Text('Reschedule Date or Bus', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reschedule request submitted to dispatch.')));
              },
            ),
            ListTile(
              leading: const Icon(Icons.cancel_outlined, color: Colors.redAccent),
              title: const Text('Cancel Booking (Refund Policy Applies)', style: TextStyle(color: Colors.redAccent)),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cancellation verified. Refund credited.')));
              },
            ),
          ],
        ),
      ),
    );
  }
}
