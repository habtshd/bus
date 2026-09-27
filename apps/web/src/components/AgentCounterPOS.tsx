import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchTripDetails, counterCheckout } from '../lib/api';
import { SeatMap } from './SeatMap';
import { Store, Banknote, Printer, RefreshCw, User, Search, FileText, CheckCircle2, X } from 'lucide-react';

interface AgentCounterPOSProps {
  isAmharic: boolean;
}

export const AgentCounterPOS: React.FC<AgentCounterPOSProps> = ({ isAmharic }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('+251 9');
  const [passengerId, setPassengerId] = useState('');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<any>(null);

  // Shift & Drawer stats
  const [openingFloat] = useState(2000);
  const [accumulatedCash, setAccumulatedCash] = useState(1300);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Passenger Lookup state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchTrips();
      setTrips(data);
      if (data.length > 0) {
        handleSelectTrip(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSelectTrip(trip: any) {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setPrintedReceipt(null);
    try {
      const details = await fetchTripDetails(trip.id);
      setTripDetails(details);
    } catch (e) {
      console.error(e);
    }
  }

  function handleToggleSeat(seatNumber: string) {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  }

  const totalAmountETB = selectedTrip ? selectedSeats.length * selectedTrip.fareETB : 0;
  const changeETB = cashTendered ? Math.max(0, parseFloat(cashTendered) - totalAmountETB) : 0;

  async function handleIssueTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTrip || selectedSeats.length === 0) return;
    if (!passengerName.trim()) {
      alert('Passenger name is mandatory for passenger manifest registration.');
      return;
    }

    try {
      setSubmitting(true);
      const passengersPayload = selectedSeats.map(s => ({
        seatNumber: s,
        passengerName,
        passengerPhone,
        passengerIdNumber: passengerId || 'KB-VERIFIED'
      }));

      const res = await counterCheckout({
        tripId: selectedTrip.id,
        customerName: passengerName,
        customerPhone: passengerPhone,
        cashTenderedETB: parseFloat(cashTendered) || totalAmountETB,
        passengers: passengersPayload
      });

      setPrintedReceipt(res);
      setAccumulatedCash(prev => prev + totalAmountETB);

      // Refresh seat layout
      const updatedDetails = await fetchTripDetails(selectedTrip.id);
      setTripDetails(updatedDetails);
      setSelectedSeats([]);
      setCashTendered('');
    } catch (err: any) {
      alert(err.message || 'Counter transaction failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSearchPassenger() {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      // Fetch booking by reference
      const res = await fetch(`http://localhost:4000/api/bookings/${searchQuery.trim()}`);
      if (!res.ok) {
        alert('No booking found with this reference code or ticket number.');
        return;
      }
      const data = await res.json();
      setSearchedTicket(data);
    } catch (e) {
      alert('Error searching passenger record');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top POS Counter & Shift Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} color="var(--ethiopia-gold)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ACTIVE BRANCH</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Autobis Tera Main #01</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>አውቶቡስ ተራ ዋና ቅርንጫፍ</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Banknote size={24} color="var(--ethiopia-green)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DRAWER CASH BALANCE</div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--ethiopia-green)' }}>
                {(openingFloat + accumulatedCash).toLocaleString()} ETB
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Float: {openingFloat} ETB</div>
            </div>
          </div>
          <button onClick={() => setShowShiftModal(true)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            Shift Closeout
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="#38BDF8" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>COUNTER AGENT</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Tigist Bekele (ID: AG-402)</div>
            <div className="badge badge-green" style={{ fontSize: '0.65rem', marginTop: '2px' }}>SHIFT OPEN</div>
          </div>
        </div>
      </div>

      {/* Staff Fast Passenger Search Toolbar */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="var(--ethiopia-gold)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Quick Passenger Lookup:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '500px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search booking ref e.g. BK-202610-001 or phone"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchPassenger()}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          />
          <button onClick={handleSearchPassenger} disabled={searching} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Find
          </button>
        </div>
      </div>

      {/* Searched Passenger Card (if open) */}
      {searchedTicket && (
        <div className="glass-panel" style={{ padding: '18px', marginBottom: '20px', border: '1px solid #38BDF8', position: 'relative' }}>
          <button onClick={() => setSearchedTicket(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
            <X size={18} />
          </button>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                Booking {searchedTicket.bookingReference} — {searchedTicket.customerName} ({searchedTicket.customerPhone})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Route: {searchedTicket.trip.route.originStation.nameEn} ➔ {searchedTicket.trip.route.destinationStation.nameEn} • Status: {searchedTicket.paymentStatus} • Total: {searchedTicket.totalAmountETB} ETB
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              {searchedTicket.tickets.map((t: any) => (
                <span key={t.id} className="badge badge-gold">Seat {t.seatNumber} ({t.status})</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Trip Picker & Seat Map, Right Fast Checkout Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Left Side: Trip Selector & Seat Matrix */}
        <div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {trips.map(trip => {
              const isSelected = selectedTrip?.id === trip.id;
              return (
                <button
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  <span>{trip.tripCode}: {trip.route.originStation.city} ➔ {trip.route.destinationStation.city} ({trip.fareETB} ETB)</span>
                </button>
              );
            })}
          </div>

          {selectedTrip && tripDetails ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {selectedTrip.route.originStation.nameEn} ➔ {selectedTrip.route.destinationStation.nameEn}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Plate: <strong>{selectedTrip.bus.plateNumber}</strong> ({selectedTrip.bus.sideNumber}) | Departs: <strong>{new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                </div>
                <button onClick={() => handleSelectTrip(selectedTrip)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                  <RefreshCw size={14} /> Refresh Seats
                </button>
              </div>

              <SeatMap
                layout={tripDetails.seatLayout}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
              />
            </div>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center' }}>Loading trip details...</div>
          )}
        </div>

        {/* Right Side: Fast Cash Checkout & 80mm Thermal Receipt */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Banknote size={20} color="var(--ethiopia-gold)" />
              <span>{isAmharic ? 'የጥሬ ገንዘብ ክፍያ መመዝገቢያ' : 'Cash Counter Checkout'}</span>
            </h3>

            {/* Selected Seats Pill */}
            <div style={{
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SELECTED SEATS</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {selectedSeats.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No seats clicked. Click seats on the bus map.</span>
                ) : (
                  selectedSeats.map(s => (
                    <span key={s} className="badge badge-gold" style={{ fontSize: '0.85rem' }}>Seat {s}</span>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleIssueTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{isAmharic ? 'የመንገደኛ ሙሉ ስም' : 'Passenger Full Name'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mulugeta Tesfaye"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+251 9..."
                  value={passengerPhone}
                  onChange={e => setPassengerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isAmharic ? 'የቀበሌ / ብሔራዊ መታወቂያ' : 'Kebele / National ID (Manifest)'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. KB-12-0941"
                  value={passengerId}
                  onChange={e => setPassengerId(e.target.value)}
                  required
                />
              </div>

              {/* Price Calculation Box */}
              <div style={{
                background: '#0B0F19',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ticket Price ({selectedSeats.length}x):</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-gold)' }}>{totalAmountETB} ETB</span>
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label">{isAmharic ? 'የተቀበሉት ጥሬ ገንዘብ' : 'Cash Tendered (From Customer)'}</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 1000"
                    value={cashTendered}
                    onChange={e => setCashTendered(e.target.value)}
                    style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ethiopia-green)' }}
                  />
                </div>

                {parseFloat(cashTendered) > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--ethiopia-green)' }}>Change to Return:</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--ethiopia-green)' }}>
                      {changeETB.toFixed(2)} ETB
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || selectedSeats.length === 0}
                className="btn btn-green"
                style={{ padding: '14px', fontSize: '1rem', fontWeight: 700 }}
              >
                <Printer size={18} />
                <span>
                  {submitting
                    ? 'Issuing Ticket...'
                    : `Collect ${totalAmountETB} ETB & Print Ticket`}
                </span>
              </button>
            </form>

            {/* 80mm ESC/POS Thermal Receipt Display */}
            {printedReceipt && (
              <div style={{
                marginTop: '20px',
                background: '#FFFFFF',
                color: '#000000',
                padding: '16px',
                borderRadius: '8px',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.3,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 900, fontSize: '1rem' }}>ABYSSINIA INTERCITY BUS</div>
                  <div>አቢሲኒያ የረጅም ርቀት አውቶቡስ</div>
                  <div>TIN: 0054892110 | Branch: Autobis Tera</div>
                  <div>Tel: +251 11 278 1122</div>
                </div>

                <div>Date: {new Date().toLocaleString()}</div>
                <div>Booking: {printedReceipt.bookingReference}</div>
                <div>Route: {printedReceipt.trip.route}</div>
                <div>Bus Plate: {printedReceipt.trip.busPlate} ({printedReceipt.trip.busSide})</div>
                <div>Passenger: {passengerName}</div>
                <div>ID: {passengerId || 'Verified'}</div>

                <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', margin: '8px 0', padding: '6px 0' }}>
                  {printedReceipt.tickets.map((t: any) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>SEAT {t.seatNumber} ({t.ticketNumber})</span>
                      <span style={{ fontWeight: 800 }}>{t.fareETB} ETB</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem' }}>
                  <span>TOTAL PAID (CASH):</span>
                  <span>{printedReceipt.totalAmountETB} ETB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Cash Tendered:</span>
                  <span>{printedReceipt.cashTenderedETB} ETB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Change:</span>
                  <span>{printedReceipt.changeETB} ETB</span>
                </div>

                {/* QR Code */}
                <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #000' }}>
                  <img src={printedReceipt.tickets[0]?.qrCodeDataUrl} alt="QR" style={{ width: '120px', height: '120px', margin: '0 auto', display: 'block' }} />
                  <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>SCAN AT BUS DOOR FOR BOARDING</div>
                  <div style={{ fontSize: '0.7rem' }}>መልካም ጉዞ / HAVE A SAFE TRIP</div>
                </div>

                <button onClick={() => window.print()} className="btn btn-secondary" style={{ width: '100%', marginTop: '12px', background: '#000', color: '#FFF' }}>
                  <Printer size={16} /> Print 80mm Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shift Closeout Modal */}
      {showShiftModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '30px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
              Daily Cash Shift Drawer Closeout
            </h3>

            <div style={{ background: '#0F172A', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Opening Cash Float:</span>
                <strong>{openingFloat.toLocaleString()} ETB</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Today's Counter Cash Sales:</span>
                <strong style={{ color: 'var(--ethiopia-green)' }}>+{accumulatedCash.toLocaleString()} ETB</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Refunds / Voids:</span>
                <span>0.00 ETB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '1.05rem', fontWeight: 800 }}>
                <span>Expected Drawer Total:</span>
                <span style={{ color: 'var(--text-gold)' }}>{(openingFloat + accumulatedCash).toLocaleString()} ETB</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowShiftModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={() => {
                alert('Shift successfully closed! Daily reconciliation record sent to Accountant.');
                setShowShiftModal(false);
              }} className="btn btn-green" style={{ flex: 1 }}>
                Reconcile & Close Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
