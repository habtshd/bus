export 'booking_passenger.dart';

class Booking {
  final String id;
  final String bookingReference;
  final String status;
  final double subtotal;
  final double fees;
  final double total;
  final String currency;
  final String? paymentReference;
  final String? checkoutUrl;

  const Booking({
    required this.id,
    required this.bookingReference,
    required this.status,
    required this.subtotal,
    this.fees = 0,
    required this.total,
    this.currency = 'ETB',
    this.paymentReference,
    this.checkoutUrl,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    final payment = json['payment'] ?? {};
    return Booking(
      id: json['id'] ?? '',
      bookingReference: json['bookingReference'] ?? 'BK-${DateTime.now().millisecondsSinceEpoch}',
      status: json['status'] ?? 'PAYMENT_PENDING',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? (json['total'] as num?)?.toDouble() ?? 850.0,
      fees: (json['fees'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 850.0,
      currency: json['currency'] ?? 'ETB',
      paymentReference: payment['paymentReference'] ?? json['paymentReference'],
      checkoutUrl: payment['checkoutUrl'] ?? json['checkoutUrl'],
    );
  }
}
