import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Shield,
  Radio,
  MapPin,
  Compass,
  FileText,
  Phone,
  RefreshCw,
  X,
  Gauge,
  AlertOctagon,
  Truck
} from 'lucide-react';

interface DriverPortalProps {
  isAmharic: boolean;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({ isAmharic }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showManifestModal, setShowManifestModal] = useState(false);
  const [manifestData, setManifestData] = useState<any>(null);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [delayReason, setDelayReason] = useState('Heavy traffic & Federal Police checkpoint inspection');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState('MECHANICAL_BREAKDOWN');
  const [incidentSeverity, setIncidentSeverity] = useState('MEDIUM');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('Near Mojo Expressway Junction');

  // Day 23 GPS Transmission Simulation
  const [isGpsTransmitting, setIsGpsTransmitting] = useState(false);
  const [gpsMilestoneIndex, setGpsMilestoneIndex] = useState(1);
  const [gpsCurrentSpeed, setGpsCurrentSpeed] = useState(74);

  // Simulated Highway Milestones along Addis Ababa -> Hawassa corridor
  const highwayMilestones = [
    { name: 'Kality Terminal Departure Gate', lat: 8.9056, lng: 38.7618, speed: 30 },
    { name: 'Tulu Dimtu Toll Gate - Expressway Start', lat: 8.8241, lng: 38.8021, speed: 78 },
    { name: 'Mojo Expressway Interchange - Km 64', lat: 8.5982, lng: 39.1234, speed: 76 },
    { name: 'Batu / Lake Ziway Rest & Meal Area - Km 160', lat: 7.9333, lng: 38.7167, speed: 50 },
    { name: 'Shashemene Awasho Roundabout - Km 250', lat: 7.2000, lng: 38.6000, speed: 45 },
    { name: 'Hawassa Central Intercity Terminal - Arrival', lat: 7.0504, lng: 38.4763, speed: 0 }
  ];

  useEffect(() => {
    loadDriverTrips();
  }, []);

  // Day 23 GPS Ping Interval Loop
  useEffect(() => {
    let interval: any = null;
    if (isGpsTransmitting && selectedTrip) {
      interval = setInterval(() => {
        setGpsMilestoneIndex((prev) => {
          const next = (prev + 1) % highwayMilestones.length;
          const milestone = highwayMilestones[next];
          setGpsCurrentSpeed(milestone.speed);

          // Ping API backend
          fetch('http://localhost:4000/api/tracking/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tripId: selectedTrip.id,
              latitude: milestone.lat,
              longitude: milestone.lng,
              speedKmH: milestone.speed,
              milestone: milestone.name
            })
          }).catch((err) => console.warn('GPS ping failed:', err));

          return next;
        });
      }, 5000); // Send GPS ping every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isGpsTransmitting, selectedTrip]);

  async function loadDriverTrips() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/driver/today-trips');
      const data = await res.json();
      setTrips(data.trips || []);
      if (data.trips && data.trips.length > 0) {
        setSelectedTrip(data.trips[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTrip() {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`http://localhost:4000/api/driver/trip/${selectedTrip.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMilestone: 'Departed Kality Terminal Gate' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start trip');
      alert(`Trip ${selectedTrip.tripCode} is now IN_TRANSIT! GPS broadcasting activated.`);
      setIsGpsTransmitting(true);
      loadDriverTrips();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleEndTrip() {
    if (!selectedTrip) return;
    if (!confirm(`Are you sure you want to mark Trip ${selectedTrip.tripCode} as ARRIVED at destination?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/driver/trip/${selectedTrip.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arrivalMilestone: 'Arrived at Destination Terminal' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to end trip');
      alert(`Trip ${selectedTrip.tripCode} has officially ARRIVED. Safe journey concluded.`);
      setIsGpsTransmitting(false);
      loadDriverTrips();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleViewPassengers() {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`http://localhost:4000/api/driver/trip/${selectedTrip.id}/passengers`);
      const data = await res.json();
      setManifestData(data);
      setShowManifestModal(true);
    } catch (e) {
      alert('Error fetching passengers');
    }
  }

  async function handleSubmitDelay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      const res = await fetch(`http://localhost:4000/api/driver/trip/${selectedTrip.id}/delay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delayMinutes, delayReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Delay reported: +${delayMinutes} mins.`);
      setShowDelayModal(false);
      loadDriverTrips();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSubmitIncident(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      const res = await fetch(`http://localhost:4000/api/driver/trip/${selectedTrip.id}/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType,
          severity: incidentSeverity,
          description: incidentDesc,
          locationName: incidentLocation
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Incident recorded and flagged to Central Dispatch!`);
      setShowIncidentModal(false);
      setIncidentDesc('');
      loadDriverTrips();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const currentMilestone = highwayMilestones[gpsMilestoneIndex];

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 30px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid var(--ethiopia-gold)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={28} color="var(--ethiopia-gold)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                DRIVER & VEHICLE PORTAL
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                FDRE Transport Certified
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '4px' }}>
              {isAmharic ? 'የአሽከርካሪ ጉዞ መቆጣጠሪያ' : "Driver Operations & Live Highway Cockpit"}
            </h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Captain: <strong>Kebede Worku (ID: DRV-017)</strong> | Senior Highway Pilot
            </div>
          </div>
        </div>

        {/* Live GPS Broadcast Switch */}
        <div
          style={{
            background: isGpsTransmitting ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.7)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: isGpsTransmitting ? '1px solid var(--ethiopia-green)' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: isGpsTransmitting ? 'var(--ethiopia-green)' : 'var(--text-muted)', fontWeight: 800 }}>
              {isGpsTransmitting ? '● GPS BROADCASTING LIVE' : '○ GPS STANDBY'}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              {isGpsTransmitting ? `${gpsCurrentSpeed} km/h (Limit: 80)` : 'Offline'}
            </div>
          </div>
          <button
            onClick={() => setIsGpsTransmitting(!isGpsTransmitting)}
            className={`btn ${isGpsTransmitting ? 'btn-green' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <Radio size={16} />
            <span>{isGpsTransmitting ? 'Stop GPS' : 'Start GPS'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Driver Today's Trip & Actions, Right Live Highway Telemetry */}
      {selectedTrip ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left Column: Day 22 Today's Trip & Operational Functions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Today's Trip Main Card */}
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>
                    {selectedTrip.tripCode}
                  </span>
                  <span className={`badge ${
                    selectedTrip.status === 'IN_TRANSIT' ? 'badge-green' :
                    selectedTrip.status === 'DELAYED' ? 'badge-red' :
                    selectedTrip.status === 'ARRIVED' ? 'badge-blue' : 'badge-gold'
                  }`} style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                    STATUS: {selectedTrip.status}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '8px' }}>
                    {selectedTrip.route}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedTrip.routeAm}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-gold)' }}>
                    05:00 <span style={{ fontSize: '0.85rem' }}>AM</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduled Departure</div>
                </div>
              </div>

              {/* Trip Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ASSIGNED VEHICLE</div>
                  <div style={{ fontWeight: 800, marginTop: '2px', color: '#FFF' }}>
                    {selectedTrip.busPlate} ({selectedTrip.busSide})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedTrip.busModel}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>PASSENGERS</div>
                  <div style={{ fontWeight: 800, marginTop: '2px', color: 'var(--ethiopia-green)', fontSize: '1.05rem' }}>
                    {selectedTrip.totalPassengers} / {selectedTrip.totalSeats}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedTrip.boardedPassengers} Boarded ({selectedTrip.remainingToBoard} Left)
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DEPARTURE GATE</div>
                  <div style={{ fontWeight: 800, marginTop: '2px', color: '#FFF' }}>
                    {selectedTrip.originTerminal}
                  </div>
                </div>
              </div>

              {/* Primary Lifecycle CTA Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <button
                  onClick={handleStartTrip}
                  disabled={selectedTrip.status === 'IN_TRANSIT' || selectedTrip.status === 'ARRIVED'}
                  className="btn btn-green"
                  style={{ padding: '14px', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  <Play size={18} />
                  <span>Start Highway Trip</span>
                </button>

                <button
                  onClick={handleEndTrip}
                  disabled={selectedTrip.status !== 'IN_TRANSIT'}
                  className="btn btn-primary"
                  style={{ padding: '14px', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  <CheckCircle size={18} />
                  <span>Mark Trip Arrived</span>
                </button>
              </div>

              {/* Secondary Driver Functions: Manifest, Delay, Incident */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  onClick={handleViewPassengers}
                  className="btn btn-secondary"
                  style={{ padding: '10px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Users size={16} />
                  <span>Manifest ({selectedTrip.totalPassengers})</span>
                </button>

                <button
                  onClick={() => setShowDelayModal(true)}
                  className="btn btn-secondary"
                  style={{ padding: '10px', fontSize: '0.8rem', justifyContent: 'center', border: '1px solid var(--ethiopia-gold)', color: 'var(--text-gold)' }}
                >
                  <Clock size={16} />
                  <span>Report Delay</span>
                </button>

                <button
                  onClick={() => setShowIncidentModal(true)}
                  className="btn btn-secondary"
                  style={{ padding: '10px', fontSize: '0.8rem', justifyContent: 'center', border: '1px solid #F87171', color: '#FCA5A5' }}
                >
                  <AlertTriangle size={16} />
                  <span>Report Incident</span>
                </button>
              </div>
            </div>

            {/* Intermediate Rest Stops Route Card */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--ethiopia-gold)" />
                <span>Scheduled Highway Stops & Meal Breaks</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🟢 05:00 - Addis Ababa Kality Gate</span>
                  <span style={{ color: 'var(--text-muted)' }}>Origin</span>
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>☕ 06:15 - Mojo Toll Junction Rest</span>
                  <span style={{ color: 'var(--text-gold)' }}>15 Min Rest Stop</span>
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🍽️ 08:30 - Batu Lake Ziway Resort Area</span>
                  <span style={{ color: 'var(--text-gold)' }}>Breakfast Stop</span>
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🏁 09:30 - Hawassa Central Hub</span>
                  <span style={{ color: 'var(--ethiopia-green)' }}>Destination</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Day 23 Live GPS Telemetry Cockpit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              className="glass-panel"
              style={{
                padding: '24px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(24, 34, 52, 0.98) 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={20} color="#38BDF8" />
                  <span>Live Vehicle GPS Telemetry</span>
                </h3>
                <span className="badge badge-blue">
                  {isGpsTransmitting ? 'TRANSMITTING' : 'OFFLINE'}
                </span>
              </div>

              {/* Speedometer Gauge Display */}
              <div
                style={{
                  background: '#0B0F19',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '18px',
                  border: gpsCurrentSpeed > 80 ? '2px solid #F87171' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT VEHICLE SPEED</div>
                <div style={{ fontSize: '3.2rem', fontWeight: 900, color: gpsCurrentSpeed > 80 ? '#F87171' : 'var(--ethiopia-green)', lineHeight: 1.1 }}>
                  {isGpsTransmitting ? gpsCurrentSpeed : 0}
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '6px' }}>km/h</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: gpsCurrentSpeed > 80 ? '#F87171' : 'var(--text-muted)', marginTop: '4px' }}>
                  {gpsCurrentSpeed > 80 ? '⚠️ WARNING: EXCEEDING 80 KM/H NATIONAL SPEED LIMIT' : 'FDRE Highway Speed Regulation: 80 km/h max'}
                </div>
              </div>

              {/* Current Milestone Location */}
              <div style={{ background: '#0F172A', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT HIGHWAY LOCATION</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#38BDF8', marginTop: '4px' }}>
                  📍 {currentMilestone.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  GPS: {currentMilestone.lat.toFixed(4)}° N, {currentMilestone.lng.toFixed(4)}° E
                </div>
              </div>

              {/* Pipeline Diagnostic Signals */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Driver Phone GPS:</span>
                  <strong style={{ color: 'var(--ethiopia-green)' }}>Connected (GPS Lock)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Telemetry Ingestion:</span>
                  <strong style={{ color: '#38BDF8' }}>POST /api/tracking/ping (200 OK)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dashboard Sync:</span>
                  <strong style={{ color: 'var(--text-gold)' }}>Active Broadcast</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Passenger Notification:</span>
                  <strong style={{ color: '#A855F7' }}>Real-time Milestone Available</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center' }}>No assigned trips for driver today.</div>
      )}

      {/* Manifest Modal */}
      {showManifestModal && manifestData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Passenger Manifest — {manifestData.tripCode}
              </h3>
              <button onClick={() => setShowManifestModal(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {manifestData.passengers.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0F172A', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div>
                    <span className="badge badge-gold" style={{ marginRight: '8px' }}>Seat {p.seatNumber}</span>
                    <strong style={{ color: '#FFF' }}>{p.passengerName}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                      ID: {p.passengerIdNumber} • Phone: {p.passengerPhone}
                    </div>
                  </div>
                  <span className={`badge ${p.status === 'BOARDED' ? 'badge-green' : 'badge-gold'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Delay Modal */}
      {showDelayModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>Report Highway Delay</h3>
            <form onSubmit={handleSubmitDelay} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Estimated Delay Minutes</label>
                <input
                  type="number"
                  className="form-input"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delay Reason</label>
                <input
                  type="text"
                  className="form-input"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowDelayModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Broadcast Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showIncidentModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '24px', border: '1px solid #F87171' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: '#FCA5A5' }}>
              Report Road Incident to Dispatch
            </h3>
            <form onSubmit={handleSubmitIncident} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Incident Type</label>
                <select
                  className="form-select"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                >
                  <option value="MECHANICAL_BREAKDOWN">Mechanical Breakdown / Engine Issue</option>
                  <option value="FLAT_TIRE">Flat Tire Replacement</option>
                  <option value="ROAD_BLOCK">Highway Road Block / Landslide</option>
                  <option value="POLICE_CHECKPOINT">Extended Federal Police Search</option>
                  <option value="PASSENGER_EMERGENCY">Passenger Medical Emergency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Highway Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Situation Details</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Detail the issue, assistance needed, or replacement coach required"
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowIncidentModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 1, background: '#DC2626', color: '#FFF' }}>
                  Transmit Incident Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DriverPortal;
