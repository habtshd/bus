export type UserRole =
  | 'SUPER_ADMIN'
  | 'MANAGEMENT'
  | 'FINANCE'
  | 'BRANCH_MANAGER'
  | 'TICKET_AGENT'
  | 'DISPATCHER'
  | 'CONDUCTOR'
  | 'DRIVER'
  | 'FLEET_MANAGER'
  | 'CUSTOMER_SUPPORT'
  | 'PASSENGER';

export type BusType = 'LUXURY_2X2' | 'STANDARD_2X3' | 'VIP_FIRST_CLASS_1X2';

export type BusStatus = 'ACTIVE' | 'MAINTENANCE' | 'STANDBY' | 'OUT_OF_SERVICE';

export type TripStatus =
  | 'SCHEDULED'
  | 'BOARDING'
  | 'DEPARTED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'CANCELLED'
  | 'DELAYED';

export type SeatStatus =
  | 'AVAILABLE'
  | 'HELD'      // Temporarily locked with 10-min TTL
  | 'PAID'      // Confirmed ticket purchase
  | 'BOARDED'   // Conductor checked-in at bus entrance
  | 'SELECTED'  // Active click in user session
  | 'LOCKED'    // Synonym for HELD
  | 'BOOKED'    // Synonym for PAID
  | 'BLOCKED';  // Mechanical/administrative block

export type PaymentMethod =
  | 'CASH'
  | 'TELEBIRR'
  | 'CBE_BIRR'
  | 'AWASH_BIRR'
  | 'CHAPA_GATEWAY';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type TicketStatus = 'ISSUED' | 'BOARDED' | 'NO_SHOW' | 'CANCELLED';

export interface Station {
  id: string;
  nameEn: string;
  nameAm: string; // Amharic name e.g. አዲስ አበባ (አውቶቡስ ተራ)
  city: string;
  terminalArea: string;
  latitude?: number;
  longitude?: number;
}

export interface Route {
  id: string;
  originStationId: string;
  originStation?: Station;
  destinationStationId: string;
  destinationStation?: Station;
  distanceKm: number;
  estimatedDurationHours: number;
  baseFareETB: number;
  active: boolean;
}

export interface Bus {
  id: string;
  plateNumber: string; // e.g. 3-45678 ET
  sideNumber: string;  // e.g. BUS-101
  busModel: string;    // e.g. Zhongtong Navigator / Golden Dragon
  busType: BusType;
  totalSeats: number;
  status: BusStatus;
  amenities: string[]; // e.g. ['AC', 'WiFi', 'Charging Ports', 'Water']
}

export interface Seat {
  id: string;
  seatNumber: string; // e.g. "1A", "1B", "12E"
  row: number;
  column: number;
  columnLetter: string;
  isAisle: boolean;
  isWindow: boolean;
  isBackRow: boolean;
  status: SeatStatus;
  priceETB: number;
  passengerName?: string;
  passengerPhone?: string;
}

export interface Trip {
  id: string;
  tripCode: string; // e.g. ETB-2026-AA-HW-01
  routeId: string;
  route?: Route;
  busId: string;
  bus?: Bus;
  driverName: string;
  driverPhone: string;
  conductorName: string;
  conductorPhone: string;
  departureTime: string; // ISO string
  estimatedArrivalTime: string; // ISO string
  fareETB: number;
  status: TripStatus;
  totalSeats: number;
  availableSeatsCount: number;
  bookedSeatsCount: number;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. TKT-892401
  bookingId: string;
  tripId: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerIdNumber: string; // Kebele ID or National ID
  status: TicketStatus;
  fareETB: number;
  qrHash: string;
  boardedAt?: string;
  boardingTerminal?: string;
  dropoffTerminal?: string;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. BK-202610-7782
  tripId: string;
  trip?: Trip;
  bookedByUserId?: string;
  bookedByRole: UserRole;
  branchId?: string;
  branchName?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmountETB: number;
  tickets: Ticket[];
  createdAt: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface CheckpointManifestEntry {
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  nationalIdNumber: string;
  boardingPoint: string;
  destination: string;
  ticketNumber: string;
  isBoarded: boolean;
}

export interface CheckpointManifest {
  tripCode: string;
  busPlateNumber: string;
  busSideNumber: string;
  driverName: string;
  driverPhone: string;
  conductorName: string;
  route: string;
  departureDate: string;
  departureTime: string;
  totalPassengers: number;
  boardedCount: number;
  entries: CheckpointManifestEntry[];
}

export interface CashDrawerSummary {
  agentId: string;
  agentName: string;
  branchName: string;
  shiftDate: string;
  shiftOpenedAt: string;
  shiftClosedAt?: string;
  openingCashETB: number;
  cashSalesETB: number;
  ticketsCount: number;
  cancelledTicketsCount: number;
  refundsETB: number;
  expectedDrawerCashETB: number;
}
