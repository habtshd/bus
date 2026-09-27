import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/providers/app_providers.dart';
import '../../trips/models/trip.dart';
import '../../reservations/models/reservation.dart';
import '../../booking/models/booking_passenger.dart';
import '../models/payment_method.dart';

class PaymentPage extends ConsumerStatefulWidget {
  final String tripId;
  final Map<String, dynamic>? paymentData;

  const PaymentPage({
    Key? key,
    required this.tripId,
    this.paymentData,
  }) : super(key: key);

  @override
  ConsumerState<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends ConsumerState<PaymentPage> {
  late Trip _trip;
  late Reservation _reservation;
  late List<BookingPassenger> _passengers;
  late List<String> _seats;

  PaymentType _selectedPaymentType = PaymentType.telebirr;

  @override
  void initState() {
    super.initState();
    final data = widget.paymentData ?? {};
    _trip = data['trip'] ??
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

    _reservation = data['reservation'] ??
        Reservation(
          id: 'res_mock',
          tripId: _trip.id,
          fromStopId: _trip.originCode,
          toStopId: _trip.destinationCode,
          status: 'ACTIVE',
          expiresAt: DateTime.now().add(const Duration(minutes: 5)),
          seatIds: ['12A'],
        );

    _passengers = (data['passengers'] as List<dynamic>?)?.cast<BookingPassenger>() ??
        [const BookingPassenger(seatId: '12A', firstName: 'John', lastName: 'Smith', phone: '+251911223344')];

    _seats = (data['seats'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? ['12A'];
  }

  void _handlePay() async {
    String methodCode = 'TELEBIRR';
    if (_selectedPaymentType == PaymentType.cbeBirr) methodCode = 'CBE_BIRR';
    if (_selectedPaymentType == PaymentType.chapa || _selectedPaymentType == PaymentType.card) methodCode = 'CHAPA';

    final ticket = await ref.read(bookingProvider.notifier).createBookingAndPay(
      reservationId: _reservation.id,
      passengers: _passengers,
      paymentMethod: methodCode,
      trip: _trip,
    );

    if (ticket != null && mounted) {
      context.go('/tickets/${ticket.id}', extra: ticket);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment could not be completed. Your seat has not been charged.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingProvider);
    final totalFare = _seats.length * _trip.price;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Payment Selection'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Total Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Amount Due:', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Text('${_seats.length} Seat(s): ${_seats.join(', ')}', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                    ],
                  ),
                  Text('ETB ${totalFare.toInt()}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 24, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Choose Payment Gateway', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            _buildOptionCard(
              type: PaymentType.telebirr,
              title: 'Mobile Money (telebirr)',
              subtitle: 'Ethio Telecom SuperApp / USSD (*127#)',
              icon: Icons.phone_android,
              accentColor: const Color(0xFF0284C7),
            ),
            _buildOptionCard(
              type: PaymentType.cbeBirr,
              title: 'Bank (CBE Birr)',
              subtitle: 'Commercial Bank of Ethiopia Direct Settlement',
              icon: Icons.account_balance,
              accentColor: const Color(0xFF7E22CE),
            ),
            _buildOptionCard(
              type: PaymentType.chapa,
              title: 'Pay with Card (Chapa Gateway)',
              subtitle: 'Local & International Visa, Mastercard, Awash',
              icon: Icons.credit_card,
              accentColor: const Color(0xFF10B981),
            ),
            const Spacer(),
            if (bookingState.isProcessing)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: Column(
                    children: [
                      CircularProgressIndicator(color: Color(0xFF10B981)),
                      SizedBox(height: 10),
                      Text('Processing payment with provider...', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ),
              )
            else
              ElevatedButton(
                onPressed: _handlePay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text('CONFIRM & PAY ETB ${totalFare.toInt()}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionCard({
    required PaymentType type,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
  }) {
    final isSelected = _selectedPaymentType == type;

    return GestureDetector(
      onTap: () => setState(() => _selectedPaymentType = type),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          border: Border.all(color: isSelected ? accentColor : Colors.white12, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: accentColor.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: accentColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                ],
              ),
            ),
            Icon(isSelected ? Icons.check_circle : Icons.radio_button_unchecked, color: isSelected ? accentColor : Colors.white30),
          ],
        ),
      ),
    );
  }
}
