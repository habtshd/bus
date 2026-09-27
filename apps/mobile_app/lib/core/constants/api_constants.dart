class ApiConstants {
  // Use localhost:4000/api/v1 for desktop/web testing, 10.0.2.2:4000 for Android emulator
  static const String baseUrl = 'http://localhost:4000/api/v1';

  static const String tripsEndpoint = '/trips';
  static const String searchTripsEndpoint = '/trips/search';
  static const String seatsEndpoint = '/seats';
  static const String reservationsEndpoint = '/reservations';
  static const String bookingsEndpoint = '/bookings';
  static const String paymentsWebhookEndpoint = '/payments/webhook';
  static const String boardingScanEndpoint = '/boarding/scan';
  static const String authLoginEndpoint = '/auth/login';
  static const String authRegisterEndpoint = '/auth/register';

  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);
}
