import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/ticket.dart';

class TicketPage extends StatelessWidget {
  final String ticketId;
  final Ticket? ticketExtra;

  const TicketPage({
    Key? key,
    required this.ticketId,
    this.ticketExtra,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ticket = ticketExtra ??
        Ticket(
          id: ticketId,
          ticketNumber: 'TKT-92831',
          bookingReference: 'BK-20261005-00125',
          tripCode: 'ETB-AA-BD-01',
          route: 'Addis Ababa ➔ Bahir Dar',
          seatNumber: '12A',
          passengerName: 'John Smith',
          passengerPhone: '+251911223344',
          passengerIdNumber: 'KB-12-0941',
          fareETB: 850.0,
          status: 'CONFIRMED',
          qrToken: 'ABY-QR-990812',
          departureTime: DateTime.now().add(const Duration(hours: 3)),
        );

    final qrPayload = ticket.qrToken ??
        ticket.qrHash ??
        '{"tkt":"${ticket.ticketNumber}","pnr":"${ticket.bookingReference}","seat":"${ticket.seatNumber}","name":"${ticket.passengerName}"}';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Digital Boarding Pass', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
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
                      // QR Code
                      QrImageView(
                        data: qrPayload,
                        version: QrVersions.auto,
                        size: 180.0,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'SCAN AT BUS DOOR FOR BOARDING',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54, letterSpacing: 0.5),
                      ),
                      const Divider(color: Colors.black12, height: 24),
                      // Meta Details
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildField('SEAT NUMBER', ticket.seatNumber, isBig: true),
                          _buildField('TICKET #', ticket.ticketNumber),
                          _buildField('BOOKING PNR', ticket.bookingReference),
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
              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        context.push('/trips/trip_501/tracking');
                      },
                      icon: const Icon(Icons.gps_fixed, size: 18),
                      label: const Text('Track Bus Live', style: TextStyle(fontWeight: FontWeight.bold)),
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
                    child: ElevatedButton.icon(
                      onPressed: () => context.go('/bookings'),
                      icon: const Icon(Icons.home, size: 18),
                      label: const Text('My Bookings', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
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
