# Abyssinia Bus S.C. — Complete System Architecture & Codebase Structure
**Document Version:** 1.0.0  
**Status:** Approved Master Technical Architecture  
**Target Environment:** Production Multi-Tier Monorepo  
**Primary Stack:** NestJS 10, TypeScript 5.6, PostgreSQL 16, Redis 7, Prisma 5.22, Flutter 3.24, Next.js 14, Docker

---

## Table of Contents
1. [Monorepo & Codebase Directory Structure](#1-monorepo--codebase-directory-structure)
2. [NestJS Backend Architecture (`apps/api`)](#2-nestjs-backend-architecture-appsapi)
3. [PostgreSQL 16, Prisma ORM & Database Sizing](#3-postgresql-16-prisma-orm--database-sizing)
4. [Redis 7 Distributed Mutex & Background Queue Engine](#4-redis-7-distributed-mutex--background-queue-engine)
5. [Flutter Mobile Architecture (Clean Architecture + Riverpod)](#5-flutter-mobile-architecture-clean-architecture--riverpod)
6. [Staff Web & Counter POS Architecture (`apps/web`)](#6-staff-web--counter-pos-architecture-appsweb)
7. [Real-Time WebSocket & GPS Telemetry Stream](#7-real-time-websocket--gps-telemetry-stream)
8. [External Integrations Architecture (Payments, SMS, Maps)](#8-external-integrations-architecture)
9. [DevOps, Docker Containerization & Production Deployment](#9-devops-docker-containerization--production-deployment)
10. [Observability, Security & Production Hardening](#10-observability-security--production-hardening)
11. [Master Implementation Roadmap: From Blueprint to Execution](#11-master-implementation-roadmap-from-blueprint-to-execution)

---

# 1. Monorepo & Codebase Directory Structure

The platform is organized as an enterprise monorepo using npm workspaces / Turborepo. This guarantees strict type sharing between the backend API and frontend clients while maintaining clear boundary isolation.

```text
bus-platform/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Automated lint, build, test & typecheck
│       └── deploy.yml                 # Staging & Production container deployment
├── apps/
│   ├── api/                           # NestJS 10 REST API & WebSocket Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Authoritative PostgreSQL schema
│   │   │   └── migrations/            # Version-controlled SQL migration scripts
│   │   ├── src/
│   │   │   ├── common/                # Shared guards, decorators, interceptors, filters
│   │   │   ├── modules/               # Domain-driven NestJS modules
│   │   │   ├── app.module.ts          # Root module orchestration
│   │   │   └── main.ts                # Application entrypoint & global middleware
│   │   ├── test/                      # End-to-end integration test suites
│   │   ├── Dockerfile                 # Multi-stage production container build
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                           # Next.js 14 / React 18 Staff Portal & POS
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages (POS, Dispatch, Fleet, Finance)
│   │   │   ├── components/            # Reusable UI components & design system
│   │   │   ├── hooks/                 # React custom hooks (useKeyboard, useThermalPrinter)
│   │   │   ├── lib/                   # API clients, auth helpers, ESC/POS generator
│   │   │   └── styles/                # Tailwind CSS / Vanilla CSS tokens
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── passenger-mobile/              # Flutter 3.24 iOS & Android Passenger App
│   │   ├── android/
│   │   ├── ios/
│   │   ├── lib/
│   │   │   ├── core/                  # Network, storage, theme, localization
│   │   │   ├── features/              # Feature-first modules (search, booking, ticket)
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   │
│   └── driver-mobile/                 # Flutter 3.24 Rugged Android Conductor/Driver App
│       ├── android/
│       ├── lib/
│       │   ├── core/                  # Hardware camera scanner, GPS tracker
│       │   ├── features/              # Manifest, boarding scan, incident reporting
│       │   └── main.dart
│       └── pubspec.yaml
│
├── packages/
│   ├── shared/                        # Shared TypeScript libraries
│   │   ├── src/
│   │   │   ├── types.ts               # Shared DTO interfaces, enum definitions
│   │   │   ├── seat-engine.ts         # Pure algorithmic seat calculations
│   │   │   └── constants.ts           # Business rules, regex patterns, currency codes
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                            # Shared Web Design System (Tailwind tokens)
│   └── config/                        # Shared ESLint, Prettier & TypeScript configs
│
├── docs/                              # Master Engineering Specifications & Blueprints
│   ├── COMPLETE_SYSTEM_BLUEPRINT_V1.md
│   ├── COMPLETE_SCREEN_MAP_SPECIFICATION.md
│   ├── COMPLETE_DATABASE_ERD_SPECIFICATION.md
│   ├── COMPLETE_API_SPECIFICATION.md
│   └── COMPLETE_SYSTEM_ARCHITECTURE_AND_CODEBASE_STRUCTURE.md
│
├── docker-compose.yml                 # Local dev orchestration (PostgreSQL 16 + Redis 7)
├── package.json                       # Root workspace definitions
└── turbo.json                         # Turborepo build caching pipeline
```

---

# 2. NestJS Backend Architecture (`apps/api`)

The backend is built with **NestJS 10** on **Node.js 20 LTS** using TypeScript in strict mode. It follows a Clean Layered Architecture:

```text
HTTP / WebSocket Request
           │
           ▼
┌────────────────────────────────────────────────────────┐
│                      COMMON LAYER                      │
│  • Global Exception Filter (HttpExceptionFilter)       │
│  • Logging & Timing Interceptor (LoggingInterceptor)   │
│  • Idempotency Interceptor (IdempotencyInterceptor)    │
│  • Validation Pipe (ValidationPipe with class-valid)   │
│  • JWT Auth Guard & RBAC Roles Guard (@Roles)          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                     │
│  • Validates DTO Schema                                │
│  • Extracts Authenticated User / Session Claims        │
│  • Delegates to Domain Services                        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                       │
│  • Core Business Logic & Invariant Enforcement         │
│  • Atomic Distributed Mutex (Redis)                    │
│  • Event Emitters & Async Worker Dispatch              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                    │
│  • PrismaService (Prisma Client with PgBouncer)        │
│  • Serialized PostgreSQL Transactions (prisma.$trans)  │
│  • Query Optimization & Connection Pool Management     │
└────────────────────────────────────────────────────────┘
```

### Module Breakdown & Domain Organization

```text
src/
├── common/
│   ├── database/                      # PrismaService & DatabaseModule
│   ├── decorators/                    # @Roles(), @CurrentUser(), @Idempotent()
│   ├── filters/                       # GlobalHttpExceptionFilter
│   ├── guards/                        # JwtAuthGuard, RolesGuard, BranchIsolationGuard
│   ├── interceptors/                  # TransformResponseInterceptor, LoggingInterceptor
│   └── pipes/                         # ParseDatePipe, ParseCuidPipe
│
├── modules/
│   ├── auth/                          # Login, OTP generation, JWT token rotation
│   ├── trips/                         # Trip generation, multi-hop search, schedule engine
│   ├── reservations/                  # 300-second atomic seat hold & expiration cron
│   ├── bookings/                      # Omnichannel booking creation, cancel, reschedule
│   ├── payments/                      # Cash tender, Telebirr/CBE/Chapa webhooks
│   ├── tickets/                       # Cryptographic HMAC-SHA256 QR passes, PDF stream
│   ├── boarding/                      # Sub-100ms QR scanner, duplicate alarm, manifest
│   ├── shifts/                        # Agent cash drawer shift opening, tally, settlement
│   ├── agent/                         # Counter POS optimized APIs & branch reports
│   ├── dispatch/                      # Terminal departure board, bus/driver Gantt, clearance
│   ├── driver/                        # Duty dashboard, pre-trip inspection, trip HUD
│   ├── tracking/                      # 60s GPS ingestion, Redis Pub/Sub, WebSocket gateway
│   ├── fleet/                         # Bus registry, preventative service, tires, work orders
│   ├── finance/                       # Daily settlement audit, gateway reconciliation
│   ├── notifications/                 # Ethio Telecom bulk SMS, push notification worker
│   └── support/                       # 360° booking lookup, complaints, lost property
│
├── config/                            # Environment variable validation (Joi schema)
├── app.module.ts
└── main.ts
```

---

# 3. PostgreSQL 16, Prisma ORM & Database Sizing

PostgreSQL 16 Enterprise serves as the authoritative single source of truth for all transactions.

### Database Connection Pool Architecture

```text
                     INCOMING API REQUESTS (100+ Pods / Workers)
                                         │
                                         ▼
                     PgBouncer Connection Pooler (Transaction Mode)
                             Pool Size: 100 Connections
                                         │
                                         ▼
                             PostgreSQL 16 Master DB
                      Max Connections: 150 | Work Mem: 64MB
```

### Critical Prisma Service Configuration
`apps/api/src/common/database/prisma.service.ts`:
- Connection lifecycle hooks (`$connect`, `$disconnect`).
- Query logging in development; error and slow query alerting in production ($>250\text{ms}$).
- Soft delete middleware for audit preservation.

---

# 4. Redis 7 Distributed Mutex & Background Queue Engine

Redis 7 serves three distinct architectural functions:

```text
                                    REDIS 7 CLUSTER
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
[ 1. DISTRIBUTED MUTEX ]          [ 2. REAL-TIME PUB/SUB ]          [ 3. BULLMQ WORKERS ]
Key: "lock:trip_501:12A"          Channel: "trip:501:gps"           Queue: "sms-notifications"
TTL: 10 Seconds                   Subscribers: WebSockets           Queue: "pdf-ticket-generator"
Prevents race conditions          Broadcasting live bus location    Queue: "hold-expiration-sweeper"
```

### Atomic Mutex Implementation Pattern
```typescript
async function acquireSeatLock(redis: Redis, tripId: string, seatNumber: string): Promise<string | null> {
  const lockKey = `lock:seat:${tripId}:${seatNumber}`;
  const lockToken = crypto.randomUUID();
  // SET lockKey lockToken NX PX 10000 (atomic acquire with 10s TTL)
  const acquired = await redis.set(lockKey, lockToken, 'PX', 10000, 'NX');
  return acquired === 'OK' ? lockToken : null;
}
```

---

# 5. Flutter Mobile Architecture (Clean Architecture + Riverpod)

Both the **Passenger App** and **Driver/Conductor App** are engineered using Flutter 3.24 (Dart 3.5) with a Feature-First Clean Architecture pattern.

```text
lib/
├── core/
│   ├── network/                       # Dio HTTP client, AuthInterceptor, RetryInterceptor
│   ├── storage/                       # FlutterSecureStorage (Tokens), Hive (Offline Tickets)
│   ├── theme/                         # Brand color palettes, typography, responsive sizing
│   ├── localization/                  # Amharic, English, Afaan Oromoo, Tigrinya arb files
│   └── errors/                        # Failure classes, AppException, ErrorMapper
│
├── features/
│   ├── auth/                          # Presentation (Screens, Widgets), Domain, Data
│   ├── search/                        # Trip search form, terminal auto-complete
│   ├── seat_map/                      # Interactive SVG/Canvas bus layout, 5-min timer
│   ├── booking/                       # Passenger info form, checkout flow
│   ├── payments/                      # Telebirr SDK bridge, CBE Birr deep link
│   ├── tickets/                       # QR code rendering, offline wallet caching
│   ├── tracking/                      # Live Mapbox radar, GPS milestone updates
│   └── boarding_scanner/              # Mobile camera barcode scanner (Conductor app)
│
├── models/                            # Freezed immutable data transfer models
└── main.dart
```

### State Management with Riverpod 2.0
- AsyncNotifier providers manage network state and automatic caching.
- Reactive UI updates when seat selection or hold timer mutations occur.
- Full offline resilience: Cached E-Tickets stored in Hive encrypted boxes, accessible at zero-connectivity highway checkpoints.

---

# 6. Staff Web & Counter POS Architecture (`apps/web`)

The Staff Web portal is built using **Next.js 14** (App Router) with React 18 and Tailwind CSS.

### Thermal Receipt Hardware Abstraction Engine
Counter ticket agents require instantaneous receipt printing via connected 58mm or 80mm USB thermal receipt printers.

```text
Next.js POS App
      │
      ▼
useThermalPrinter() Hook
      │
      ├─────► WebUSB / WebSerial API (Direct raw ESC/POS binary stream)
      │
      └─────► Local Native Print Daemon (Fallback for older Windows terminals)
```

### Keyboard-First Architecture
The POS application implements global keyboard listeners (`F1` to `F12`, `Tab`, `Enter`, `Numpad`) allowing an experienced agent to search, select a seat, input cash tendered, calculate change, and print a thermal ticket in **under 20 seconds** without touching a mouse.

---

# 7. Real-Time WebSocket & GPS Telemetry Stream

```text
In-Vehicle Driver App / GPS Hardware
               │
               │ POST /api/v1/trips/:id/gps (Every 60s)
               ▼
       NestJS API Gateway
               │
               ▼
     Redis Pub/Sub Channel ("gps:telemetry")
               │
               ▼
    NestJS WebSocket Gateway (Socket.IO)
               │
               ├───────────────────────────────┐
               ▼                               ▼
    Passenger Mobile App             Dispatcher Operations Map
 (Live Moving Bus Radar on Map)     (Real-Time Fleet Status HUD)
```

---

# 8. External Integrations Architecture

Integrations with third-party Ethiopian services follow the **Adapter / Strategy Pattern**, ensuring the core business logic remains completely decoupled from external vendor API changes.

```text
                        ┌─────────────────────────────────────┐
                        │        IPaymentGatewayAdapter       │
                        │  + initiatePayment()                │
                        │  + verifyWebhook()                  │
                        │  + processRefund()                  │
                        └──────────────────┬──────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│ TelebirrAdapter  │              │  CbeBirrAdapter  │              │   ChapaAdapter   │
│ • USSD Push API  │              │ • Direct API     │              │ • Card / Banks   │
│ • RSA Signature  │              │ • Merchant ID    │              │ • HMAC Webhook   │
└──────────────────┘              └──────────────────┘              └──────────────────┘
```

---

# 9. DevOps, Docker Containerization & Production Deployment

### Multi-Stage Containerization (`apps/api/Dockerfile`)
```dockerfile
# 1. Base Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npm run build -w apps/api

# 2. Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
```

### Production Deployment Topology
```text
                          INTERNET / CLIENTS
                                  │
                                  ▼
                 Cloudflare CDN & DDoS Protection
                                  │
                                  ▼
                       Nginx / AWS ALB Ingress
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
[ NestJS API Pods ]                              [ Next.js Web Pods ]
(Auto-scaling 2 to 10 instances)                 (Auto-scaling 2 to 6 instances)
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  ▼
                Managed PostgreSQL 16 (AWS RDS / GCP Cloud SQL)
                     + Managed Redis 7 Cluster (ElastiCache)
```

---

# 10. Observability, Security & Production Hardening

1. **Structured JSON Logging:** Pino logger outputting structured JSON with `traceId`, `userId`, `durationMs`, and `path`.
2. **APM & Error Monitoring:** Sentry SDK integrated across NestJS backend, Next.js web portal, and Flutter mobile apps.
3. **OWASP Security Controls:**
   - Helmet.js headers enabled.
   - Strict CORS policy restricting requests to registered company domain origins.
   - Global rate limiter: 100 requests per minute per IP, with tighter limits (10 req/min) on auth and payment endpoints.
4. **Data Protection:** Database disks encrypted at rest via AES-256 (AWS KMS); TLS 1.3 enforced for all transport traffic.

---

# 11. Master Implementation Roadmap: From Blueprint to Execution

With the complete specifications approved, the physical implementation proceeds in **10 systematic milestones**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   10-STEP IMPLEMENTATION SEQUENCE                      │
├──────┬──────────────────────────────────────────┬──────────────────────┤
│ Step │ Milestone Description                    │ Primary Artifacts    │
├──────┼──────────────────────────────────────────┼──────────────────────┤
│ 01   │ Monorepo Scaffold & Shared Library       │ packages/shared/     │
│ 02   │ PostgreSQL 16 Schema & Prisma Migration  │ apps/api/prisma/     │
│ 03   │ NestJS Core Framework, Auth & RBAC       │ src/modules/auth/    │
│ 04   │ Trip, Segment & Seat Inventory Engine    │ src/modules/trips/   │
│ 05   │ 5-Minute Atomic Hold & Expiration Worker │ src/modules/reserv/  │
│ 06   │ Omnichannel Booking & Cryptographic QR   │ src/modules/bookings/│
│ 07   │ Agent POS Counter & Shift Reconciliation │ apps/web/pos/        │
│ 08   │ Conductor Boarding Scanner (Flutter)     │ apps/driver-mobile/  │
│ 09   │ Operations & Dispatch Center             │ src/modules/dispatch/│
│ 10   │ Passenger Mobile Experience & Payments   │ apps/passenger-app/  │
└──────┴──────────────────────────────────────────┴──────────────────────┘
```

---

### Phase Sign-Off & Ready State
The entire product blueprint, screen navigation map, database ERD, API specification, and technical architecture are now 100% defined and committed. We are ready to transition from **Architectural Planning** to **Live Codebase Execution**.
