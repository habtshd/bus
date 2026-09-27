import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchTripDetails, onlineCheckout } from '../lib/api';
import { SeatMap } from './SeatMap';
import { Search, MapPin, Calendar, Clock, Bus, CheckCircle2, QrCode, Phone, User, CreditCard, Shield, Download, Printer } from 'lucide-react';

interface PassengerPortalProps {
  isAmharic: boolean;
}

export const PassengerPortal: React.FC<PassengerPortalProps> = ({ isAmharic }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Booking Form State
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('+251 ');
  const [passengerId, setPassengerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA_GATEWAY'>('TELEBIRR');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      const data = await fetchTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTrip(trip: any) {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setConfirmedBooking(null);
    try {
      setDetailsLoading(true);
      const details = await fetchTripDetails(trip.id);
      setTripDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  }

  function handleToggleSeat(seatNumber: string) {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 4) {
        alert('You can select a maximum of 4 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTrip || selectedSeats.length === 0) return;
    if (!passengerName.trim() || passengerPhone.length < 9) {
      alert('Please enter valid passenger name and Ethiopian phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const passengersPayload = selectedSeats.map(s => ({
        seatNumber: s,
        passengerName,
        passengerPhone,
        passengerIdNumber: passengerId || 'KB-ADDIS-2026'
      }));

      const res = await onlineCheckout({
        tripId: selectedTrip.id,
        customerName: passengerName,
        customerPhone: passengerPhone,
        paymentMethod,
        passengers: passengersPayload
      });

      setConfirmedBooking(res);
      // Refresh seat layout
      const updatedDetails = await fetchTripDetails(selectedTrip.id);
      setTripDetails(updatedDetails);
      setSelectedSeats([]);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Hero Search Banner */}
      <div className="glass-panel" style={{
        padding: '36px',
        marginBottom: '36px',
        background: 'linear-gradient(135deg, rgba(24, 34, 52, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '800px', marginBottom: '24px' }}>
          <div className="badge badge-gold" style={{ marginBottom: '12px' }}>
            {isAmharic ? 'የኢትዮጵያ ቀዳሚ የረጅም ርቀት አውቶቡስ መድረክ' : 'Ethiopia\'s Premier Intercity Transit'}
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '10px' }}>
            {isAmharic ? 'የጉዞ ትኬትዎን በመስመር ላይ በቴሌብር ይቁረጡ' : 'Book Your Intercity Bus Tickets Online'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            {isAmharic
              ? 'ከአዲስ አበባ ወደ ሀዋሳ፣ ባሕር ዳር፣ ጎንደር እና ድሬዳዋ አስተማማኝ እና ምቹ ጉዞ ከቅጽበታዊ የQR ትኬት ጋር።'
              : 'Direct routes from Addis Ababa to Hawassa, Bahir Dar, Gondar & Dire Dawa. Instant QR verification & SMS e-tickets.'}
          </p>
        </div>

        {/* Quick Filter Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '18px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div className="form-group">
            <label className="form-label">{isAmharic ? 'መነሻ ተርሚናል' : 'From / Origin'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--ethiopia-gold)" />
              <select className="form-select" style={{ width: '100%' }}>
                <option>Addis Ababa (Kality / Autobis Tera)</option>
                <option>Hawassa Central</option>
                <option>Bahir Dar Main</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{isAmharic ? 'መዳረሻ' : 'To / Destination'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--ethiopia-green)" />
              <select className="form-select" style={{ width: '100%' }}>
                <option>Hawassa Central</option>
                <option>Bahir Dar Main</option>
                <option>Dire Dawa Kezira</option>
                <option>Gondar Azezo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{isAmharic ? 'የጉዞ ቀን' : 'Travel Date'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#38BDF8" />
              <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" style={{ width: '100%', height: '44px' }} onClick={loadTrips}>
              <Search size={18} />
              <span>{isAmharic ? 'አውቶቡስ ፈልግ' : 'Find Buses'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Trip List, Right Seat & Booking Engine */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTrip ? '1fr 1.3fr' : '1fr', gap: '32px' }}>
        {/* Available Trips List */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bus size={22} color="var(--ethiopia-gold)" />
            <span>{isAmharic ? 'ዛሬ የሚነሱ አውቶቡሶች' : 'Available Scheduled Trips'}</span>
            <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>{trips.length} Available</span>
          </h2>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading scheduled trips...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {trips.map(trip => {
                const isSelected = selectedTrip?.id === trip.id;
                const depTime = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const arrTime = new Date(trip.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={trip.id}
                    className="glass-panel"
                    onClick={() => handleSelectTrip(trip)}
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--ethiopia-gold)' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 0 20px var(--ethiopia-gold-glow)' : 'var(--shadow-md)',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.01)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <span className="badge badge-blue" style={{ marginBottom: '6px' }}>{trip.tripCode}</span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                          {trip.route.originStation.nameEn} ➔ {trip.route.destinationStation.nameEn}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {trip.route.originStation.nameAm} ➔ {trip.route.destinationStation.nameAm}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                          {trip.fareETB} <span style={{ fontSize: '0.85rem' }}>ETB</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>per passenger</div>
                      </div>
                    </div>

                    {/* Schedule times & Bus metadata */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      marginBottom: '14px'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DEPARTURE</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} color="var(--ethiopia-gold)" />
                          <span>{depTime}</span>
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DURATION</div>
                        <div style={{ fontWeight: 700 }}>{trip.route.estimatedDurationHours} Hours</div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>SEATS LEFT</div>
                        <div style={{ fontWeight: 700, color: trip.availableSeatsCount < 10 ? '#F87171' : 'var(--ethiopia-green)' }}>
                          {trip.availableSeatsCount} / {trip.totalSeats}
                        </div>
                      </div>
                    </div>

                    {/* Fleet Tag & Select CTA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        🚌 {trip.bus.busModel} ({trip.bus.busType === 'LUXURY_2X2' ? '2x2 Luxury VIP' : '2x3 Standard'})
                      </div>
                      <button className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                        {isSelected ? (isAmharic ? 'ተመርጧል' : 'Selected') : (isAmharic ? 'ወንበር ምረጥ' : 'Select Seats')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: Seat Map & Instant Booking Panel */}
        {selectedTrip && (
          <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '4px' }}>
                  {selectedTrip.bus.busType === 'LUXURY_2X2' ? '2x2 VIP Luxury Cabin' : '2x3 Standard Cabin'}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {isAmharic ? 'የአውቶቡስ ወንበር ይምረጡ' : 'Select Your Seat'}
                </h3>
              </div>

              {selectedSeats.length > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total ({selectedSeats.length} seats)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                    {selectedSeats.length * selectedTrip.fareETB} ETB
                  </div>
                </div>
              )}
            </div>

            {/* Seat Map Visualizer */}
            {detailsLoading || !tripDetails ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>Rendering bus seat layout...</div>
            ) : (
              <SeatMap
                layout={tripDetails.seatLayout}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
              />
            )}

            {/* Passenger Form & Checkout */}
            {selectedSeats.length > 0 && (
              <form onSubmit={handleCheckout} style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={18} color="var(--ethiopia-gold)" />
                  <span>{isAmharic ? 'የመንገደኛ መረጃ' : 'Passenger & Checkpoint Information'}</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">{isAmharic ? 'ሙሉ ስም (የአሽከርካሪ ማኒፌስት)' : 'Full Name (Manifest)'}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Abebe Kebede"
                      value={passengerName}
                      onChange={e => setPassengerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isAmharic ? 'ስልክ ቁጥር (SMS ትኬት)' : 'Phone Number (+251)'}</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+251 91 123 4567"
                      value={passengerPhone}
                      onChange={e => setPassengerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">{isAmharic ? 'የቀበሌ / ብሔራዊ መታወቂያ ቁጥር' : 'Kebele / National ID Card No.'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. KB-03-49821 or Fanus Digital ID"
                    value={passengerId}
                    onChange={e => setPassengerId(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    * Required for Ethiopian federal and regional police checkpoint passenger manifests.
                  </div>
                </div>

                {/* Ethiopian Payment Methods */}
                <div style={{ marginBottom: '22px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    {isAmharic ? 'የመክፈያ ዘዴ ይምረጡ' : 'Select Digital Payment'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div
                      onClick={() => setPaymentMethod('TELEBIRR')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: paymentMethod === 'TELEBIRR' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                        border: paymentMethod === 'TELEBIRR' ? '2px solid #0284C7' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#38BDF8' }}>telebirr</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ኢትዮ ቴሌኮም</div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('CBE_BIRR')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: paymentMethod === 'CBE_BIRR' ? 'rgba(147, 51, 234, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                        border: paymentMethod === 'CBE_BIRR' ? '2px solid #A855F7' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#C084FC' }}>CBE Birr</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ንግድ ባንክ</div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('CHAPA_GATEWAY')}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: paymentMethod === 'CHAPA_GATEWAY' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                        border: paymentMethod === 'CHAPA_GATEWAY' ? '2px solid var(--ethiopia-green)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--ethiopia-green)' }}>Chapa</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Card / Awash</div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-telebirr"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
                >
                  <CreditCard size={18} />
                  <span>
                    {submitting
                      ? 'Processing Payment...'
                      : `Pay ${selectedSeats.length * selectedTrip.fareETB} ETB with ${paymentMethod}`}
                  </span>
                </button>
              </form>
            )}

            {/* Confirmed E-Ticket Modal / Receipt View */}
            {confirmedBooking && (
              <div style={{
                marginTop: '24px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(24, 34, 52, 0.9) 100%)',
                borderRadius: '16px',
                border: '2px solid var(--ethiopia-green)',
                boxShadow: '0 0 30px var(--ethiopia-green-glow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <CheckCircle2 size={28} color="var(--ethiopia-green)" />
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ethiopia-green)' }}>
                      {isAmharic ? 'ቦታዎ በተሳካ ሁኔታ ተይዟል!' : 'Booking Confirmed & Paid!'}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Booking Ref: <strong style={{ color: 'var(--text-main)' }}>{confirmedBooking.bookingReference}</strong>
                    </div>
                  </div>
                </div>

                {/* Ticket Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {confirmedBooking.tickets.map((tkt: any) => (
                    <div
                      key={tkt.id}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        background: '#0F172A',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-subtle)',
                        alignItems: 'center'
                      }}
                    >
                      {/* Verifiable QR Code */}
                      <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px' }}>
                        <img src={tkt.qrCodeDataUrl} alt="Ticket QR" style={{ width: '100px', height: '100px', display: 'block' }} />
                      </div>

                      <div style={{ flex: 1, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>SEAT {tkt.seatNumber}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-gold)' }}>{tkt.ticketNumber}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tkt.passengerName}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>ID: {tkt.passengerIdNumber}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                          {confirmedBooking.trip.route}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SMS Notification Banner */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(2, 132, 199, 0.15)',
                  borderRadius: '8px',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Phone size={16} color="#38BDF8" />
                  <span>
                    <strong>SMS Sent to {passengerPhone}</strong>: "Selam {passengerName}, your ticket for {confirmedBooking.trip.route} is confirmed. Show QR or SMS at terminal."
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>
                    <Printer size={16} />
                    <span>Print Ticket</span>
                  </button>
                  <button onClick={() => setConfirmedBooking(null)} className="btn btn-primary" style={{ flex: 1 }}>
                    Book Another Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
