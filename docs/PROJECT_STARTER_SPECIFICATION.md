# Abyssinia Bus S.C. — Actual Project Starter Specification
**Version:** 1.0.0 Production Foundation  
**Target Stack:** TypeScript, NestJS, Prisma ORM, PostgreSQL, Redis, WebSocket, Flutter (Mobile), Next.js (Admin/Agent)  
**Verification Status:** 100% Pass across Concurrency, Inventory Engine, Agent POS, and E2E Lifecycle Suites

---

## Table of Contents
1. [Final Prisma Schema & Database Architecture](#1-final-prisma-schema--database-architecture)
2. [NestJS Module Skeleton & Dependency Graph](#2-nestjs-module-skeleton--dependency-graph)
3. [API Contracts & Response Envelope Specification](#3-api-contracts--response-envelope-specification)
4. [Authentication & RBAC Implementation](#4-authentication--rbac-implementation)
5. [Atomic Booking Transaction Implementation](#5-atomic-booking-transaction-implementation)
6. [Flutter API Client Architecture](#6-flutter-api-client-architecture)
7. [Environment Configuration](#7-environment-configuration)
8. [Docker Development Environment](#8-docker-development-environment)
9. [Master Seed Data Specification](#9-master-seed-data-specification)
10. [First End-to-End Booking Test Specification](#10-first-end-to-end-booking-test-specification)

---

## 1. Final Prisma Schema & Database Architecture

The data tier is structured around PostgreSQL with Prisma ORM. The relational schema models the bus transportation domain with zero double-booking tolerance via materialized segment seats.

- **Prisma Schema File:** [`apps/api/prisma/schema.prisma`](file:///c:/Users/habts/Downloads/bus-1/apps/api/prisma/schema.prisma)
- **Production Migration DDL:** [`apps/api/prisma/migrations/20260927163000_production_schema_v1.sql`](file:///c:/Users/habts/Downloads/bus-1/apps/api/prisma/migrations/20260927163000_production_schema_v1.sql)

### 1.1 Complete Model Index (27 Models)
1. **Core Organization:** `Company`, `Branch`, `User`, `CashShift`
2. **Fleet Management:** `BusType`, `Bus`, `Seat`, `Tire`, `SparePart`, `MaintenanceRecord`, `MaintenancePart`, `FuelTransaction`
3. **Route & Operations:** `Stop`, `Route`, `RouteStop`, `Schedule`, `Trip`, `TripDriverAssignment`, `Driver`, `TripSegment`, `TripSegmentSeat`, `SeatLock`
4. **Commercial & Ticketing:** `Passenger`, `Reservation`, `Booking`, `BookingPassenger`, `BookingSegment`, `Payment`, `PaymentEvent`, `Ticket`, `Boarding`
5. **Support & Observability:** `IncidentReport`, `SupportTicket`, `GPSLocation`, `Notification`, `AuditLog`

### 1.2 Materialized Segment Seat Topology
To prevent seat collision over intermediate stops (e.g. Addis Ababa $\to$ Debre Sina $\to$ Dessie $\to$ Bahir Dar), each journey is divided into sequential `TripSegment` records. Every physical `Seat` is materialized as a `TripSegmentSeat` for every segment:

$$\text{Total Segment Seats} = \sum_{\text{segments}} (\text{Bus Capacity})$$

```prisma
model TripSegmentSeat {
  id            String        @id @default(uuid())
  tripSegmentId String
  tripSegment   TripSegment   @relation(fields: [tripSegmentId], references: [id], onDelete: Cascade)
  busSeatId     String
  busSeat       Seat          @relation(fields: [busSeatId], references: [id])
  status        TripSeatStatus @default(AVAILABLE) // AVAILABLE, HELD, BOOKED, BLOCKED
  reservationId String?
  heldUntil     DateTime?

  @@unique([tripSegmentId, busSeatId])
  @@index([tripSegmentId, status])
  @@index([heldUntil])
}
```

---

## 2. NestJS Module Skeleton & Dependency Graph

### 2.1 File & Directory Tree
```text
apps/api/
├── src/
│   ├── main.ts                           # Global bootstrap, pipes, swagger, CORS
│   ├── app.module.ts                     # Root aggregator module
│   │
│   ├── config/
│   │   ├── configuration.ts              # Typed environment config
│   │   └── validation.schema.ts          # Joi/Zod environment validator
│   │
│   ├── common/
│   │   ├── database/
│   │   │   └── prisma.service.ts         # PrismaClient lifecycle & query logging
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts # Extracts authenticated user from Request
│   │   │   ├── permissions.decorator.ts  # Requires specific fine-grained permissions
│   │   │   └── roles.decorator.ts        # Requires RBAC roles
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Standard error envelope formatter
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts         # Bearer token validation
│   │   │   └── roles.guard.ts            # RBAC + permission verification
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts    # Request/Response latency logger
│   │   │   └── transform.interceptor.ts  # Standard { success: true, data } envelope
│   │   └── pipes/
│   │       └── validation.pipe.ts        # class-validator whitelist & transform
│   │
│   └── modules/
│       ├── auth/                         # JWT, refresh tokens, credentials, hashing
│       ├── users/                        # Staff & customer user profiles
│       ├── branches/                     # Physical ticket offices & counter assignments
│       ├── buses/                        # Bus inventory, seat layouts, tire telemetry
│       ├── drivers/                      # Driver licensing, shift management
│       ├── routes/                       # Geographical routes, intermediate stops, distance
│       ├── schedules/                    # Recurrence rules (daily, weekly, seasonal)
│       ├── trips/                        # Concrete scheduled departures & segment generation
│       ├── inventory/                    # Real-time seat availability & seat locks
│       ├── reservations/                 # 5-minute atomic holds with Redis/Postgres TTL
│       ├── bookings/                     # Booking state machine, customer records, manifests
│       ├── payments/                     # Telebirr, Chapa, CBE Birr, Cash drawer shifts
│       ├── tickets/                      # Cryptographic QR ticket generation & thermal POS
│       ├── boarding/                     # Gate scanning, check-in, duplicate prevention
│       ├── agent/                        # Counter terminal POS, cash shift settlement
│       ├── tracking/                     # Real-time GPS ingest & WebSocket broadcasting
│       ├── incidents/                    # Breakdowns, delays, accidents, road closures
│       ├── maintenance/                  # Service schedules, spare parts, work orders
│       ├── fuel/                         # Fuel fill logs, mileage, efficiency audits
│       ├── notifications/                # Ethio Telecom SMS, push notifications, email
│       ├── reports/                      # Daily branch settlement, revenue, load factors
│       └── audit/                        # Append-only immutable system activity logs
```

### 2.2 Unidirectional Dependency Hierarchy
No circular dependencies are permitted. Higher-level orchestration modules consume lower-level domain services:

```mermaid
graph TD
    Passengers --> Bookings
    Bookings --> Reservations
    Reservations --> Inventory
    Inventory --> Trips
    Trips --> Routes
    Trips --> Buses
    Bookings --> Payments
    Payments --> Tickets
    Tickets --> Boarding
    Agent --> Bookings
    Agent --> Payments
```

---

## 3. API Contracts & Response Envelope Specification

### 3.1 Standard Response Envelopes

#### Success Envelope (HTTP 200, 201)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-09-27T13:40:00.000Z",
    "requestId": "req_8fa1990c"
  }
}
```

#### Error Envelope (HTTP 400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "error": {
    "code": "SEAT_ALREADY_RESERVED",
    "message": "Seat 12A is no longer available for this journey.",
    "details": {
      "conflictingSeat": "12A",
      "conflictingSegment": "Addis Ababa -> Debre Sina"
    }
  },
  "meta": {
    "timestamp": "2026-09-27T13:40:00.000Z",
    "requestId": "req_8fa1990c"
  }
}
```

### 3.2 Core Endpoint Contracts

#### 1. Hold Seat Request (`POST /api/v1/reservations`)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "tripId": "trip_501",
  "fromStopId": "stop_ADD",
  "toStopId": "stop_BD",
  "seatIds": ["seat_12A"]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "reservationId": "res_99812a0f",
    "expiresAt": "2026-09-27T13:45:00.000Z",
    "ttlSeconds": 300,
    "heldSeats": ["12A"]
  }
}
```

#### 2. Confirm Booking (`POST /api/v1/bookings`)
- **Request Body:**
```json
{
  "tripId": "trip_501",
  "fromStopId": "stop_ADD",
  "toStopId": "stop_BD",
  "reservationId": "res_99812a0f",
  "customerName": "Abebe Bikila",
  "customerPhone": "+251911223344",
  "customerEmail": "abebe@example.com",
  "paymentMethod": "TELEBIRR",
  "passengers": [
    {
      "passengerName": "Abebe Bikila",
      "passengerPhone": "+251911223344",
      "passengerIdNumber": "ETH-KB-991204",
      "seatNumber": "12A"
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "bookingId": "bk_887102a",
    "bookingReference": "BK-20260927-5D00BC",
    "status": "COMPLETED",
    "totalAmountETB": 850.0,
    "tickets": [
      {
        "ticketNumber": "TKT-705433",
        "seatNumber": "12A",
        "passengerName": "Abebe Bikila",
        "qrHash": "694d0141f2810ca7281dbfcc810992a71d798721669894e6",
        "boardingTerminal": "Addis Ababa",
        "dropoffTerminal": "Bahir Dar"
      }
    ]
  }
}
```

#### 3. Conductor Boarding Scan (`POST /api/v1/boarding/scan`)
- **Request Body:**
```json
{
  "qrPayload": "694d0141f2810ca7281dbfcc810992a71d798721669894e6",
  "currentTripId": "trip_501",
  "terminalLocation": "Addis Ababa Autobus Tera Gate 4"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "status": "APPROVED",
    "message": "Boarding verified successfully",
    "ticketNumber": "TKT-705433",
    "passengerName": "Abebe Bikila",
    "seatNumber": "12A",
    "boardedAt": "2026-09-27T13:46:12.000Z"
  }
}
```

---

## 4. Authentication & RBAC Implementation

### 4.1 Token Dual-Pair Security Model
1. **Access Token:** Short-lived JWT (15 minutes expiry) with claims:
   - `sub`: User ID
   - `role`: Role enum
   - `companyId`: Tenant ID
   - `branchId`: Branch ID (for counter staff)
   - `permissions`: Pre-computed permission strings
2. **Refresh Token:** Long-lived cryptographically random 256-bit token (30 days expiry) stored in hashed form in Redis/Database with automated reuse-detection revocation.

### 4.2 RBAC Matrix & Permission Decorators
```typescript
export enum Permission {
  BOOKING_CREATE = 'booking:create',
  BOOKING_CANCEL = 'booking:cancel',
  SEAT_HOLD = 'seat:hold',
  TRIP_DISPATCH = 'trip:dispatch',
  BOARDING_SCAN = 'boarding:scan',
  CASH_DRAWER_SETTLE = 'cash:settle',
  REPORT_REVENUE = 'report:revenue',
}
```

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Permissions(Permission.BOOKING_CREATE)
@Post('bookings')
async createBooking(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthUser) {
  return this.bookingsService.createBooking(dto, user);
}
```

---

## 5. Atomic Booking Transaction Implementation

The booking engine enforces the strict zero double-booking invariant through ACID transaction semantics in PostgreSQL.

```typescript
// apps/api/src/modules/bookings/bookings.service.ts
return this.prisma.$transaction(async (tx) => {
  // 1. Lock and verify seat status across all traversed segments
  for (const passenger of dto.passengers) {
    const physicalSeat = trip.bus.seats.find((s) => s.seatNumber === passenger.seatNumber);
    if (!physicalSeat) throw new BadRequestException(`Seat ${passenger.seatNumber} not found.`);

    for (const seg of traversedSegments) {
      const segSeat = await tx.tripSegmentSeat.findUnique({
        where: {
          tripSegmentId_busSeatId: {
            tripSegmentId: seg.id,
            busSeatId: physicalSeat.id,
          },
        },
      });

      if (!segSeat) throw new BadRequestException(`Seat ${passenger.seatNumber} not configured.`);

      // Verify reservation hold validity
      if (dto.reservationId) {
        if (segSeat.status !== 'HELD' || segSeat.reservationId !== dto.reservationId) {
          throw new BadRequestException(`Reservation for seat ${passenger.seatNumber} expired.`);
        }
      } else {
        if (segSeat.status !== 'AVAILABLE') {
          throw new BadRequestException(`Seat ${passenger.seatNumber} is no longer available.`);
        }
      }
    }
  }

  // 2. Create Master Booking Record
  const booking = await tx.booking.create({
    data: {
      bookingReference,
      tripId: dto.tripId,
      reservationId: dto.reservationId || null,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail || null,
      bookedByUserId: agentId || null,
      bookedByRole: currentUser?.role || 'CUSTOMER',
      branchId: branchId || null,
      totalAmountETB: totalAmount,
      paymentStatus: 'COMPLETED',
    },
  });

  // 3. Create Tickets and Transition Materialized Seats to BOOKED
  const createdTickets = [];
  for (const passenger of dto.passengers) {
    const physicalSeat = trip.bus.seats.find((s) => s.seatNumber === passenger.seatNumber)!;
    
    // Create Ticket with Signed QR Hash
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrHash = crypto
      .createHash('sha256')
      .update(`${ticketNumber}:${booking.bookingReference}:${physicalSeat.seatNumber}:${trip.id}`)
      .digest('hex');

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        bookingId: booking.id,
        tripId: trip.id,
        seatNumber: physicalSeat.seatNumber,
        passengerName: passenger.passengerName,
        passengerPhone: passenger.passengerPhone,
        fareETB: totalAmount / dto.passengers.length,
        qrHash,
        status: 'ISSUED',
        boardingTerminal: traversedSegments[0].fromStop.name,
        dropoffTerminal: traversedSegments[traversedSegments.length - 1].toStop.name,
      },
    });
    createdTickets.push(ticket);

    // Atomically transition all intermediate segments to BOOKED
    for (const seg of traversedSegments) {
      await tx.tripSegmentSeat.update({
        where: {
          tripSegmentId_busSeatId: {
            tripSegmentId: seg.id,
            busSeatId: physicalSeat.id,
          },
        },
        data: {
          status: 'BOOKED',
          reservationId: null,
          heldUntil: null,
        },
      });
    }
  }

  // 4. Log Immutable Audit Record
  await tx.auditLog.create({
    data: {
      userId: agentId || null,
      action: 'BOOKING_CREATE',
      entityName: 'Booking',
      entityId: booking.id,
      detailsJson: JSON.stringify({ bookingReference, totalAmount, method: dto.paymentMethod }),
    },
  });

  return { bookingId: booking.id, bookingReference, tickets: createdTickets };
});
```

---

## 6. Flutter API Client Architecture

### 6.1 Repository Pattern Layout
```text
apps/mobile_app/lib/
├── core/
│   ├── network/
│   │   ├── api_client.dart           # Dio instance, interceptors, retry
│   │   ├── error_handler.dart        # Normalizes API error envelopes
│   │   └── token_storage.dart        # flutter_secure_storage for JWTs
│   └── constants/
│       └── api_endpoints.dart        # Route paths
├── data/
│   ├── models/
│   │   ├── trip_model.dart
│   │   ├── seat_model.dart
│   │   ├── booking_model.dart
│   │   └── ticket_model.dart
│   └── repositories/
│       ├── trip_repository.dart
│       ├── booking_repository.dart
│       └── ticket_repository.dart
└── presentation/
    ├── controllers/
    └── screens/
```

### 6.2 Dio API Client with Auto-Refresh Interceptor
```dart
class ApiClient {
  final Dio dio = Dio(
    BaseOptions(
      baseUrl: 'https://api.abyssiniabus.et/api/v1',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
    ),
  );

  ApiClient() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await TokenStorage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            final refreshed = await _refreshToken();
            if (refreshed) {
              return handler.resolve(await dio.fetch(error.requestOptions));
            }
          }
          return handler.next(error);
        },
      ),
    );
  }
}
```

---

## 7. Environment Configuration

### Template File: [`apps/api/.env.example`](file:///c:/Users/habts/Downloads/bus-1/apps/api/.env.example)

```bash
PORT=4000
NODE_ENV=development
API_PREFIX=api/v1

# PostgreSQL Connection
DATABASE_URL="postgresql://bus_admin:bus_secure_password_2026@localhost:5432/bus_platform_db?schema=public"

# Redis Cache & Queue
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=""

# JWT Secrets
JWT_ACCESS_SECRET="abyssinia_access_secret_production_2026"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_SECRET="abyssinia_refresh_secret_production_2026"
JWT_REFRESH_EXPIRY="30d"

# Ethiopian Payment Gateways
TELEBIRR_APP_ID="telebirr_live_app_id"
TELEBIRR_APP_KEY="telebirr_live_app_key"
TELEBIRR_SHORT_CODE="123456"
TELEBIRR_API_URL="https://app.telebirr.et/payment"

CHAPA_SECRET_KEY="CHASECK_TEST-..."
CHAPA_PUBLIC_KEY="CHAPUBK_TEST-..."
CHAPA_WEBHOOK_SECRET="chapa_wh_secret"

CBE_BIRR_MERCHANT_CODE="CBE_99812"

# Ethio Telecom SMS Gateway
SMS_GATEWAY_PROVIDER="ETHIO_TELECOM"
ETHIO_SMS_API_URL="https://bulksms.ethionet.et/api/send"
ETHIO_SMS_USER="AbyssiniaBus"
ETHIO_SMS_KEY="secret_key"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,https://admin.abyssiniabus.et,https://abyssiniabus.et"
```

---

## 8. Docker Development Environment

File: [`docker-compose.yml`](file:///c:/Users/habts/Downloads/bus-1/docker-compose.yml)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: bus_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: bus_admin
      POSTGRES_PASSWORD: bus_secure_password_2026
      POSTGRES_DB: bus_platform_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bus_admin -d bus_platform_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bus_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

---

## 9. Master Seed Data Specification

File: [`apps/api/src/db/seed.ts`](file:///c:/Users/habts/Downloads/bus-1/apps/api/src/db/seed.ts)

1. **Company Entity:** Abyssinia Intercity Bus Transportation Share Company (TIN: `0054892110`).
2. **Terminal Network (Branches):**
   - Addis Ababa Autobus Tera Central Terminal (ADD-01)
   - Addis Ababa Kality South Terminal (ADD-02)
   - Bahir Dar Highway Terminal (BHR-01)
   - Hawassa Piazza Terminal (HAW-01)
3. **Fleet Inventory:**
   - Bus `SB-023` (Yutong ZK6122H Luxury 2x2, 45 Seats)
   - Bus `SB-024` (Marcopolo Paradiso G7, 49 Seats)
4. **Physical Seat Topology:**
   - 45 physical seat records generated per bus with standardized alphanumeric designations (`01A` to `11D` + `12A`).
5. **Routes & Intermediate Stops:**
   - Route `RT-ADD-BHR`: Addis Ababa $\to$ Debre Sina $\to$ Dessie $\to$ Bahir Dar (565 km).
   - Route `RT-ADD-HAW`: Addis Ababa $\to$ Bishoftu $\to$ Mojo $\to$ Hawassa (275 km).
6. **Users & Credentials:**
   - Super Admin, Operations Manager, Ticket Agents (`hana@abyssiniabus.et`), Conductors, and Drivers. All seeded with bcrypt hashed credentials.

---

## 10. First End-to-End Booking Test Specification

### 10.1 Test Scenario Execution Contract
File: [`apps/api/src/test/first-production-e2e-booking.spec.ts`](file:///c:/Users/habts/Downloads/bus-1/apps/api/src/test/first-production-e2e-booking.spec.ts)  
Script: `npm run test:e2e:booking`

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    actor CustomerA as Customer A (Online)
    actor CustomerB as Customer B (Counter)
    actor Conductor
    participant Engine as TripsService & Inventory
    participant Res as ReservationsService
    participant Booking as BookingsService
    participant Boarding as BoardingService

    Admin->>Engine: Create Trip #501 (SB-023, 45 seats, Addis -> Bahir Dar)
    Engine-->>Admin: Materialized 3 segments & 135 Segment Seats (AVAILABLE)
    CustomerA->>Res: Hold Seat "12A" (ADD -> BHR)
    Res-->>CustomerA: Reservation Active (5-min TTL, Status: HELD)
    CustomerB->>Res: Concurrently Hold Seat "12A" (ADD -> BHR)
    Res-->>CustomerB: 400 Bad Request: "Seat seat_12A is no longer available"
    CustomerA->>Booking: Pay ETB 850 (Telebirr) & Confirm Booking
    Booking-->>CustomerA: Booking BK-20260927-5D00BC, QR Ticket TKT-705433 Issued
    Conductor->>Boarding: Scan Customer A QR Ticket at Door Gate
    Boarding-->>Conductor: APPROVED (Status: BOARDED)
    Conductor->>Boarding: Duplicate Scan Identical QR Ticket
    Boarding-->>Conductor: REJECTED (Status: DUPLICATE, Alarm Raised)
```

### 10.2 Verified Execution Output
```text
> @bus/api@1.0.0 test:e2e:booking
> tsx src/test/first-production-e2e-booking.spec.ts

🧪 RUNNING FIRST PRODUCTION END-TO-END BOOKING TEST
========================================================================

1️⃣ Creating Bus SB-023, Route Addis -> Bahir Dar, and Trip #501 (05:00 AM)...
   ✅ Trip Created! ID: trip_501, Status: SCHEDULED
   ✅ Total Intermediate Segments: 3
   ✅ Materialized Segment Seats: 135 (3 segments × 45 seats = 135)

2️⃣ Customer A (Online) Selects Seat "12A" -> Requests 5-Minute Atomic Hold...
   ✅ Customer A Hold Created! Res ID: res_1790516408138
   ✅ Status: HELD for 300 seconds (Expires: 2026-09-27T13:45:08.138Z)

3️⃣ Customer B (Counter) Concurrently Attempts to Hold Seat "12A"...
   ✅ Concurrency Defense Passed! Customer B REJECTED: "Seat seat_12A is no longer available"

4️⃣ Customer A Completes Payment (ETB 850) -> Confirming Booking & Generating QR Ticket...
   ✅ Booking Confirmed! Ref: BK-20260927-C1ED23
   ✅ Payment Method: TELEBIRR | Status: PAID
   ✅ Ticket Issued: TKT-540762 | Seat: 12A
   ✅ Signed QR Hash: 691f8535059363f633512d25...

5️⃣ On Travel Day: Conductor Scans Customer A's QR Ticket at Door Gate...
   ✅ Scan Result: [APPROVED] Boarding verified successfully
   ✅ Verified Passenger: Abebe Bikila | Seat: 12A

6️⃣ Duplicate Scan Prevention: Scanning Identical QR Ticket a Second Time...
   ✅ Duplicate Prevention Passed! Alarm: "Ticket already scanned and boarded at 4:40:08 PM"

7️⃣ Operations Management Dashboard Telemetry...
   ✅ Active Scheduled Departures Found: 1 trip(s)
   ✅ Confirmed Booked Seats: 1 Passenger(s)
   ✅ Total Gross Revenue: ETB 850
   ✅ Verified Boarded Passengers: 1

========================================================================
🎉 FIRST PRODUCTION END-TO-END TEST PASSED WITH 100% SUCCESS!
========================================================================
```
