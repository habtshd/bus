import { BusType, Seat } from './types';
export interface SeatLayoutOptions {
    busType: BusType;
    totalSeats: number;
    baseFareETB: number;
    paidSeatNumbers?: string[];
    heldSeatNumbers?: string[];
    boardedSeatNumbers?: string[];
    blockedSeatNumbers?: string[];
    bookedSeatNumbers?: string[];
    lockedSeatNumbers?: string[];
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
    heldCount: number;
    paidCount: number;
    boardedCount: number;
    bookedCount: number;
    lockedCount: number;
}
export declare function generateSeatLayout(options: SeatLayoutOptions): GeneratedSeatLayout;
//# sourceMappingURL=seat-engine.d.ts.map