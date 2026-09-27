import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchTripDetails, onlineCheckout, sendTicketSms } from '../lib/api';
import { SeatMap } from './SeatMap';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Bus,
  CheckCircle2,
  QrCode,
  Phone,
  User,
  CreditCard,
  Shield,
  Download,
  Printer,
  ArrowRight,
  Star,
  Sparkles,
  Wifi,
  Coffee,
  Award,
  ChevronRight,
  FileText,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface PassengerPortalProps {
  isAmharic: boolean;
}

export const PassengerPortal: React.FC<PassengerPortalProps> = ({ isAmharic }) => {
  // Trips & Search state
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState('Addis Ababa');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ONE_WAY');

  // Booking Flow Steps
  // Step 1: Browse / Search
  // Step 2: Select Seat & Fill Passenger Info
  // Step 3: Payment
  // Step 4: Confirmed QR Ticket
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Passenger Form State
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('+251 9');
  const [passengerId, setPassengerId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA_GATEWAY'>('TELEBIRR');
  const [telebirrAccount, setTelebirrAccount] = useState('');
  const [paymentStep, setPaymentStep] = useState<'SELECT' | 'PROCESSING' | 'CONFIRMED'>('SELECT');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState<any>(null);

  // Popular Routes Showcase Data (Day 16)
  const popularRoutes = [
    {
      origin: 'Addis Ababa',
      destination: 'Hawassa',
      distance: '275 km',
      duration: '4.5 hrs',
      baseFare: 650,
      stops: 'Mojo Junction • Batu Lake Ziway',
      highlight: 'VIP Luxury 2x2 AC'
    },
    {
      origin: 'Addis Ababa',
      destination: 'Bahir Dar',
      distance: '560 km',
      duration: '9.0 hrs',
      baseFare: 1200,
      stops: 'Dejen • Blue Nile Gorge',
      highlight: 'Standard 2x3 Express'
    },
    {
      origin: 'Addis Ababa',
      destination: 'Dire Dawa',
      distance: '515 km',
      duration: '8.5 hrs',
      baseFare: 1100,
      stops: 'Adama • Awash Arba',
      highlight: 'VIP Luxury 2x2 Coach'
    },
    {
      origin: 'Addis Ababa',
      destination: 'Gondar',
      distance: '730 km',
      duration: '12.0 hrs',
      baseFare: 1450,
      stops: 'Debre Markos • Bahir Dar',
      highlight: 'Executive Sleeper Recliner'
    }
  ];

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
    setPaymentStep('SELECT');
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
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 4) {
        alert('Maximum 4 seats per online booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  }

  // Filtered trips based on search bar
  const displayedTrips = trips.filter((t) => {
    if (selectedDestination !== 'All' && !t.route.destinationStation.city.toLowerCase().includes(selectedDestination.toLowerCase())) {
      return false;
    }
    return true;
  });

  const baseFareTotal = selectedTrip ? selectedSeats.length * selectedTrip.fareETB : 0;
  const terminalFee = selectedSeats.length > 0 ? 50 : 0; // 50 ETB station service charge
  const grandTotalETB = baseFareTotal + terminalFee;

  // Day 18: Online Checkout & Payment Simulation
  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTrip || selectedSeats.length === 0) return;
    if (!passengerName.trim() || passengerPhone.length < 9) {
      alert('Please enter valid passenger name and Ethiopian phone number (+251...).');
      return;
    }

    try {
      setSubmitting(true);
      setPaymentStep('PROCESSING');

      const passengersPayload = selectedSeats.map((s) => ({
        seatNumber: s,
        passengerName,
        passengerPhone,
        passengerIdNumber: passengerId || 'KB-VERIFIED'
      }));

      // Simulate payment processing delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await onlineCheckout({
        tripId: selectedTrip.id,
        customerName: passengerName,
        customerPhone: passengerPhone,
        paymentMethod,
        passengers: passengersPayload
      });

      setConfirmedBooking(res);
      setPaymentStep('CONFIRMED');

      // Dispatch automated SMS confirmation
      try {
        const smsRes = await sendTicketSms({
          phone: passengerPhone,
          bookingReference: res.bookingReference,
          passengerName,
          tripCode: selectedTrip.tripCode,
          route: res.trip.route,
          departureTime: new Date(selectedTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seatNumber: selectedSeats.join(', ')
        });
        setSmsDeliveryStatus(smsRes);
      } catch (smsErr) {
        console.warn('SMS dispatch failed:', smsErr);
      }

      // Refresh seat layout
      const updatedDetails = await fetchTripDetails(selectedTrip.id);
      setTripDetails(updatedDetails);
      setSelectedSeats([]);
    } catch (err: any) {
      alert(err.message || 'Booking payment failed');
      setPaymentStep('SELECT');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Day 16: Hero Search Banner with Ethiopian Branding */}
      <div
        className="glass-panel no-print"
        style={{
          padding: '36px',
          marginBottom: '32px',
          background: 'var(--hero-bg)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: 'var(--hero-shadow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
              <Award size={14} style={{ display: 'inline', marginRight: '4px' }} />
              ABYSSINIA BUS S.C. (አቢሲኒያ አውቶቡስ)
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
              FDRE Ministry of Transport Authorized
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              color: 'var(--text-main)'
            }}
          >
            {isAmharic
              ? 'የኢትዮጵያ የረጅም ርቀት አውቶቡስ ትኬትዎን በመስመር ላይ ይቁረጡ'
              : 'Direct Intercity Coach Travel Across Ethiopia'}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5 }}>
            {isAmharic
              ? 'ከአዲስ አበባ ወደ ሀዋሳ፣ ባሕር ዳር፣ ጎንደር እና ድሬዳዋ አስተማማኝ ጉዞ በቴሌብር እና በንግድ ባንክ ብር ይክፈሉ። ፈጣን የQR ትኬት እና የፖሊስ ማኒፌስት ፈቃድ።'
              : 'Fast, secure online ticketing for Ethiopia’s major transit corridors. Pay seamlessly with Telebirr or CBE Birr, receive instant cryptographic QR e-tickets, and travel stress-free.'}
          </p>
        </div>

        {/* Day 16: Interactive Search Widget */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Trip Type Toggle */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'ONE_WAY'}
                onChange={() => setTripType('ONE_WAY')}
              />
              <span style={{ fontWeight: 700, color: tripType === 'ONE_WAY' ? 'var(--ethiopia-gold)' : 'var(--text-secondary)' }}>
                One-Way (ነጠላ ጉዞ)
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'ROUND_TRIP'}
                onChange={() => setTripType('ROUND_TRIP')}
              />
              <span style={{ fontWeight: 700, color: tripType === 'ROUND_TRIP' ? 'var(--ethiopia-gold)' : 'var(--text-secondary)' }}>
                Round-Trip (የደርሶ መልስ)
              </span>
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'flex-end'
            }}
          >
            <div className="form-group">
              <label className="form-label">{isAmharic ? 'መነሻ ተርሚናል' : 'From / Origin'}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--ethiopia-gold)" />
                <select
                  className="form-select"
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Addis Ababa">Addis Ababa (Autobis Tera / Kality)</option>
                  <option value="Hawassa">Hawassa Central Terminal</option>
                  <option value="Bahir Dar">Bahir Dar Main Terminal</option>
                  <option value="Dire Dawa">Dire Dawa Kezira Terminal</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{isAmharic ? 'መዳረሻ ከተማ' : 'To / Destination'}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--ethiopia-green)" />
                <select
                  className="form-select"
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="All">All Major Destinations (ሁሉም)</option>
                  <option value="Hawassa">Hawassa (ሀዋሳ) - 650 ETB</option>
                  <option value="Bahir Dar">Bahir Dar (ባሕር ዳር) - 1,200 ETB</option>
                  <option value="Dire Dawa">Dire Dawa (ድሬዳዋ) - 1,100 ETB</option>
                  <option value="Gondar">Gondar (ጎንደር) - 1,450 ETB</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{isAmharic ? 'የጉዞ ቀን' : 'Travel Date'}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#38BDF8" />
                <input
                  type="date"
                  className="form-input"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', height: '42px', fontWeight: 800 }}
                onClick={loadTrips}
              >
                <Search size={18} />
                <span>{isAmharic ? 'አውቶቡስ ፈልግ' : 'Search Departures'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Day 16: Trust Signals & Fleet Amenities Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="var(--ethiopia-green)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>100% Guaranteed Seats</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No overbooking policy</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone size={20} color="#0284C7" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Telebirr & CBE Birr</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Instant payment confirmation</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--ethiopia-gold)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>On-Time 05:00 Departures</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Strict morning scheduling</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wifi size={20} color="#8B5CF6" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>AC & Free WiFi</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Purified bottled water on board</div>
            </div>
          </div>
        </div>
      </div>

      {/* Day 16: Popular Ethiopian Routes Showcase */}
      {!selectedTrip && (
        <div className="no-print" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {isAmharic ? 'ተወዳጅ የጉዞ መስመሮች' : 'Popular Ethiopian Intercity Routes'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Daily departures from Addis Ababa terminals (Autobis Tera, Kality, and Lam Beret)
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {popularRoutes.map((r) => (
              <div
                key={r.destination}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                      {r.highlight}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      {r.origin} ➔ {r.destination}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-gold)' }}>
                      {r.baseFare} ETB
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>starting fare</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                  <span>📍 {r.distance}</span>
                  <span>⏱️ ~{r.duration}</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Rest Stops: {r.stops}
                </div>

                <button
                  onClick={() => setSelectedDestination(r.destination)}
                  className="btn btn-secondary"
                  style={{
                    marginTop: 'auto',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>View Departures</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Booking Engine: Day 17 (Trip Details & Seat Selection) and Day 18 (Payment & QR Ticket) */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTrip ? '1.1fr 1.35fr' : '1fr', gap: '28px' }}>
        {/* Left Column: Scheduled Departures List */}
        <div className="no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bus size={22} color="var(--ethiopia-gold)" />
              <span>Available Departures</span>
            </h2>
            <span className="badge badge-gold">{displayedTrips.length} Available</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Searching live trip inventory...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayedTrips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id;
                const depTime = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const arrTime = new Date(trip.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={trip.id}
                    className="glass-panel"
                    onClick={() => handleSelectTrip(trip)}
                    style={{
                      padding: '18px 20px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--ethiopia-gold)' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 0 20px var(--ethiopia-gold-glow)' : 'var(--shadow-md)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span className="badge badge-blue" style={{ marginBottom: '6px', fontSize: '0.72rem' }}>
                          {trip.tripCode}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                          {trip.route.originStation.nameEn} ➔ {trip.route.destinationStation.nameEn}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {trip.route.originStation.nameAm} ➔ {trip.route.destinationStation.nameAm}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-gold)' }}>
                          {trip.fareETB} <span style={{ fontSize: '0.8rem' }}>ETB</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>per passenger</div>
                      </div>
                    </div>

                    {/* Schedule times & Bus metadata */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        padding: '10px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        marginBottom: '12px'
                      }}
                    >
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DEPARTURE</div>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--ethiopia-gold)" />
                          <span>{depTime}</span>
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>EST. ARRIVAL</div>
                        <div style={{ fontWeight: 700 }}>{arrTime}</div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SEATS LEFT</div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: trip.availableSeatsCount < 10 ? '#F87171' : 'var(--ethiopia-green)'
                          }}
                        >
                          {trip.availableSeatsCount} / {trip.totalSeats}
                        </div>
                      </div>
                    </div>

                    {/* Coach Details & Select CTA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        🚌 {trip.bus.busModel} • {trip.bus.busType === 'LUXURY_2X2' ? '2x2 Luxury VIP' : '2x3 Standard'}
                      </div>
                      <button className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                        {isSelected ? 'Selected' : 'Choose Seats'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Day 17 Interactive Seat Selection & Day 18 Checkout / QR Ticket */}
        {selectedTrip && (
          <div>
            <div className="glass-panel no-print" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <span className="badge badge-gold" style={{ marginBottom: '4px', fontSize: '0.75rem' }}>
                    {selectedTrip.bus.busType === 'LUXURY_2X2' ? '2x2 VIP Luxury Coach' : '2x3 Standard High-Capacity'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Select Seat(s) on {selectedTrip.tripCode}
                  </h3>
                </div>

                {selectedSeats.length > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Total ({selectedSeats.length} seats)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-gold)' }}>
                      {grandTotalETB} ETB
                    </div>
                  </div>
                )}
              </div>

              {/* Day 17: Seat Map Component */}
              {detailsLoading || !tripDetails ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>Rendering bus seat layout...</div>
              ) : (
                <SeatMap
                  layout={tripDetails.seatLayout}
                  selectedSeats={selectedSeats}
                  onToggleSeat={handleToggleSeat}
                />
              )}

              {/* Day 17: Passenger Registration & Checkout Form */}
              {selectedSeats.length > 0 && paymentStep === 'SELECT' && (
                <form onSubmit={handleCheckout} style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="var(--ethiopia-gold)" />
                    <span>Passenger Information (Mandatory for Checkpoint Manifest)</span>
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name (እንደ መታወቂያ)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Abebe Kebede"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone (+251 for SMS Ticket)</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+251 91 123 4567"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Kebele / National ID / Fayda / Passport Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. KB-04-89104 or Fanus Digital ID"
                      value={passengerId}
                      onChange={(e) => setPassengerId(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      * Verified at Federal Police & Regional transport highway checkpoints.
                    </div>
                  </div>

                  {/* Day 18: Payment Gateway Options */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Choose Digital Payment Gateway
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
                        <div style={{ fontWeight: 800, color: '#38BDF8', fontSize: '0.95rem' }}>telebirr</div>
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
                        <div style={{ fontWeight: 800, color: '#C084FC', fontSize: '0.95rem' }}>CBE Birr</div>
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
                        <div style={{ fontWeight: 800, color: 'var(--ethiopia-green)', fontSize: '0.95rem' }}>Chapa</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Visa / Awash</div>
                      </div>
                    </div>
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      padding: '14px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      marginBottom: '18px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Base Fare ({selectedSeats.length}x {selectedTrip.fareETB} ETB):
                      </span>
                      <span>{baseFareTotal} ETB</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Station Facility & Security Fee:</span>
                      <span>{terminalFee} ETB</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                        color: 'var(--text-gold)',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '8px',
                        marginTop: '6px'
                      }}
                    >
                      <span>Grand Total:</span>
                      <span>{grandTotalETB} ETB</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-telebirr"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
                  >
                    <CreditCard size={18} />
                    <span>
                      {submitting
                        ? 'Connecting to Telebirr Gateway...'
                        : `Pay ${grandTotalETB} ETB via ${paymentMethod}`}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Day 18: Confirmed QR Ticket & SMS Simulation View */}
            {confirmedBooking && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '24px',
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '2px solid var(--ethiopia-green)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <CheckCircle2 size={32} color="var(--ethiopia-green)" />
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ethiopia-green)' }}>
                      Booking Confirmed & Ticket Issued!
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Booking PNR: <strong style={{ color: 'var(--text-main)' }}>{confirmedBooking.bookingReference}</strong> • Paid via {confirmedBooking.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Individual QR Boarding Passes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {confirmedBooking.tickets.map((tkt: any) => (
                    <div
                      key={tkt.id}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        background: 'var(--bg-input)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-subtle)',
                        alignItems: 'center'
                      }}
                    >
                      {/* Verifiable QR Code */}
                      <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px' }}>
                        <img
                          src={tkt.qrCodeDataUrl}
                          alt="Ticket QR"
                          style={{ width: '105px', height: '105px', display: 'block' }}
                        />
                      </div>

                      <div style={{ flex: 1, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>
                            SEAT {tkt.seatNumber}
                          </span>
                          <span style={{ fontWeight: 800, color: 'var(--text-gold)' }}>{tkt.ticketNumber}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{tkt.passengerName}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          ID: {tkt.passengerIdNumber} • Phone: {tkt.passengerPhone}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                          Route: {confirmedBooking.trip.route} | Coach: {confirmedBooking.trip.busPlate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day 18: Simulated SMS Notification Banner */}
                {smsDeliveryStatus && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(2, 132, 199, 0.15)',
                      borderRadius: '8px',
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <Smartphone size={18} color="#38BDF8" />
                    <div>
                      <span style={{ fontWeight: 700, color: '#38BDF8' }}>
                        Ethio Telecom SMS Gateway Delivered to {smsDeliveryStatus.recipientPhone}:
                      </span>
                      <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>
                        "{smsDeliveryStatus.message}"
                      </div>
                    </div>
                  </div>
                )}

                <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>
                    <Printer size={16} />
                    <span>Print Boarding Pass</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTrip(null);
                      setConfirmedBooking(null);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
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
export default PassengerPortal;
