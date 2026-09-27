import React from 'react';
import { GeneratedSeatLayout, Seat } from '@bus/shared';
import { Compass, DoorOpen, ShieldCheck } from 'lucide-react';

interface SeatMapProps {
  layout: GeneratedSeatLayout;
  selectedSeats: string[];
  onToggleSeat: (seatNumber: string) => void;
  maxSeats?: number;
  readOnly?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  layout,
  selectedSeats,
  onToggleSeat,
  maxSeats = 4,
  readOnly = false
}) => {
  const is2x2 = layout.busType === 'LUXURY_2X2';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Bus Roof / Exterior Frame */}
      <div style={{
        width: is2x2 ? '340px' : '400px',
        background: 'linear-gradient(180deg, #1A263D 0%, #111A29 100%)',
        border: '2px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '36px 36px 18px 18px',
        padding: '24px 20px 24px 20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.1)',
        position: 'relative'
      }}>
        {/* Front Windshield Curved Banner */}
        <div style={{
          height: '42px',
          background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.05) 100%)',
          borderRadius: '26px 26px 8px 8px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: '#38BDF8',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em'
        }}>
          FRONT WINDSHIELD / የፊት መስታወት
        </div>

        {/* Driver Cabin & Entrance Door Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 12px 18px 12px',
          borderBottom: '1px dashed var(--border-subtle)',
          marginBottom: '18px'
        }}>
          {/* Driver Cockpit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#1F2937',
              border: '1px solid #374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={22} color="var(--ethiopia-gold)" />
            </div>
            <div style={{ fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>DRIVER</div>
              <div style={{ color: 'var(--text-muted)' }}>አሽከርካሪ</div>
            </div>
          </div>

          {/* Passenger Entry Door */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ethiopia-green)' }}>
            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700 }}>DOOR</div>
              <div style={{ color: 'var(--text-muted)' }}>መግቢያ</div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DoorOpen size={22} color="var(--ethiopia-green)" />
            </div>
          </div>
        </div>

        {/* Rows of Seats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(layout.seatMapByRow).map(([rowStr, rowSeats]) => {
            const rowNumber = parseInt(rowStr, 10);
            const isBackRow = rowSeats[0]?.isBackRow;

            // Split into Left Side and Right Side by Aisle
            const leftSeats: Seat[] = [];
            const rightSeats: Seat[] = [];

            if (isBackRow) {
              // Back row spans full width across
              return (
                <div key={rowStr} style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isSelectable = !readOnly && (seat.status === 'AVAILABLE' || isSelected);

                    return (
                      <div
                        key={seat.id}
                        onClick={() => isSelectable && onToggleSeat(seat.seatNumber)}
                        className={`seat-item ${isSelected ? 'selected' : seat.status.toLowerCase()}`}
                        title={`Seat ${seat.seatNumber} - ${seat.status}`}
                      >
                        <span>{seat.seatNumber}</span>
                      </div>
                    );
                  })}
                </div>
              );
            }

            rowSeats.forEach(seat => {
              if (seat.column <= layout.aisleAfterColumn) {
                leftSeats.push(seat);
              } else {
                rightSeats.push(seat);
              }
            });

            return (
              <div key={rowStr} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left Side (Window + Aisle) */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {leftSeats.map(seat => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isSelectable = !readOnly && (seat.status === 'AVAILABLE' || isSelected);

                    return (
                      <div
                        key={seat.id}
                        onClick={() => isSelectable && onToggleSeat(seat.seatNumber)}
                        className={`seat-item ${isSelected ? 'selected' : seat.status.toLowerCase()}`}
                        title={`Seat ${seat.seatNumber} - ${seat.status}${seat.passengerName ? ` (${seat.passengerName})` : ''}`}
                      >
                        <span>{seat.seatNumber}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Aisle Spacer */}
                <div className="bus-aisle">
                  <span>{rowNumber}</span>
                </div>

                {/* Right Side (Aisle + Window) */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {rightSeats.map(seat => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isSelectable = !readOnly && (seat.status === 'AVAILABLE' || isSelected);

                    return (
                      <div
                        key={seat.id}
                        onClick={() => isSelectable && onToggleSeat(seat.seatNumber)}
                        className={`seat-item ${isSelected ? 'selected' : seat.status.toLowerCase()}`}
                        title={`Seat ${seat.seatNumber} - ${seat.status}${seat.passengerName ? ` (${seat.passengerName})` : ''}`}
                      >
                        <span>{seat.seatNumber}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Color Legend */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        justifyContent: 'center',
        padding: '12px 18px',
        background: 'rgba(24, 34, 52, 0.6)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--seat-available)', border: '1px solid var(--seat-available-border)' }}></div>
          <span>Available ({layout.availableCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--seat-selected)', border: '1px solid #FCD34D' }}></div>
          <span>Selected ({selectedSeats.length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#3B1818', border: '1px solid #5C1D1D' }}></div>
          <span>Booked ({layout.bookedCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#133E2B', border: '1px solid #1B5E3F' }}></div>
          <span>Boarded</span>
        </div>
      </div>
    </div>
  );
};
