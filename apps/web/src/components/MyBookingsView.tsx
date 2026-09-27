import React, { useState } from 'react';
import { Search, Ticket, Calendar, MapPin, QrCode, Phone, User, Printer, Clock, AlertCircle } from 'lucide-react';

interface MyBookingsViewProps {
  isAmharic: boolean;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ isAmharic }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundBooking, setFoundBooking] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Preloaded demo searches
  const demoReferences = ['BK-202610-001', 'BK-202610-002'];

  async function handleSearch(refToSearch?: string) {
    const query = refToSearch || searchQuery;
    if (!query.trim()) return;

    try {
      setSearching(true);
      setErrorMsg('');
      setFoundBooking(null);

      // 1. Try direct reference lookup
      let res = await fetch(`http://localhost:4000/api/bookings/${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setFoundBooking(data);
        return;
      }

      // 2. Try multi-field search by phone, ticket #, or name
      const searchRes = await fetch(`http://localhost:4000/api/bookings/search?q=${encodeURIComponent(query.trim())}`);
      if (searchRes.ok) {
        const sData = await searchRes.json();
        if (sData.bookings && sData.bookings.length > 0) {
          setFoundBooking(sData.bookings[0]);
          return;
        }
      }

      throw new Error('No booking found matching reference code, phone number, or ticket number.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking not found');
    } finally {
      setSearching(false);
    }
  }

  async function handleCancelSelfService() {
    if (!foundBooking) return;
    if (!confirm(`Are you sure you want to cancel booking ${foundBooking.bookingReference}? Released seats will be made available for other passengers.`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/bookings/${foundBooking.bookingReference}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
      alert(`Booking ${foundBooking.bookingReference} has been cancelled.`);
      handleSearch(foundBooking.bookingReference);
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Search Header */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(2, 132, 199, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px auto',
          boxShadow: '0 0 20px rgba(2, 132, 199, 0.3)'
        }}>
          <Ticket size={28} color="#38BDF8" />
        </div>

        <div className="badge badge-blue" style={{ marginBottom: '8px' }}>
          PASSENGER SELF-SERVICE
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isAmharic ? 'የእኔ የጉዞ ትኬቶች እና ሁኔታ' : 'My Bookings & Digital E-Tickets'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto' }}>
          Retrieve your digital ticket, download QR boarding pass, verify seat assignments, or check trip status.
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', maxWidth: '550px', margin: '24px auto 12px auto' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Booking Reference (e.g. BK-202610-001)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, fontSize: '1rem', fontWeight: 600 }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={searching || !searchQuery.trim()}
            className="btn btn-primary"
            style={{ padding: '0 20px' }}
          >
            <Search size={18} />
            <span>Search</span>
          </button>
        </div>

        {/* Demo Fast Clicks */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Try demo booking:</span>
          {demoReferences.map(ref => (
            <button
              key={ref}
              onClick={() => {
                setSearchQuery(ref);
                handleSearch(ref);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-gold)',
                padding: '3px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={20} color="#F87171" />
          <span style={{ color: '#FCA5A5', fontSize: '0.9rem' }}>{errorMsg}</span>
        </div>
      )}

      {/* Booking Result View */}
      {foundBooking && (
        <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          {/* Booking Summary Top Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '14px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>{foundBooking.bookingReference}</span>
                <span className={`badge ${
                  foundBooking.trip.status === 'BOARDING' ? 'badge-green' :
                  foundBooking.trip.status === 'DEPARTED' ? 'badge-blue' : 'badge-gold'
                }`}>
                  TRIP: {foundBooking.trip.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '6px' }}>
                {foundBooking.trip.route.originStation.nameEn} ➔ {foundBooking.trip.route.destinationStation.nameEn}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {foundBooking.trip.route.originStation.nameAm} ➔ {foundBooking.trip.route.destinationStation.nameAm}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-gold)' }}>
                {foundBooking.totalAmountETB} ETB
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px' }}>
                <span className={`badge ${foundBooking.paymentStatus === 'REFUNDED' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.75rem' }}>
                  {foundBooking.paymentStatus === 'REFUNDED' ? 'CANCELLED / REFUNDED' : `PAID via ${foundBooking.paymentMethod || 'Online'}`}
                </span>
                {foundBooking.paymentStatus !== 'REFUNDED' && (
                  <button
                    onClick={handleCancelSelfService}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', border: '1px solid #F87171', color: '#FCA5A5' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Vehicle Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '0.85rem'
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DEPARTURE TIME</div>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={15} color="var(--ethiopia-gold)" />
                <span>{new Date(foundBooking.trip.departureTime).toLocaleDateString()} at {new Date(foundBooking.trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DEPARTURE TERMINAL</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>
                {foundBooking.trip.route.originStation.terminalArea}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ASSIGNED VEHICLE</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>
                {foundBooking.trip.bus.plateNumber} ({foundBooking.trip.bus.sideNumber})
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DRIVER & CONDUCTOR</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>
                {foundBooking.trip.driverName} ({foundBooking.trip.conductorName})
              </div>
            </div>
          </div>

          {/* Individual Issued Tickets with Verifiable QR Code */}
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
            Boarding Tickets ({foundBooking.tickets.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {foundBooking.tickets.map((tkt: any) => (
              <div
                key={tkt.id}
                style={{
                  background: '#0B0F19',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}
              >
                {/* QR Code */}
                <div style={{
                  background: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}>
                  <img src={tkt.qrCodeDataUrl} alt="Ticket QR" style={{ width: '110px', height: '110px', display: 'block' }} />
                </div>

                {/* Ticket Details */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>SEAT {tkt.seatNumber}</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-gold)' }}>{tkt.ticketNumber}</strong>
                    <span className={`badge ${tkt.status === 'BOARDED' ? 'badge-green' : 'badge-blue'}`} style={{ marginLeft: 'auto' }}>
                      {tkt.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{tkt.passengerName}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Phone: {tkt.passengerPhone} • National ID: {tkt.passengerIdNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Boarding Gate: {foundBooking.trip.route.originStation.nameEn}
                  </div>
                </div>

                {/* Print CTA */}
                <div>
                  <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    <Printer size={15} />
                    <span>Print Boarding Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
