import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/models/auth_user.dart';
import '../../features/trips/data/trip_repository.dart';
import '../../features/trips/models/trip.dart';
import '../../features/seats/models/seat.dart';
import '../../features/reservations/models/reservation.dart';
import '../../features/booking/data/booking_repository.dart';
import '../../features/booking/models/booking.dart';
import '../../features/booking/models/booking_passenger.dart';
import '../../features/tickets/models/ticket.dart';
import '../../features/tracking/models/tracking_info.dart';

// ============================================================================
// Core Dependency Providers
// ============================================================================
final secureStorageProvider = Provider<SecureStorage>((ref) => SecureStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(storage: storage);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthRepository(api: AuthApi(client: client));
});

final tripRepositoryProvider = Provider<TripRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return TripRepository(api: TripApi(client: client));
});

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return BookingRepository(api: BookingApi(client: client));
});

// ============================================================================
// 1. Auth Provider
// ============================================================================
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final AuthUser? user;
  final String? error;

  const AuthState({
    this.isAuthenticated = true,
    this.isLoading = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    AuthUser? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _init();
    return const AuthState();
  }

  void _init() async {
    final repo = ref.read(authRepositoryProvider);
    final loggedIn = await repo.isLoggedIn();
    if (loggedIn) {
      state = state.copyWith(isAuthenticated: true);
    }
  }

  Future<void> login(String phoneOrEmail, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repo = ref.read(authRepositoryProvider);
      final user = await repo.login(phoneOrEmail: phoneOrEmail, password: password);
      state = state.copyWith(isAuthenticated: true, isLoading: false, user: user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> logout() async {
    final repo = ref.read(authRepositoryProvider);
    await repo.logout();
    state = const AuthState(isAuthenticated: false);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

// ============================================================================
// 2. Search Provider
// ============================================================================
class SearchState {
  final String origin;
  final String destination;
  final DateTime date;
  final int passengerCount;
  final bool isLoading;
  final List<Trip> results;
  final String? error;

  const SearchState({
    this.origin = 'Addis Ababa',
    this.destination = 'Bahir Dar',
    required this.date,
    this.passengerCount = 1,
    this.isLoading = false,
    this.results = const [],
    this.error,
  });

  SearchState copyWith({
    String? origin,
    String? destination,
    DateTime? date,
    int? passengerCount,
    bool? isLoading,
    List<Trip>? results,
    String? error,
  }) {
    return SearchState(
      origin: origin ?? this.origin,
      destination: destination ?? this.destination,
      date: date ?? this.date,
      passengerCount: passengerCount ?? this.passengerCount,
      isLoading: isLoading ?? this.isLoading,
      results: results ?? this.results,
      error: error,
    );
  }
}

class SearchNotifier extends Notifier<SearchState> {
  @override
  SearchState build() => SearchState(date: DateTime.now());

  void updateCriteria({String? origin, String? destination, DateTime? date, int? passengers}) {
    state = state.copyWith(
      origin: origin,
      destination: destination,
      date: date,
      passengerCount: passengers,
    );
  }

  Future<void> search() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repo = ref.read(tripRepositoryProvider);
      final trips = await repo.searchTrips(
        from: state.origin,
        to: state.destination,
        date: state.date,
      );
      state = state.copyWith(isLoading: false, results: trips);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final searchProvider = NotifierProvider<SearchNotifier, SearchState>(SearchNotifier.new);

// ============================================================================
// 3. Seat Selection Provider
// ============================================================================
class SeatSelectionState {
  final Trip? trip;
  final List<Seat> allSeats;
  final List<String> selectedSeats;
  final bool isLoading;
  final String? error;

  const SeatSelectionState({
    this.trip,
    this.allSeats = const [],
    this.selectedSeats = const [],
    this.isLoading = false,
    this.error,
  });

  double get totalFare => (trip?.price ?? 850.0) * selectedSeats.length;

  SeatSelectionState copyWith({
    Trip? trip,
    List<Seat>? allSeats,
    List<String>? selectedSeats,
    bool? isLoading,
    String? error,
  }) {
    return SeatSelectionState(
      trip: trip ?? this.trip,
      allSeats: allSeats ?? this.allSeats,
      selectedSeats: selectedSeats ?? this.selectedSeats,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class SeatSelectionNotifier extends Notifier<SeatSelectionState> {
  @override
  SeatSelectionState build() => const SeatSelectionState();

  Future<void> loadSeatsForTrip(Trip trip) async {
    state = state.copyWith(trip: trip, isLoading: true, selectedSeats: []);
    try {
      final repo = ref.read(tripRepositoryProvider);
      final seats = await repo.getSeatsForJourney(
        tripId: trip.id,
        fromStopId: trip.originCode,
        toStopId: trip.destinationCode,
      );
      state = state.copyWith(isLoading: false, allSeats: seats);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void toggleSeat(String seatNumber) {
    final list = List<String>.from(state.selectedSeats);
    if (list.contains(seatNumber)) {
      list.remove(seatNumber);
    } else {
      if (list.length >= 4) return;
      list.add(seatNumber);
    }
    state = state.copyWith(selectedSeats: list);
  }
}

final seatSelectionProvider = NotifierProvider<SeatSelectionNotifier, SeatSelectionState>(SeatSelectionNotifier.new);

// ============================================================================
// 4. Reservation & Hold Provider
// ============================================================================
class ReservationState {
  final Reservation? reservation;
  final int secondsRemaining;
  final bool isHolding;
  final String? error;

  const ReservationState({
    this.reservation,
    this.secondsRemaining = 0,
    this.isHolding = false,
    this.error,
  });

  ReservationState copyWith({
    Reservation? reservation,
    int? secondsRemaining,
    bool? isHolding,
    String? error,
  }) {
    return ReservationState(
      reservation: reservation ?? this.reservation,
      secondsRemaining: secondsRemaining ?? this.secondsRemaining,
      isHolding: isHolding ?? this.isHolding,
      error: error,
    );
  }
}

class ReservationNotifier extends Notifier<ReservationState> {
  Timer? _timer;

  @override
  ReservationState build() {
    ref.onDispose(() => _timer?.cancel());
    return const ReservationState();
  }

  Future<Reservation?> holdSeats({
    required String tripId,
    required String fromStopId,
    required String toStopId,
    required List<String> seatIds,
  }) async {
    state = state.copyWith(isHolding: true, error: null);
    try {
      final repo = ref.read(tripRepositoryProvider);
      final res = await repo.holdSeat(
        tripId: tripId,
        fromStopId: fromStopId,
        toStopId: toStopId,
        seatIds: seatIds,
      );

      _timer?.cancel();
      int remaining = res.remainingSeconds;
      if (remaining <= 0) remaining = 300;

      state = state.copyWith(
        reservation: res,
        secondsRemaining: remaining,
        isHolding: false,
      );

      _timer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (state.secondsRemaining > 0) {
          state = state.copyWith(secondsRemaining: state.secondsRemaining - 1);
        } else {
          _timer?.cancel();
        }
      });

      return res;
    } catch (e) {
      state = state.copyWith(isHolding: false, error: e.toString());
      return null;
    }
  }
}

final reservationProvider = NotifierProvider<ReservationNotifier, ReservationState>(ReservationNotifier.new);

// ============================================================================
// 5. Booking & Payment Provider
// ============================================================================
class BookingState {
  final Booking? booking;
  final Ticket? ticket;
  final bool isProcessing;
  final String? error;

  const BookingState({
    this.booking,
    this.ticket,
    this.isProcessing = false,
    this.error,
  });

  BookingState copyWith({
    Booking? booking,
    Ticket? ticket,
    bool? isProcessing,
    String? error,
  }) {
    return BookingState(
      booking: booking ?? this.booking,
      ticket: ticket ?? this.ticket,
      isProcessing: isProcessing ?? this.isProcessing,
      error: error,
    );
  }
}

class BookingNotifier extends Notifier<BookingState> {
  @override
  BookingState build() => const BookingState();

  Future<Ticket?> createBookingAndPay({
    required String reservationId,
    required List<BookingPassenger> passengers,
    required String paymentMethod,
    required Trip trip,
  }) async {
    state = state.copyWith(isProcessing: true, error: null);
    try {
      final repo = ref.read(bookingRepositoryProvider);
      final booking = await repo.createBooking(
        reservationId: reservationId,
        passengers: passengers,
        paymentMethod: paymentMethod,
      );

      final ticket = await repo.processPaymentAndGetTicket(
        booking: booking,
        passengers: passengers,
        tripCode: trip.busSideNumber.isNotEmpty ? 'ETB-AA-${trip.destinationCode}' : 'ETB-AA-HW',
        route: '${trip.origin} ➔ ${trip.destination}',
        departureTime: trip.departure,
        provider: paymentMethod,
      );

      state = state.copyWith(
        booking: booking,
        ticket: ticket,
        isProcessing: false,
      );
      return ticket;
    } catch (e) {
      state = state.copyWith(isProcessing: false, error: e.toString());
      return null;
    }
  }
}

final bookingProvider = NotifierProvider<BookingNotifier, BookingState>(BookingNotifier.new);

// ============================================================================
// 6. Tracking Provider (Live Telemetry)
// ============================================================================
final trackingProvider = Provider.family<TrackingInfo, String>((ref, tripId) {
  return TrackingInfo(
    tripId: tripId,
    busName: 'SB-023 VIP Luxury Coach',
    busPlate: '3-98432-ET',
    status: 'ON TIME',
    currentLocation: 'Debre Sina Pass (Km 190)',
    nextStop: 'Dessie Terminal',
    eta: '01:45 PM',
    speedKmh: 74,
    distanceRemainingKm: 184.0,
    driverName: 'Capt. Kebede Worku',
    conductorName: 'Alemu Girma',
  );
});
