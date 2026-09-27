import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/models.dart';
import '../services/api_service.dart';

// ============================================================================
// 1. DIGITAL BOARDING PASS & QR CODE SCREEN
// ============================================================================
class QrTicketScreen extends StatelessWidget {
  final Ticket ticket;
  const QrTicketScreen({Key? key, required this.ticket}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Encrypt or format cryptographic QR payload for door gate scanner
    final qrData = ticket.qrToken ??
        ticket.qrHash ??
        '{"tkt":"${ticket.ticketNumber}","pnr":"${ticket.bookingReference}","seat":"${ticket.seatNumber}","name":"${ticket.passengerName}"}';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Digital Boarding Pass', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.white),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Boarding pass link copied to clipboard')),
              );
            },
          )
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
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
                            child: Text(ticket.status, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(ticket.route, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
                      const Divider(color: Colors.black12, height: 24),
                      // QR Code (Cryptographic Gate Token)
                      QrImageView(
                        data: qrData,
                        version: QrVersions.auto,
                        size: 190.0,
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'SCAN AT BUS DOOR GATE FOR BOARDING',
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
              const SizedBox(height: 16),
              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => LiveTrackingScreen(ticket: ticket)),
                        );
                      },
                      icon: const Icon(Icons.gps_fixed, size: 18),
                      label: const Text('Live GPS Track', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _handleCancel(context),
                      icon: const Icon(Icons.cancel_outlined, size: 18, color: Colors.redAccent),
                      label: const Text('Cancel Trip', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.redAccent),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleCancel(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Cancel Booking?', style: TextStyle(color: Colors.white)),
        content: const Text('Are you sure you want to cancel this ticket? Under company policy, tickets cancelled >24 hrs before departure receive 90% refund.', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Ticket', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await ApiService.cancelBooking(ticket.id, 'Passenger personal cancellation');
              if (ok) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Booking successfully cancelled and seat released.')),
                );
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Confirm Cancel', style: TextStyle(color: Colors.white)),
          ),
        ],
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

// ============================================================================
// 2. LIVE GPS BUS TRACKING SCREEN
// ============================================================================
class LiveTrackingScreen extends StatelessWidget {
  final Ticket ticket;
  const LiveTrackingScreen({Key? key, required this.ticket}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Live Bus Track • ${ticket.bookingReference}'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Colors.white12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                            const SizedBox(width: 8),
                            const Text('BUS ON ROUTE (EN ROUTE)', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                        const Text('Speed: 74 km/h', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    const Divider(color: Colors.white12, height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildStatusCol('CURRENT LOCATION', 'Bishoftu Expressway'),
                        _buildStatusCol('NEXT STOP', 'Mojo Interchange'),
                        _buildStatusCol('ETA DESTINATION', '09:45 AM'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Simulated Corridor Route Map
            Container(
              height: 220,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white12),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.map_outlined, size: 60, color: Colors.white24),
                        const SizedBox(height: 10),
                        Text('${ticket.route} Corridor', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                        const Text('GPS Geofence: FDRE Highway Corridor • Normal Telemetry', style: TextStyle(color: Colors.white54, fontSize: 11)),
                      ],
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFF0284C7).withOpacity(0.3), borderRadius: BorderRadius.circular(6)),
                      child: const Row(
                        children: [
                          Icon(Icons.satellite_alt, size: 12, color: Color(0xFF38BDF8)),
                          SizedBox(width: 4),
                          Text('GPS Active', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Driver & Emergency Info
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFF59E0B), child: Icon(Icons.person, color: Colors.black)),
                title: const Text('Capt. Kebede Worku (Lead Driver)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text('Conductor: Alemu Girma • Seat ${ticket.seatNumber}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                trailing: IconButton(
                  icon: const Icon(Icons.call, color: Color(0xFF10B981)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Calling Fleet Operations Hotline: 9444')));
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCol(String label, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(val, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
      ],
    );
  }
}

// ============================================================================
// 3. BOOKING HISTORY SCREEN
// ============================================================================
class BookingHistoryScreen extends StatelessWidget {
  const BookingHistoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final sampleBookings = [
      {'ref': 'BK-WEB-040801', 'tkt': 'TKT-500486', 'route': 'Addis Ababa ➔ Hawassa', 'seat': '7B', 'date': 'Today, 05:00 AM', 'status': 'PAID'},
      {'ref': 'BK-202610-001', 'tkt': 'TKT-100293', 'route': 'Addis Ababa ➔ Bahir Dar', 'seat': '3A', 'date': 'Oct 12, 05:00 AM', 'status': 'COMPLETED'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('My Bookings & Tickets'),
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Colors.white12)),
            child: ListTile(
              leading: const Icon(Icons.confirmation_number, color: Color(0xFFF59E0B)),
              title: Text(b['route']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text('${b['date']} • Seat ${b['seat']}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              trailing: const Icon(Icons.chevron_right, color: Colors.white30),
              onTap: () {
                final tkt = Ticket(
                  id: 'tkt_$i',
                  ticketNumber: b['tkt']!,
                  bookingReference: b['ref']!,
                  tripCode: 'ETB-AA-01',
                  route: b['route']!,
                  seatNumber: b['seat']!,
                  passengerName: 'Abebe Kebede',
                  passengerPhone: '+251911223344',
                  passengerIdNumber: 'KB-04-19283',
                  fareETB: 650.0,
                  status: b['status']!,
                  departureTime: DateTime.now().add(const Duration(hours: 3)),
                );
                Navigator.push(context, MaterialPageRoute(builder: (_) => QrTicketScreen(ticket: tkt)));
              },
            ),
          );
        },
      ),
    );
  }
}

// ============================================================================
// 4. NOTIFICATIONS SCREEN
// ============================================================================
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final alerts = [
      {'title': 'Boarding Commenced (Gate 2)', 'body': 'Coach ETB-AA-HW-01 is now boarding at Kality Terminal Gate 2.', 'time': '5 mins ago'},
      {'title': 'Telebirr Payment Confirmed', 'body': 'Payment received for PNR BK-WEB-040801. Boarding QR pass is ready.', 'time': '2 hrs ago'},
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

// ============================================================================
// 5. PROFILE SCREEN
// ============================================================================
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
            const Text('+251 91 122 3344', style: TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 24),
            _buildProfileTile(Icons.badge, 'National ID', 'KB-04-19283 (Verified)'),
            _buildProfileTile(Icons.security, 'Highway Safety Manifest', 'FDRE Police Compliant'),
            _buildProfileTile(Icons.support_agent, 'Fleet Customer Service', 'Call 9444 (24/7)'),
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
