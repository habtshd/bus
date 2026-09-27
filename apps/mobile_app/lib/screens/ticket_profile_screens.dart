import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/models.dart';

// --- Day 21: My Ticket & QR Code Screen ---
class QrTicketScreen extends StatelessWidget {
  final Ticket ticket;
  const QrTicketScreen({Key? key, required this.ticket}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final qrData = '{"tkt":"${ticket.ticketNumber}","pnr":"${ticket.bookingReference}","seat":"${ticket.seatNumber}","name":"${ticket.passengerName}"}';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Digital Boarding Pass'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.white),
            onPressed: () {},
          )
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('ABYSSINIA BUS', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.black, fontSize: 16)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(6)),
                            child: const Text('CONFIRMED', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(ticket.route, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
                      const Divider(color: Colors.black12, height: 24),
                      // QR Code
                      QrImageView(
                        data: qrData,
                        version: QrVersions.auto,
                        size: 180.0,
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'SCAN AT BUS DOOR FOR BOARDING',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54, letterSpacing: 1),
                      ),
                      const Divider(color: Colors.black12, height: 24),
                      // Ticket Meta
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildField('SEAT NUMBER', ticket.seatNumber, isBig: true),
                          _buildField('TICKET #', ticket.ticketNumber),
                          _buildField('PNR', ticket.bookingReference),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildField('PASSENGER', ticket.passengerName),
                          _buildField('NATIONAL ID', ticket.passengerIdNumber),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildField('DEPARTURE', '${ticket.departureTime.hour.toString().padLeft(2, '0')}:${ticket.departureTime.minute.toString().padLeft(2, '0')} AM'),
                          _buildField('HOTLINE', '9444 (24/7)'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Show this QR code to the conductor upon bus boarding.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String title, String val, {bool isBig = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 9, color: Colors.black54, fontWeight: FontWeight.bold)),
        Text(val, style: TextStyle(fontSize: isBig ? 18 : 13, fontWeight: FontWeight.w900, color: isBig ? const Color(0xFFF59E0B) : Colors.black)),
      ],
    );
  }
}

// --- Day 21: Booking History Screen ---
class BookingHistoryScreen extends StatelessWidget {
  const BookingHistoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final sampleBookings = [
      {'ref': 'BK-WEB-040801', 'route': 'Addis Ababa ➔ Hawassa', 'seat': '7B', 'date': 'Today, 05:00 AM', 'status': 'PAID'},
      {'ref': 'BK-202610-001', 'route': 'Addis Ababa ➔ Bahir Dar', 'seat': '3A', 'date': 'Oct 12, 05:00 AM', 'status': 'COMPLETED'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('My Booking History'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sampleBookings.length,
        itemBuilder: (ctx, i) {
          final b = sampleBookings[i];
          return Card(
            color: const Color(0xFF1E293B),
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: ListTile(
              leading: const Icon(Icons.confirmation_number, color: Color(0xFFF59E0B)),
              title: Text(b['route']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text('${b['date']} • Seat ${b['seat']}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                child: Text(b['status']!, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ),
          );
        },
      ),
    );
  }
}

// --- Day 21: Notifications Screen ---
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final alerts = [
      {'title': 'Boarding Open for ETB-AA-HW-01', 'body': 'Your bus to Hawassa has commenced passenger boarding at Kality Gate 2.', 'time': '10 mins ago'},
      {'title': 'Booking Confirmed (PNR: BK-WEB-040801)', 'body': 'Telebirr payment received. Your ticket is ready.', 'time': '1 hr ago'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(14),
        itemCount: alerts.length,
        itemBuilder: (ctx, i) {
          final a = alerts[i];
          return Card(
            color: const Color(0xFF1E293B),
            margin: const EdgeInsets.only(bottom: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: ListTile(
              leading: const Icon(Icons.notifications_active, color: Color(0xFF38BDF8)),
              title: Text(a['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text(a['body']!, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(a['time']!, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// --- Day 21: Profile Screen ---
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Passenger Profile'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFFF59E0B),
              child: Icon(Icons.person, size: 48, color: Colors.black),
            ),
            const SizedBox(height: 12),
            const Text('Abebe Kebede', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('+251 91 123 4567', style: TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 24),
            _buildProfileTile(Icons.badge, 'National ID', 'KB-04-1029 (Verified)'),
            _buildProfileTile(Icons.security, 'Passenger Safety Manifest', 'FDRE Highway Compliant'),
            _buildProfileTile(Icons.support_agent, 'Emergency Hotline', 'Call 9444 (24/7)'),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileTile(IconData icon, String title, String subtitle) {
    return Card(
      color: const Color(0xFF1E293B),
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFFF59E0B)),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
      ),
    );
  }
}
