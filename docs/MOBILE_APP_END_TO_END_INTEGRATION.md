# Mobile App End-to-End Passenger Journey & Backend Integration

## 1. Overview

The Abyssinia Bus Passenger Mobile Application (`apps/mobile_app`) is connected directly to the production NestJS backend (`apps/api`) at `/api/v1`. It implements the complete customer travel lifecycle:

```text
SEARCH TRIP
    ↓ (GET /api/v1/trips/search?from=ADD&to=HWA&date=2026-10-05)
SELECT DEPARTURE
    ↓ (GET /api/v1/trips/:id/seats?fromStopId=ADD&toStopId=HWA)
CHOOSE SEATS & 5-MIN HOLD
    ↓ (POST /api/v1/reservations)
ENTER PASSENGER MANIFEST
    ↓ (Federal Police Highway Manifest Data)
CHECKOUT & SERVER-SIDE PRICING
    ↓ (POST /api/v1/bookings)
PAYMENT (TELEBIRR / CHAPA)
    ↓ (POST /api/v1/payments/webhook)
DIGITAL BOARDING PASS (QR CODE)
    ↓ (POST /api/v1/boarding/scan)
LIVE GPS CORRIDOR TRACKING
```

---

## 2. API Contract & Data Flow

### A. Trip Search (`GET /api/v1/trips/search`)
- **Query parameters**: `from`, `to`, `date`.
- **Response**: Aggregated trip summaries including route stops, intermediate segments, available seats computed as the minimum availability across traversed route segments, official base price in ETB, departure/arrival schedules, bus plate, and amenities.
- **Flutter Screen**: `HomeSearchScreen` ➔ `RouteResultsScreen`.

### B. Segment Seat Occupancy (`GET /api/v1/trips/:id/seats`)
- **Query parameters**: `fromStopId`, `toStopId`.
- **Response**: List of seats (`1A`, `1B`, `1C`, `1D`, etc.) with `status: AVAILABLE` across all segments required for this journey. Multi-hop seat reuse is honored.
- **Flutter Screen**: `SeatSelectionScreen`.

### C. 5-Minute Atomic Seat Hold (`POST /api/v1/reservations`)
- **Body**:
  ```json
  {
    "tripId": "trip_501",
    "fromStopId": "ADD",
    "toStopId": "HWA",
    "seatIds": ["1A", "1B"]
  }
  ```
- **Response**:
  ```json
  {
    "id": "res_9001",
    "tripId": "trip_501",
    "status": "ACTIVE",
    "expiresAt": "2026-09-27T17:35:00Z",
    "seats": ["1A", "1B"]
  }
  ```
- **UI Experience**: An active countdown banner (`04:59` $\dots$ `00:00`) is displayed across the passenger information and payment screens.

### D. Booking Creation & Server-Side Fare Calculation (`POST /api/v1/bookings`)
- **Body**:
  ```json
  {
    "reservationId": "res_9001",
    "passengers": [
      {
        "seatId": "1A",
        "firstName": "Abebe",
        "lastName": "Kebede",
        "phone": "+251911223344",
        "passengerIdNumber": "KB-04-19283",
        "email": "abebe@example.com"
      }
    ],
    "paymentMethod": "TELEBIRR",
    "channel": "PASSENGER_APP"
  }
  ```
- **Rule**: Client-side prices are never trusted. The backend `PricingService` authoritatively computes subtotal, taxes/fees, and applicable discounts.
- **Inventory State**: Seats transition to `PAYMENT_PENDING`. Payment is created outside the database transaction.

### E. Idempotent Payment Webhook (`POST /api/v1/payments/webhook`)
- **Body**:
  ```json
  {
    "provider": "TELEBIRR",
    "transactionId": "TX_TB_9981245",
    "paymentReference": "PAY-1790519294925-DF197A",
    "amount": 570,
    "currency": "ETB",
    "status": "SUCCESS"
  }
  ```
- **Processing**: Deduplicated by `PaymentEvent` table. The booking is marked `CONFIRMED`, seats marked `CONFIRMED`, and digital tickets issued with high-entropy `qrToken` (`ABY-...`) and HMAC SHA-256 `qrHash`.

### F. Digital Boarding Pass & Door Gate Scan (`POST /api/v1/boarding/scan`)
- **Flutter Screen**: `QrTicketScreen` renders the signed QR code, PNR, seat, passenger manifest credentials, departure time, and quick actions ("Live GPS Track", "Cancel Trip").
- **Scanning**: Conductors scan the QR code. Duplicate scans are rejected with an audible warning.

### G. Live GPS Bus Tracking (`LiveTrackingScreen`)
- Real-time bus telemetry: current highway corridor checkpoint, speed governor telemetry (74 km/h), remaining distance, ETA, and driver hotline (`9444`).

---

## 3. Automated Test Verification

All mobile and backend test suites are verified:

```bash
# Execute full suite across TypeScript Backend & Flutter Mobile App
npm run test:all
```

| Test Suite | Target | Status |
|:---|:---|:---:|
| `test:phase1` | Companies, Branches, Buses, 4-Stop Corridors, Schedules | PASS (100%) |
| `test:engine` | Segment Inventory, Multi-hop Seat Reuse, Expiration Worker | PASS (100%) |
| `test:agent` | Counter Agent Shifts, Cash Tender, Thermal POS Receipts, Reconciliation | PASS (100%) |
| `test:e2e:booking` | Online Hold vs Counter Race Condition, Concurrency Defense, Boarding Gate | PASS (100%) |
| `test:booking:service` | Reservation ➔ Server Pricing ➔ Webhook Deduplication ➔ Door Gate | PASS (100%) |
| `test:mobile` | Flutter Widget Smoke, Models Parsing, Seat Selection, QR Boarding Pass | PASS (100%) |
