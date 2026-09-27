import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchTripDetails, onlineCheckout } from '../lib/api';
import {
  Smartphone,
  Search,
  MapPin,
  Calendar,
  Clock,
  Bus,
  CheckCircle2,
  QrCode,
  History,
  Bell,
  User,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Share2
} from 'lucide-react';

interface PassengerMobileSimulatorProps {
  isAmharic: boolean;
}

export const PassengerMobileSimulator: React.FC<PassengerMobileSimulatorProps> = ({ isAmharic }) => {
  const [mobileTab, setMobileTab] = useState<'search' | 'tickets' | 'history' | 'alerts' | 'profile'>('search');
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState('Addis Ababa');
  const [selectedDestination, setSelectedDestination] = useState('Hawassa');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Flow within mobile app
  // 1. search -> 2. results -> 3. seats -> 4. passenger -> 5. payment -> 6. ticket
  const [flowStep, setFlowStep] = useState<'HOME' | 'RESULTS' | 'SEATS' | 'PASSENGER' | 'PAYMENT' | 'TICKET'>('HOME');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['4A']);
  const [passengerName, setPassengerName] = useState('Mulugeta Tesfaye');
  const [passengerPhone, setPassengerPhone] = useState('+251 91 199 8877');
  const [passengerId, setPassengerId] = useState('KB-04-1029');
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR'>('TELEBIRR');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    fetchTrips().then((t) => setTrips(t)).catch(() => {});
  }, []);

  const totalFare = selectedTrip ? selectedSeats.length * selectedTrip.fareETB : 650;

  async function handleCompletePayment() {
    try {
      const res = await onlineCheckout({
        tripId: selectedTrip ? selectedTrip.id : trips[0]?.id,
        customerName: passengerName,
        customerPhone: passengerPhone,
        paymentMethod,
        passengers: selectedSeats.map((s) => ({
          seatNumber: s,
          passengerName,
          passengerPhone,
          passengerIdNumber: passengerId
        }))
      });
      setConfirmedBooking(res);
      setFlowStep('TICKET');
    } catch (e: any) {
      alert(e.message || 'Payment failed');
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div className="badge badge-gold" style={{ marginBottom: '6px' }}>
          DAYS 19–21 • FLUTTER PASSENGER MOBILE APP
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isAmharic ? 'የመንገደኛ ሞባይል መተግበሪያ' : 'Passenger Mobile App Simulator'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
          Pure mobile architecture: Fast, simple, reliable intercity coach ticketing, Telebirr checkout, and digital QR boarding pass.
        </p>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div
        style={{
          width: '390px',
          height: '780px',
          background: '#0F172A',
          borderRadius: '44px',
          border: '10px solid #1E293B',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(245, 158, 11, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Smartphone Speaker & Camera Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '140px',
            height: '24px',
            background: '#1E293B',
            borderBottomLeftRadius: '14px',
            borderBottomRightRadius: '14px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <div style={{ width: '40px', height: '4px', background: '#334155', borderRadius: '2px' }} />
          <div style={{ width: '8px', height: '8px', background: '#0284C7', borderRadius: '50%' }} />
        </div>

        {/* Mobile Header Bar */}
        <div
          style={{
            padding: '30px 16px 12px 16px',
            background: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bus size={20} color="var(--ethiopia-gold)" />
            <span style={{ fontWeight: 900, fontSize: '1rem', color: '#FFF' }}>ABYSSINIA BUS</span>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
            Telebirr Active
          </span>
        </div>

        {/* Mobile Scrollable Screen Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {mobileTab === 'search' && (
            <div>
              {flowStep === 'HOME' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#1E293B', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      BOOK INTERCITY COACH
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px', marginBottom: '14px' }}>
                      Where are you traveling?
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Origin</label>
                      <select
                        className="form-select"
                        value={selectedOrigin}
                        onChange={(e) => setSelectedOrigin(e.target.value)}
                        style={{ padding: '8px', fontSize: '0.85rem' }}
                      >
                        <option>Addis Ababa</option>
                        <option>Hawassa</option>
                        <option>Bahir Dar</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Destination</label>
                      <select
                        className="form-select"
                        value={selectedDestination}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                        style={{ padding: '8px', fontSize: '0.85rem' }}
                      >
                        <option>Hawassa</option>
                        <option>Bahir Dar</option>
                        <option>Dire Dawa</option>
                        <option>Gondar</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Travel Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ padding: '8px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      onClick={() => setFlowStep('RESULTS')}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                      <Search size={16} />
                      <span>Search Scheduled Buses</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Popular Departures
                  </div>
                  <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Addis Ababa ➔ Hawassa</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4.5 hrs • 2x2 VIP Luxury</div>
                    </div>
                    <span style={{ fontWeight: 900, color: 'var(--text-gold)' }}>650 ETB</span>
                  </div>
                  <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Addis Ababa ➔ Bahir Dar</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>9.0 hrs • Standard Express</div>
                    </div>
                    <span style={{ fontWeight: 900, color: 'var(--text-gold)' }}>1,200 ETB</span>
                  </div>
                </div>
              )}

              {flowStep === 'RESULTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Available Departures</span>
                    <button onClick={() => setFlowStep('HOME')} style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Change Search
                    </button>
                  </div>

                  {trips.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTrip(t);
                        setFlowStep('SEATS');
                      }}
                      style={{
                        background: '#1E293B',
                        padding: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{t.tripCode}</span>
                        <span style={{ fontWeight: 900, color: 'var(--text-gold)', fontSize: '1.05rem' }}>{t.fareETB} ETB</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        {t.route.originStation.city} ➔ {t.route.destinationStation.city}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Departs: 05:00 AM • Seats left: {t.availableSeatsCount}
                      </div>
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '0.75rem' }}>
                        Select This Bus
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {flowStep === 'SEATS' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Select Cabin Seat</span>
                    <span className="badge badge-gold">Seat {selectedSeats.join(', ')}</span>
                  </div>

                  <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>FRONT / DRIVER</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '240px', margin: '0 auto' }}>
                      {['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D', '4A', '4B', '4C', '4D'].map((s) => {
                        const isSel = selectedSeats.includes(s);
                        return (
                          <div
                            key={s}
                            onClick={() => setSelectedSeats([s])}
                            style={{
                              padding: '10px',
                              borderRadius: '6px',
                              background: isSel ? 'var(--ethiopia-gold)' : '#334155',
                              color: isSel ? '#000' : '#FFF',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            {s}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setFlowStep('PASSENGER')}
                    className="btn btn-green"
                    style={{ width: '100%', marginTop: '14px', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
                  >
                    Confirm Seat & Continue
                  </button>
                </div>
              )}

              {flowStep === 'PASSENGER' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Passenger Details (Manifest)</div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Full Name</label>
                    <input
                      className="form-input"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Phone (+251)</label>
                    <input
                      className="form-input"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Kebele / National ID</label>
                    <input
                      className="form-input"
                      value={passengerId}
                      onChange={(e) => setPassengerId(e.target.value)}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button
                    onClick={() => setFlowStep('PAYMENT')}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
                  >
                    Proceed to Payment ({totalFare} ETB)
                  </button>
                </div>
              )}

              {flowStep === 'PAYMENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Select Mobile Payment</div>
                  <div
                    onClick={() => setPaymentMethod('TELEBIRR')}
                    style={{
                      background: paymentMethod === 'TELEBIRR' ? 'rgba(2, 132, 199, 0.25)' : '#1E293B',
                      border: paymentMethod === 'TELEBIRR' ? '2px solid #0284C7' : '1px solid transparent',
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#38BDF8' }}>telebirr</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ethio Telecom Direct USSD / App</div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('CBE_BIRR')}
                    style={{
                      background: paymentMethod === 'CBE_BIRR' ? 'rgba(147, 51, 234, 0.25)' : '#1E293B',
                      border: paymentMethod === 'CBE_BIRR' ? '2px solid #A855F7' : '1px solid transparent',
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#C084FC' }}>CBE Birr</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commercial Bank of Ethiopia</div>
                  </div>

                  <button
                    onClick={handleCompletePayment}
                    className="btn btn-green"
                    style={{ width: '100%', marginTop: '16px', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
                  >
                    Pay {totalFare} ETB with {paymentMethod}
                  </button>
                </div>
              )}

              {flowStep === 'TICKET' && confirmedBooking && (
                <div style={{ background: '#FFFFFF', color: '#000000', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: '1rem' }}>ABYSSINIA BUS BOARDING PASS</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>PNR: {confirmedBooking.bookingReference}</div>
                  <div style={{ margin: '12px 0' }}>
                    <img src={confirmedBooking.tickets[0].qrCodeDataUrl} alt="QR" style={{ width: '140px', height: '140px', margin: '0 auto', display: 'block' }} />
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#B45309' }}>
                    SEAT {confirmedBooking.tickets[0].seatNumber}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>
                    {confirmedBooking.tickets[0].passengerName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#555' }}>
                    ID: {confirmedBooking.tickets[0].passengerIdNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 800, marginTop: '8px' }}>
                    ✓ CONFIRMED & READY FOR DOOR SCAN
                  </div>
                  <button
                    onClick={() => {
                      setFlowStep('HOME');
                      setSelectedTrip(null);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.75rem' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {mobileTab === 'tickets' && (
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ background: '#FFFFFF', color: '#000', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 900 }}>DIGITAL BOARDING TICKET</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>PNR: BK-WEB-040801</div>
                <div style={{ margin: '14px 0', padding: '8px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <QrCode size={120} color="#000" style={{ margin: '0 auto' }} />
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#B45309' }}>SEAT 7B</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Selamawit Desta</div>
                <div style={{ fontSize: '0.75rem', color: '#555' }}>Addis Ababa ➔ Hawassa (05:00 AM)</div>
              </div>
            </div>
          )}

          {mobileTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Booking History</div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Addis Ababa ➔ Hawassa</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today • Seat 7B • 650 ETB</div>
                <span className="badge badge-green" style={{ fontSize: '0.65rem', marginTop: '4px' }}>PAID / CONFIRMED</span>
              </div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Addis Ababa ➔ Bahir Dar</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oct 12 • Seat 3A • 1,200 ETB</div>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem', marginTop: '4px' }}>COMPLETED</span>
              </div>
            </div>
          )}

          {mobileTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Trip Alerts & Notifications</div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#38BDF8' }}>Boarding Call - Gate 2</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bus BUS-101 has commenced passenger boarding at Kality Gate 2.</div>
              </div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--ethiopia-green)' }}>Telebirr Payment Confirmed</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ticket TKT-500486 successfully issued.</div>
              </div>
            </div>
          )}

          {mobileTab === 'profile' && (
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--ethiopia-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                <User size={32} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Mulugeta Tesfaye</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+251 91 199 8877</div>
              <div style={{ marginTop: '16px', background: '#1E293B', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '0.8rem' }}>
                <div>National ID: <strong>KB-04-1029 (Verified)</strong></div>
                <div style={{ marginTop: '6px' }}>FDRE Manifest: <strong>Compliant</strong></div>
                <div style={{ marginTop: '6px' }}>Hotline: <strong>9444 (24/7)</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Mobile Tab Bar */}
        <div
          style={{
            height: '56px',
            background: '#1E293B',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingBottom: '4px'
          }}
        >
          <div
            onClick={() => setMobileTab('search')}
            style={{ textAlign: 'center', cursor: 'pointer', color: mobileTab === 'search' ? 'var(--ethiopia-gold)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            <Search size={18} style={{ margin: '0 auto' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>Search</div>
          </div>

          <div
            onClick={() => setMobileTab('tickets')}
            style={{ textAlign: 'center', cursor: 'pointer', color: mobileTab === 'tickets' ? 'var(--ethiopia-gold)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            <QrCode size={18} style={{ margin: '0 auto' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>My Ticket</div>
          </div>

          <div
            onClick={() => setMobileTab('history')}
            style={{ textAlign: 'center', cursor: 'pointer', color: mobileTab === 'history' ? 'var(--ethiopia-gold)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            <History size={18} style={{ margin: '0 auto' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>History</div>
          </div>

          <div
            onClick={() => setMobileTab('alerts')}
            style={{ textAlign: 'center', cursor: 'pointer', color: mobileTab === 'alerts' ? 'var(--ethiopia-gold)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            <Bell size={18} style={{ margin: '0 auto' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>Alerts</div>
          </div>

          <div
            onClick={() => setMobileTab('profile')}
            style={{ textAlign: 'center', cursor: 'pointer', color: mobileTab === 'profile' ? 'var(--ethiopia-gold)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            <User size={18} style={{ margin: '0 auto' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>Profile</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PassengerMobileSimulator;
