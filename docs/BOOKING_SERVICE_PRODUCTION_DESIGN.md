# Booking Service — Production Design & Implementation Specification

## Abyssinia Bus S.C. Intercity Transportation Platform

The **Booking Service** is the central transaction engine that converts temporary seat holds into paid reservations, executes dynamic pricing calculations, integrates asynchronous payment gateways, processes idempotent webhooks, issues cryptographically secured tickets, and handles cancellations and rescheduling without data loss.

---

## 1. Core End-to-End Transaction Flow

```text
                  PASSENGER / COUNTER AGENT
                             │
                             ▼
                 1. ATOMIC SEAT HOLD (5 min)
                 POST /api/v1/reservations
                             │
                             ▼
              2. CREATE BOOKING REQUEST
              POST /api/v1/bookings
              { reservationId, passengers: [...] }
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       VALIDATE INVENTORY            CALCULATE FARE
   • Reservation active?             (PricingService)
   • Not expired? (TTL < now)        • Segment count hop ratio
   • Passenger count == seats?       • Bus luxury tier multiplier
   • Seats match reservation?        • Volume / promo discounts
   • Client cannot override price    • Transparent zero hidden fees
              │                             │
              └──────────────┬──────────────┘
                             ▼
       3. ATOMIC DATABASE TRANSACTION (Prisma)
       ┌──────────────────────────────────────────────┐
       │ • Generate BK-YYYYMMDD-XXXXXX reference       │
       │ • Create Master Booking (PAYMENT_PENDING)    │
       │ • Upsert Passenger registry & Passengers     │
       │ • Link Booking to traversed TripSegments     │
       │ • Transition TripSegmentSeats to             │
       │   PAYMENT_PENDING (Held for Booking)         │
       │ • Convert Reservation status to CONVERTED    │
       │ • Create Payment record (PENDING)            │
       │ • Log Audit Trail                            │
       └──────────────────────┬───────────────────────┘
                             │
                             ▼
       4. EXTERNAL PAYMENT GATEWAY INITIATION
          (Executes OUTSIDE Database Transaction)
       ┌──────────────────────────────────────────────┐
       │ • Call PaymentProvider.initiatePayment()     │
       │ • Providers: Telebirr, Chapa, Cash, CBE     │
       │ • Returns checkoutUrl & payment reference    │
       │ • DB locks released immediately (No stalls)  │
       └──────────────────────┬───────────────────────┘
                             │
                             ▼
              5. PASSENGER EXECUTES PAYMENT
              (Telebirr USSD / SuperApp / Web Checkout)
                             │
                             ▼
              6. WEBHOOK / CONFIRMATION
              POST /api/v1/payments/webhook
       ┌──────────────────────────────────────────────┐
       │ • Verify cryptographic webhook signature     │
       │ • Idempotency Check: lookup PaymentEvent     │
       │   (Duplicate events acknowledged safely)     │
       │ • Record immutable PaymentEvent in database  │
       │ • Atomically confirm payment and booking:    │
       │   - Payment -> COMPLETED                     │
       │   - Booking -> COMPLETED                     │
       │   - TripSegmentSeats -> BOOKED               │
       │   - Issue Ticket(s) with QR Token & Hash     │
       └──────────────────────┬───────────────────────┘
                             │
                             ▼
                 7. PASSENGER BOARDING
                 POST /api/v1/boarding/scan
       ┌──────────────────────────────────────────────┐
       │ • Conductor scans QR Token / Hash at door    │
       │ • Constant-time HMAC lookup                  │
       │ • Verified -> APPROVED                      │
       │ • Duplicate scan attempt -> REJECTED         │
       └──────────────────────────────────────────────┘
```

---

## 2. API Contracts

### A. Create Booking

```http
POST /api/v1/bookings
Content-Type: application/json
```

#### Request Payload (Online Passenger App Flow)

```json
{
  "reservationId": "res_1790518570877",
  "passengers": [
    {
      "seatId": "seat_12A",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+251911223344",
      "email": "john@example.com"
    }
  ],
  "channel": "PASSENGER_APP",
  "paymentMethod": "TELEBIRR"
}
```

> **Security Guarantee**: The `reservationId` determines the `tripId`, `fromStopId`, `toStopId`, and the exact physical seats held. The client is not allowed to override the inventory relationship or determine the fare price.

#### Response Payload

```json
{
  "bookingId": "bk_1790518570879",
  "bookingReference": "BK-20260927-BB8346",
  "status": "PAYMENT_PENDING",
  "channel": "PASSENGER_APP",
  "subtotalETB": 570,
  "discountETB": 0,
  "feesETB": 0,
  "totalAmountETB": 570,
  "currency": "ETB",
  "payment": {
    "paymentId": "pay_1790518570879",
    "paymentReference": "PAY-20260927-669145",
    "status": "PENDING",
    "checkoutUrl": "https://app.telebirr.et/pay?ref=TB-1790518570879-98113C&amount=570",
    "provider": "TELEBIRR",
    "amount": 570
  },
  "tickets": []
}
```

---

### B. Payment Webhook

```http
POST /api/v1/payments/webhook
Content-Type: application/json
```

#### Request Payload

```json
{
  "transactionId": "TX_TB_9981245",
  "paymentReference": "PAY-20260927-669145",
  "status": "SUCCESS",
  "amount": 570,
  "currency": "ETB"
}
```

#### Webhook Idempotency Processing

Before executing confirmation, the system checks the `PaymentEvent` table:

```ts
const existingEvent = await this.prisma.paymentEvent.findFirst({
  where: { providerReference: String(txId || paymentRef) },
});

if (existingEvent) {
  return { success: true, message: 'Event already processed' };
}
```

This guarantees that multiple webhook retries from the telecom provider never result in double booking, duplicate tickets, or incorrect financial balances.

---

## 3. Cryptographic Ticket QR Architecture

To prevent ticket fraud and predictable URL scanning:

1. **High-Entropy Token**: A random 128-bit hex string is generated (`ABY-3FEC3D025C4F34672F5EC95112EE2463`).
2. **Cryptographic SHA-256 Digest**: The token is hashed with trip and booking metadata to generate `qrHash`.
3. **Scan Lookup**: The door scanner searches against both direct token and hash matching:

```ts
const raw = dto.qrPayload.trim();
const rawHash = crypto.createHash('sha256').update(raw).digest('hex');

const ticket = await this.prisma.ticket.findFirst({
  where: {
    OR: [
      { qrHash: raw },
      { qrHash: rawHash },
      { qrToken: raw },
      { ticketNumber: raw },
    ],
  },
});
```

---

## 4. Cancellation & Rescheduling Workflows

### Cancellation

```http
POST /api/v1/bookings/:id/cancel
```

1. Calculates refund based on company cancellation policy (default: 10% fee, 90% refund).
2. Sets `Ticket.status = CANCELLED`.
3. Sets `Booking.paymentStatus = REFUNDED`.
4. Atomically releases all traversed `TripSegmentSeat` records back to `AVAILABLE`.
5. Updates agent cash drawer shift if cash refund is disbursed.
6. Records immutable audit log.

### Rescheduling

```http
POST /api/v1/bookings/:id/reschedule
```

1. Verifies new trip and seat availability across all segments.
2. Atomically releases old seat.
3. Books new seat on target trip.
4. Generates a new cryptographic QR hash linked to the new trip and seat.
5. Updates booking reference and records audit trail.
