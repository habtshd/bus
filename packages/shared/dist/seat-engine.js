"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeatLayout = generateSeatLayout;
function generateSeatLayout(options) {
    const { busType, totalSeats, baseFareETB, paidSeatNumbers = options.bookedSeatNumbers || [], heldSeatNumbers = options.lockedSeatNumbers || [], boardedSeatNumbers = [], blockedSeatNumbers = [] } = options;
    const paidSet = new Set(paidSeatNumbers.map(s => s.trim().toUpperCase()));
    const heldSet = new Set(heldSeatNumbers.map(s => s.trim().toUpperCase()));
    const boardedSet = new Set(boardedSeatNumbers.map(s => s.trim().toUpperCase()));
    const blockedSet = new Set(blockedSeatNumbers.map(s => s.trim().toUpperCase()));
    const seats = [];
    const seatMapByRow = {};
    if (busType === 'VIP_FIRST_CLASS_1X2') {
        // 1x2 VIP Executive Sleeper Layout: Column A (Aisle) B, C
        // Typically ~30 seats. e.g. 9 rows of 3 = 27 + back row 3 = 30 seats.
        const seatsPerRow = 3;
        const totalRows = Math.ceil(totalSeats / seatsPerRow);
        let seatIndex = 0;
        for (let r = 1; r <= totalRows; r++) {
            seatMapByRow[r] = [];
            const letters = ['A', 'B', 'C'];
            for (let c = 0; c < letters.length; c++) {
                if (seatIndex >= totalSeats)
                    break;
                const letter = letters[c];
                const seatNumber = `${r}${letter}`;
                let status = 'AVAILABLE';
                if (boardedSet.has(seatNumber)) {
                    status = 'BOARDED';
                }
                else if (paidSet.has(seatNumber)) {
                    status = 'PAID';
                }
                else if (heldSet.has(seatNumber)) {
                    status = 'HELD';
                }
                else if (blockedSet.has(seatNumber)) {
                    status = 'BLOCKED';
                }
                const seat = {
                    id: `seat-${seatNumber}`,
                    seatNumber,
                    row: r,
                    column: c + 1,
                    columnLetter: letter,
                    isAisle: c === 0 || c === 1,
                    isWindow: c === 0 || c === 2,
                    isBackRow: r === totalRows,
                    status,
                    priceETB: baseFareETB * 1.25 // VIP surcharge
                };
                seats.push(seat);
                seatMapByRow[r].push(seat);
                seatIndex++;
            }
        }
        const available = seats.filter(s => s.status === 'AVAILABLE').length;
        const held = seats.filter(s => s.status === 'HELD' || s.status === 'LOCKED').length;
        const paid = seats.filter(s => s.status === 'PAID' || s.status === 'BOOKED').length;
        const boarded = seats.filter(s => s.status === 'BOARDED').length;
        return {
            busType,
            totalSeats,
            rowsCount: totalRows,
            columnsPerRow: 3,
            aisleAfterColumn: 1,
            seats,
            seatMapByRow,
            availableCount: available,
            heldCount: held,
            paidCount: paid,
            boardedCount: boarded,
            bookedCount: paid,
            lockedCount: held
        };
    }
    else if (busType === 'LUXURY_2X2') {
        // 2x2 layout: Column letters A, B (Aisle) C, D. Back row has 5 seats: A, B, C, D, E.
        const standardSeatsPerRow = 4;
        const standardRows = Math.floor((totalSeats - 5) / standardSeatsPerRow);
        const hasBackRowOf5 = (totalSeats - (standardRows * standardSeatsPerRow)) === 5;
        const totalRows = hasBackRowOf5 ? standardRows + 1 : Math.ceil(totalSeats / standardSeatsPerRow);
        let seatIndex = 0;
        for (let r = 1; r <= totalRows; r++) {
            seatMapByRow[r] = [];
            const isBackRow = r === totalRows && hasBackRowOf5;
            const letters = isBackRow ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
            for (let c = 0; c < letters.length; c++) {
                if (seatIndex >= totalSeats)
                    break;
                const letter = letters[c];
                const seatNumber = `${r}${letter}`;
                let status = 'AVAILABLE';
                if (boardedSet.has(seatNumber)) {
                    status = 'BOARDED';
                }
                else if (paidSet.has(seatNumber)) {
                    status = 'PAID';
                }
                else if (heldSet.has(seatNumber)) {
                    status = 'HELD';
                }
                else if (blockedSet.has(seatNumber)) {
                    status = 'BLOCKED';
                }
                const seat = {
                    id: `seat-${seatNumber}`,
                    seatNumber,
                    row: r,
                    column: c + 1,
                    columnLetter: letter,
                    isAisle: isBackRow ? false : (c === 1 || c === 2),
                    isWindow: isBackRow ? (c === 0 || c === 4) : (c === 0 || c === 3),
                    isBackRow,
                    status,
                    priceETB: baseFareETB
                };
                seats.push(seat);
                seatMapByRow[r].push(seat);
                seatIndex++;
            }
        }
        const available = seats.filter(s => s.status === 'AVAILABLE').length;
        const held = seats.filter(s => s.status === 'HELD' || s.status === 'LOCKED').length;
        const paid = seats.filter(s => s.status === 'PAID' || s.status === 'BOOKED').length;
        const boarded = seats.filter(s => s.status === 'BOARDED').length;
        return {
            busType,
            totalSeats,
            rowsCount: totalRows,
            columnsPerRow: 4,
            aisleAfterColumn: 2,
            seats,
            seatMapByRow,
            availableCount: available,
            heldCount: held,
            paidCount: paid,
            boardedCount: boarded,
            bookedCount: paid,
            lockedCount: held
        };
    }
    else {
        // 2x3 layout: Standard Ethiopian 59-seat intercity bus
        const standardSeatsPerRow = 5;
        const standardRows = Math.floor((totalSeats - 5) / standardSeatsPerRow);
        const hasBackRowOf5 = (totalSeats - (standardRows * standardSeatsPerRow)) === 5;
        const totalRows = hasBackRowOf5 ? standardRows + 1 : Math.ceil(totalSeats / standardSeatsPerRow);
        let seatIndex = 0;
        for (let r = 1; r <= totalRows; r++) {
            seatMapByRow[r] = [];
            const isBackRow = r === totalRows && hasBackRowOf5;
            const letters = ['A', 'B', 'C', 'D', 'E'];
            for (let c = 0; c < letters.length; c++) {
                if (seatIndex >= totalSeats)
                    break;
                const letter = letters[c];
                const seatNumber = `${r}${letter}`;
                let status = 'AVAILABLE';
                if (boardedSet.has(seatNumber)) {
                    status = 'BOARDED';
                }
                else if (paidSet.has(seatNumber)) {
                    status = 'PAID';
                }
                else if (heldSet.has(seatNumber)) {
                    status = 'HELD';
                }
                else if (blockedSet.has(seatNumber)) {
                    status = 'BLOCKED';
                }
                const seat = {
                    id: `seat-${seatNumber}`,
                    seatNumber,
                    row: r,
                    column: c + 1,
                    columnLetter: letter,
                    isAisle: isBackRow ? false : (c === 1 || c === 2),
                    isWindow: c === 0 || c === 4,
                    isBackRow,
                    status,
                    priceETB: baseFareETB
                };
                seats.push(seat);
                seatMapByRow[r].push(seat);
                seatIndex++;
            }
        }
        const available = seats.filter(s => s.status === 'AVAILABLE').length;
        const held = seats.filter(s => s.status === 'HELD' || s.status === 'LOCKED').length;
        const paid = seats.filter(s => s.status === 'PAID' || s.status === 'BOOKED').length;
        const boarded = seats.filter(s => s.status === 'BOARDED').length;
        return {
            busType,
            totalSeats,
            rowsCount: totalRows,
            columnsPerRow: 5,
            aisleAfterColumn: 2,
            seats,
            seatMapByRow,
            availableCount: available,
            heldCount: held,
            paidCount: paid,
            boardedCount: boarded,
            bookedCount: paid,
            lockedCount: held
        };
    }
}
//# sourceMappingURL=seat-engine.js.map