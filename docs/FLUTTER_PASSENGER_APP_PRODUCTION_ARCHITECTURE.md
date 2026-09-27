# Flutter Passenger App — Production Architecture

## 1. Overview & Technology Stack

The Abyssinia Bus Passenger Mobile Application (`apps/mobile_app`) is built with modern, production-grade Flutter patterns:

- **State Management**: [Riverpod (flutter_riverpod)](https://riverpod.dev) — isolated, decoupled state controllers with zero boilerplate.
- **Networking**: [Dio](https://pub.dev/packages/dio) with interceptors, timeout handling, and automatic JWT bearer attachment.
- **Navigation**: [GoRouter](https://pub.dev/packages/go_router) with declarative deep linking and parameter passing.
- **Security & Caching**: `SecureStorage` with access/refresh token management and offline ticket caching.
- **QR Code Engine**: Cryptographic door-gate ticket scanner integration (`qr_flutter`).

```text
┌─────────────────────────────────┐
│           Flutter UI            │
├─────────────────────────────────┤
│         Riverpod State          │
├─────────────────────────────────┤
│        Repository Layer         │
├─────────────────────────────────┤
│     Dio API Client / Storage    │
└────────────────┬────────────────┘
                 │
                 ▼
       NestJS Backend (/api/v1)
```

---

## 2. Directory Structure

```text
apps/mobile_app/lib/
├── main.dart
│
├── app/
│   ├── app.dart              # BusApp widget with MaterialApp.router
│   ├── router.dart           # GoRouter declarations
│   └── theme.dart            # Luxury dark theme with Ethiopian gold (0xFFF59E0B)
│
├── core/
│   ├── constants/
│   │   └── api_constants.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── auth_interceptor.dart
│   │   └── api_exception.dart
│   └── storage/
│       └── secure_storage.dart
│
├── features/
│   ├── auth/
│   │   ├── data/auth_repository.dart
│   │   ├── models/auth_user.dart
│   │   └── presentation/login_page.dart, register_page.dart
│   ├── home/
│   │   └── presentation/home_page.dart
│   ├── search/
│   │   └── presentation/search_page.dart
│   ├── trips/
│   │   ├── data/trip_repository.dart
│   │   ├── models/trip.dart
│   │   └── presentation/trips_page.dart, trip_details_page.dart
│   ├── seats/
│   │   ├── models/seat.dart, seat_status.dart
│   │   └── presentation/seat_selection_page.dart
│   ├── reservations/
│   │   └── models/reservation.dart
│   ├── booking/
│   │   ├── data/booking_repository.dart
│   │   ├── models/booking.dart, booking_passenger.dart
│   │   └── presentation/checkout_page.dart
│   ├── payment/
│   │   ├── models/payment_method.dart
│   │   └── presentation/payment_page.dart
│   ├── tickets/
│   │   ├── models/ticket.dart
│   │   └── presentation/ticket_page.dart, my_bookings_page.dart
│   ├── tracking/
│   │   ├── models/tracking_info.dart
│   │   └── presentation/live_tracking_page.dart
│   ├── support/
│   │   └── presentation/support_page.dart
│   └── profile/
│       └── presentation/profile_page.dart
│
└── shared/
    └── providers/app_providers.dart
```

---

## 3. GoRouter Route Registry

| Path | Screen | Purpose |
|:---|:---|:---|
| `/` | `HomePage` | Home screen with corridor search & quick actions |
| `/login` | `LoginPage` | Phone / email authentication |
| `/register` | `RegisterPage` | Passenger registration with national ID |
| `/search` | `SearchPage` | Extended search criteria |
| `/trips` | `TripsPage` | Search results with fares, schedules & amenities |
| `/trips/:id` | `TripDetailsPage` | Full itinerary, luggage & refund policies |
| `/trips/:id/seats` | `SeatSelectionPage` | 2x2 cabin seat map with 5-minute atomic holds |
| `/checkout/:id` | `CheckoutPage` | Highway manifest entry & authoritative backend pricing |
| `/payment/:id` | `PaymentPage` | Telebirr, CBE Birr & Chapa gateway settlement |
| `/bookings` | `MyBookingsPage` | Upcoming, Completed, and Cancelled trips |
| `/tickets/:id` | `TicketPage` | Digital Boarding Pass with cryptographic gate QR |
| `/trips/:id/tracking` | `LiveTrackingPage` | Live GPS corridor tracking with speed governor info |
| `/support` | `SupportPage` | 24/7 hotline (9444) & emergency police contacts |
| `/profile` | `ProfilePage` | Verified passenger profile and logout |

---

## 4. Key Architectural Safeguards

1. **Zero Client Price Trusting**: The mobile client never calculates or sends authoritative ticket totals. `PricingService` on the backend calculates subtotals, discounts, and fees.
2. **Atomic Inventory Protection**: When a passenger taps a seat, `POST /api/v1/reservations` is triggered. The seat is not visually selected until the backend confirms the hold.
3. **5-Minute UX Timer**: Visual countdown (`04:59` $\dots$ `00:00`) informs the passenger of their inventory hold; on expiry, the inventory is released.
4. **Federal Police Highway Manifest Data**: Mandatory passenger full name, mobile phone, and Kebele / National ID are captured per seat before payment.
5. **Idempotent Settlement**: Payment completion triggers deduplication via `PaymentEvent` table, issuing unique digital tickets with HMAC SHA-256 signed `qrHash` tokens.
