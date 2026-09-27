import { BusType, Seat } from './types';
export interface SeatLayoutOptions {
    busType: BusType;
    totalSeats: number;
    baseFareETB: number;
    bookedSeatNumbers?: string[];
    lockedSeatNumbers?: string[];
    blockedSeatNumbers?: string[];
}
export interface GeneratedSeatLayout {
    busType: BusType;
    totalSeats: number;
    rowsCount: number;
    columnsPerRow: number;
    aisleAfterColumn: number;
    seats: Seat[];
    seatMapByRow: Record<number, Seat[]>;
    availableCount: number;
    bookedCount: number;
    lockedCount: number;
}
export declare function generateSeatLayout(options: SeatLayoutOptions): GeneratedSeatLayout;
//# sourceMappingURL=seat-engine.d.ts.map