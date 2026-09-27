import 'package:go_router/go_router.dart';
import '../features/home/presentation/home_page.dart';
import '../features/auth/presentation/login_page.dart';
import '../features/auth/presentation/register_page.dart';
import '../features/search/presentation/search_page.dart';
import '../features/trips/presentation/trips_page.dart';
import '../features/trips/presentation/trip_details_page.dart';
import '../features/seats/presentation/seat_selection_page.dart';
import '../features/booking/presentation/checkout_page.dart';
import '../features/payment/presentation/payment_page.dart';
import '../features/tickets/presentation/my_bookings_page.dart';
import '../features/tickets/presentation/ticket_page.dart';
import '../features/tracking/presentation/live_tracking_page.dart';
import '../features/support/presentation/support_page.dart';
import '../features/profile/presentation/profile_page.dart';
import '../features/trips/models/trip.dart';
import '../features/tickets/models/ticket.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterPage(),
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchPage(),
    ),
    GoRoute(
      path: '/trips',
      builder: (context, state) => const TripsPage(),
    ),
    GoRoute(
      path: '/trips/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        final tripExtra = state.extra as Trip?;
        return TripDetailsPage(tripId: id, tripExtra: tripExtra);
      },
    ),
    GoRoute(
      path: '/trips/:id/seats',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        final tripExtra = state.extra as Trip?;
        return SeatSelectionPage(tripId: id, tripExtra: tripExtra);
      },
    ),
    GoRoute(
      path: '/checkout/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        final data = state.extra as Map<String, dynamic>?;
        return CheckoutPage(tripId: id, checkoutData: data);
      },
    ),
    GoRoute(
      path: '/payment/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        final data = state.extra as Map<String, dynamic>?;
        return PaymentPage(tripId: id, paymentData: data);
      },
    ),
    GoRoute(
      path: '/bookings',
      builder: (context, state) => const MyBookingsPage(),
    ),
    GoRoute(
      path: '/bookings/:id',
      builder: (context, state) => const MyBookingsPage(),
    ),
    GoRoute(
      path: '/tickets/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        final ticket = state.extra as Ticket?;
        return TicketPage(ticketId: id, ticketExtra: ticket);
      },
    ),
    GoRoute(
      path: '/trips/:id/tracking',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? 'trip_501';
        return LiveTrackingPage(tripId: id);
      },
    ),
    GoRoute(
      path: '/support',
      builder: (context, state) => const SupportPage(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfilePage(),
    ),
  ],
);
