"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeatLayout = generateSeatLayout;
function generateSeatLayout(options) {
    const { busType, totalSeats, baseFareETB, bookedSeatNumbers = [], lockedSeatNumbers = [], blockedSeatNumbers = [] } = options;
    const bookedSet = new Set(bookedSeatNumbers.map(s => s.trim().toUpperCase()));
    const lockedSet = new Set(lockedSeatNumbers.map(s => s.trim().toUpperCase()));
    const blockedSet = new Set(blockedSeatNumbers.map(s => s.trim().toUpperCase()));
    const seats = [];
    const seatMapByRow = {};
    if (busType === 'LUXURY_2X2') {
        // 2x2 layout: Column letters A, B (Aisle) C, D. Back row has 5 seats: A, B, C, D, E.
        // e.g. 45 seats: 10 standard rows of 4 = 40 seats + 1 back row of 5 = 45 seats.
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
                if (bookedSet.has(seatNumber)) {
                    status = 'BOOKED';
                }
                else if (lockedSet.has(seatNumber)) {
                    status = 'LOCKED';
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
        return {
            busType,
            totalSeats,
            rowsCount: totalRows,
            columnsPerRow: 4,
            aisleAfterColumn: 2,
            seats,
            seatMapByRow,
            availableCount: seats.filter(s => s.status === 'AVAILABLE').length,
            bookedCount: seats.filter(s => s.status === 'BOOKED').length,
            lockedCount: seats.filter(s => s.status === 'LOCKED').length
        };
    }
    else {
        // 2x3 layout: Standard Ethiopian 59-seat intercity bus
        // Column letters A, B (Aisle) C, D, E. Back row has 5 or 6 seats.
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
                if (bookedSet.has(seatNumber)) {
                    status = 'BOOKED';
                }
                else if (lockedSet.has(seatNumber)) {
                    status = 'LOCKED';
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
        return {
            busType,
            totalSeats,
            rowsCount: totalRows,
            columnsPerRow: 5,
            aisleAfterColumn: 2,
            seats,
            seatMapByRow,
            availableCount: seats.filter(s => s.status === 'AVAILABLE').length,
            bookedCount: seats.filter(s => s.status === 'BOOKED').length,
            lockedCount: seats.filter(s => s.status === 'LOCKED').length
        };
    }
}
//# sourceMappingURL=seat-engine.js.map