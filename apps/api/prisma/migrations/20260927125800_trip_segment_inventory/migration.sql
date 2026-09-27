-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('TERMINAL', 'STATION', 'CHECKPOINT', 'REST_STOP');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "legalNameAm" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "tinNumber" TEXT NOT NULL,
    "commercialRegNo" TEXT NOT NULL,
    "headquartersAddress" TEXT NOT NULL,
    "headquartersPhone" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "terminalArea" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "managerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "branchId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "sideNumber" TEXT NOT NULL,
    "busModel" TEXT NOT NULL,
    "busType" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL DEFAULT 45,
    "amenities" TEXT NOT NULL DEFAULT 'AC,WiFi,Reclining Seats,Charging Ports',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "columnLetter" TEXT NOT NULL,
    "isWindow" BOOLEAN NOT NULL DEFAULT false,
    "isAisle" BOOLEAN NOT NULL DEFAULT false,
    "isBackRow" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "type" "StopType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "originStopId" TEXT NOT NULL,
    "destinationStopId" TEXT NOT NULL,
    "routeCode" TEXT NOT NULL,
    "distanceKm" DECIMAL(10,2),
    "estimatedDurationMin" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "distanceKm" DECIMAL(10,2),
    "durationMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "daysOfWeek" TEXT NOT NULL DEFAULT 'DAILY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "busId" TEXT NOT NULL,
    "driverId" TEXT,
    "tripDate" TIMESTAMP(3) NOT NULL,
    "scheduledDeparture" TIMESTAMP(3) NOT NULL,
    "scheduledArrival" TIMESTAMP(3),
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "delayReason" TEXT,
    "delayMinutes" INTEGER DEFAULT 0,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "currentSpeedKmH" DOUBLE PRECISION,
    "currentMilestone" TEXT,
    "lastGpsPingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSegment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "fromStopId" TEXT NOT NULL,
    "toStopId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "scheduledDeparture" TIMESTAMP(3),
    "scheduledArrival" TIMESTAMP(3),

    CONSTRAINT "TripSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSegmentSeat" (
    "id" TEXT NOT NULL,
    "tripSegmentId" TEXT NOT NULL,
    "busSeatId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "reservationId" TEXT,
    "heldUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripSegmentSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "passengerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "reservationId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "bookedByUserId" TEXT,
    "bookedByRole" TEXT NOT NULL DEFAULT 'PASSENGER',
    "branchId" TEXT,
    "totalAmountETB" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSegment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tripSegmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingPassenger" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "passengerId" TEXT,
    "seatNumber" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "passengerPhone" TEXT NOT NULL,
    "passengerIdNumber" TEXT NOT NULL,

    CONSTRAINT "BookingPassenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationalIdNumber" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amountETB" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionReference" TEXT,
    "cashTenderedETB" DOUBLE PRECISION,
    "changeReturnedETB" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingPassengerId" TEXT,
    "tripId" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "passengerPhone" TEXT NOT NULL,
    "passengerIdNumber" TEXT NOT NULL,
    "fareETB" DOUBLE PRECISION NOT NULL,
    "qrHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "boardedAt" TIMESTAMP(3),
    "boardingTerminal" TEXT,
    "dropoffTerminal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boarding" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "conductorId" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminalLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',

    CONSTRAINT "Boarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SMS',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "providerResponse" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT,
    "detailsJson" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatLock" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "lockedBySession" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashShift" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingCashETB" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashSalesETB" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ticketsCount" INTEGER NOT NULL DEFAULT 0,
    "cancelledTicketsCount" INTEGER NOT NULL DEFAULT 0,
    "refundsETB" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,

    CONSTRAINT "CashShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "reportedByDriverId" TEXT,
    "driverName" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_tinNumber_key" ON "Company"("tinNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_plateNumber_key" ON "Bus"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_sideNumber_key" ON "Bus"("sideNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_busId_seatNumber_key" ON "Seat"("busId", "seatNumber");

-- CreateIndex
CREATE INDEX "Stop_companyId_idx" ON "Stop"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Stop_companyId_code_key" ON "Stop"("companyId", "code");

-- CreateIndex
CREATE INDEX "Route_companyId_idx" ON "Route"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_companyId_routeCode_key" ON "Route"("companyId", "routeCode");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_idx" ON "RouteStop"("routeId");

-- CreateIndex
CREATE INDEX "RouteStop_stopId_idx" ON "RouteStop"("stopId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_sequenceNumber_key" ON "RouteStop"("routeId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "Schedule_routeId_idx" ON "Schedule"("routeId");

-- CreateIndex
CREATE INDEX "Trip_companyId_idx" ON "Trip"("companyId");

-- CreateIndex
CREATE INDEX "Trip_routeId_idx" ON "Trip"("routeId");

-- CreateIndex
CREATE INDEX "Trip_busId_idx" ON "Trip"("busId");

-- CreateIndex
CREATE INDEX "TripSegment_tripId_idx" ON "TripSegment"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripSegment_tripId_sequenceNumber_key" ON "TripSegment"("tripId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "TripSegmentSeat_tripSegmentId_idx" ON "TripSegmentSeat"("tripSegmentId");

-- CreateIndex
CREATE INDEX "TripSegmentSeat_busSeatId_idx" ON "TripSegmentSeat"("busSeatId");

-- CreateIndex
CREATE UNIQUE INDEX "TripSegmentSeat_tripSegmentId_busSeatId_key" ON "TripSegmentSeat"("tripSegmentId", "busSeatId");

-- CreateIndex
CREATE INDEX "Reservation_tripId_idx" ON "Reservation"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");

-- CreateIndex
CREATE INDEX "Booking_tripId_idx" ON "Booking"("tripId");

-- CreateIndex
CREATE INDEX "BookingSegment_bookingId_idx" ON "BookingSegment"("bookingId");

-- CreateIndex
CREATE INDEX "BookingSegment_tripSegmentId_idx" ON "BookingSegment"("tripSegmentId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSegment_bookingId_tripSegmentId_key" ON "BookingSegment"("bookingId", "tripSegmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_phone_key" ON "Passenger"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_bookingPassengerId_key" ON "Ticket"("bookingPassengerId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrHash_key" ON "Ticket"("qrHash");

-- CreateIndex
CREATE UNIQUE INDEX "SeatLock_tripId_seatNumber_key" ON "SeatLock"("tripId", "seatNumber");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_originStopId_fkey" FOREIGN KEY ("originStopId") REFERENCES "Stop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_destinationStopId_fkey" FOREIGN KEY ("destinationStopId") REFERENCES "Stop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegment" ADD CONSTRAINT "TripSegment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegment" ADD CONSTRAINT "TripSegment_fromStopId_fkey" FOREIGN KEY ("fromStopId") REFERENCES "Stop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegment" ADD CONSTRAINT "TripSegment_toStopId_fkey" FOREIGN KEY ("toStopId") REFERENCES "Stop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegmentSeat" ADD CONSTRAINT "TripSegmentSeat_tripSegmentId_fkey" FOREIGN KEY ("tripSegmentId") REFERENCES "TripSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegmentSeat" ADD CONSTRAINT "TripSegmentSeat_busSeatId_fkey" FOREIGN KEY ("busSeatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegmentSeat" ADD CONSTRAINT "TripSegmentSeat_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedByUserId_fkey" FOREIGN KEY ("bookedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSegment" ADD CONSTRAINT "BookingSegment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSegment" ADD CONSTRAINT "BookingSegment_tripSegmentId_fkey" FOREIGN KEY ("tripSegmentId") REFERENCES "TripSegment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPassenger" ADD CONSTRAINT "BookingPassenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPassenger" ADD CONSTRAINT "BookingPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookingPassengerId_fkey" FOREIGN KEY ("bookingPassengerId") REFERENCES "BookingPassenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boarding" ADD CONSTRAINT "Boarding_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boarding" ADD CONSTRAINT "Boarding_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boarding" ADD CONSTRAINT "Boarding_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatLock" ADD CONSTRAINT "SeatLock_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashShift" ADD CONSTRAINT "CashShift_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashShift" ADD CONSTRAINT "CashShift_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

