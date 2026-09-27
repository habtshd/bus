import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchFleet, fetchRoutes, scheduleTrip, updateTripStatus, updateBusStatus, createBus } from '../lib/api';
import { Radio, Plus, Bus, Clock, User, Phone, CheckCircle2, AlertOctagon, Wrench, Shield, ArrowRight } from 'lucide-react';

interface OperationsDispatcherProps {
  isAmharic: boolean;
}

export const OperationsDispatcher: React.FC<OperationsDispatcherProps> = ({ isAmharic }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);

  // New Trip Form
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedBusId, setSelectedBusId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+251 91 ');
  const [conductorName, setConductorName] = useState('');
  const [conductorPhone, setConductorPhone] = useState('+251 92 ');
  const [depDateTime, setDepDateTime] = useState('');
  const [fareETB, setFareETB] = useState('650');

  // New Bus Form
  const [newPlate, setNewPlate] = useState('');
  const [newSide, setNewSide] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('LUXURY_2X2');
  const [newSeats, setNewSeats] = useState('45');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [tripsData, fleetData, routesData] = await Promise.all([
        fetchTrips(),
        fetchFleet(),
        fetchRoutes()
      ]);
      setTrips(tripsData);
      setFleet(fleetData);
      setRoutes(routesData);
      if (routesData.length > 0) setSelectedRouteId(routesData[0].id);
      if (fleetData.length > 0) setSelectedBusId(fleetData[0].id);

      // Default departure date to tomorrow 06:00 AM
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(6, 0, 0, 0);
      setDepDateTime(tmrw.toISOString().slice(0, 16));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    try {
      const selectedRoute = routes.find(r => r.id === selectedRouteId);
      const tripCode = `ETB-${selectedRoute?.originStation.city.slice(0, 2).toUpperCase()}-${selectedRoute?.destinationStation.city.slice(0, 2).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

      await scheduleTrip({
        tripCode,
        routeId: selectedRouteId,
        busId: selectedBusId,
        driverName,
        driverPhone,
        conductorName,
        conductorPhone,
        departureTime: new Date(depDateTime).toISOString(),
        fareETB: parseFloat(fareETB)
      });

      setShowScheduleModal(false);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule trip');
    }
  }

  async function handleCreateBus(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createBus({
        plateNumber: newPlate,
        sideNumber: newSide,
        busModel: newModel || 'Zhongtong Intercity Coach',
        busType: newType,
        totalSeats: parseInt(newSeats, 10),
        amenities: newType === 'LUXURY_2X2' ? 'AC,WiFi,Reclining Seats,Water' : 'Audio System,Curtains,Reading Lights'
      });

      setShowBusModal(false);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create bus');
    }
  }

  async function handleAdvanceStatus(tripId: string, nextStatus: string) {
    try {
      await updateTripStatus(tripId, nextStatus);
      await loadAll();
    } catch (e) {
      alert('Failed to update trip status');
    }
  }

  async function handleToggleBusStatus(busId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      await updateBusStatus(busId, nextStatus);
      await loadAll();
    } catch (e) {
      alert('Failed to toggle bus status');
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header with Dispatch Toolbar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '6px' }}>
            <Radio size={14} />
            <span>CENTRAL FLEET & DISPATCH CONTROL</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {isAmharic ? 'የስምሪት እና የጉዞ መቆጣጠሪያ ማዕከል' : 'Operations & Dispatch Control Center'}
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time trip departure coordination, driver and bus assignments, and fleet maintenance tracking.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowBusModal(true)} className="btn btn-secondary">
            <Bus size={16} />
            <span>Add Bus to Fleet</span>
          </button>
          <button onClick={() => setShowScheduleModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Schedule New Trip</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Live Trip Dispatch Board, Right Active Fleet Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Live Trip Dispatch Board */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--ethiopia-gold)" />
            <span>{isAmharic ? 'የቀጥታ ጉዞዎች ስምሪት ሰሌዳ' : 'Live Trip Dispatch Board'}</span>
            <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{trips.length} Scheduled</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trips.map(trip => {
              const depDate = new Date(trip.departureTime);
              const depFormatted = depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateFormatted = depDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={trip.id} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>{trip.tripCode}</span>
                        <span className={`badge ${
                          trip.status === 'BOARDING' ? 'badge-green' :
                          trip.status === 'DEPARTED' ? 'badge-blue' :
                          trip.status === 'IN_TRANSIT' ? 'badge-blue' : 'badge-gold'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
                        {trip.route.originStation.nameEn} ➔ {trip.route.destinationStation.nameEn}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {trip.route.originStation.nameAm} ➔ {trip.route.destinationStation.nameAm}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-gold)' }}>
                        {dateFormatted} at {depFormatted}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Fare: {trip.fareETB} ETB
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Crew Bar */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>BUS & PLATE</div>
                      <div style={{ fontWeight: 700 }}>{trip.bus.plateNumber} ({trip.bus.sideNumber})</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DRIVER</div>
                      <div style={{ fontWeight: 700 }}>{trip.driverName}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CONDUCTOR</div>
                      <div style={{ fontWeight: 700 }}>{trip.conductorName}</div>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span>Booked: <strong>{trip.bookedSeatsCount}</strong> / {trip.totalSeats} seats</span>
                      <span style={{ fontWeight: 700, color: trip.occupancyPercent > 70 ? 'var(--ethiopia-green)' : 'var(--text-gold)' }}>
                        {trip.occupancyPercent}% Occupancy
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${trip.occupancyPercent}%`,
                        background: trip.occupancyPercent > 70 ? 'var(--ethiopia-green)' : 'var(--ethiopia-gold)',
                        borderRadius: '3px'
                      }}></div>
                    </div>
                  </div>

                  {/* Dispatcher Actions */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {trip.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleAdvanceStatus(trip.id, 'BOARDING')}
                        className="btn btn-green"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <CheckCircle2 size={14} /> Start Passenger Boarding
                      </button>
                    )}

                    {trip.status === 'BOARDING' && (
                      <button
                        onClick={() => handleAdvanceStatus(trip.id, 'DEPARTED')}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <ArrowRight size={14} /> Depart Bus from Terminal
                      </button>
                    )}

                    {trip.status === 'DEPARTED' && (
                      <button
                        onClick={() => handleAdvanceStatus(trip.id, 'IN_TRANSIT')}
                        className="btn btn-telebirr"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        Mark Highway In-Transit
                      </button>
                    )}

                    {trip.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleAdvanceStatus(trip.id, 'ARRIVED')}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#059669', color: '#FFF' }}
                      >
                        Confirm Arrival at Destination
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const reason = prompt('Enter delay or incident note (e.g. Mojo checkpoint queue / flat tire):');
                        if (reason) handleAdvanceStatus(trip.id, 'DELAYED');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#F87171' }}
                    >
                      Report Delay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fleet Management & Maintenance */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bus size={20} color="var(--ethiopia-green)" />
            <span>{isAmharic ? 'የአውቶቡሶች ሁኔታ እና ጥገና' : 'Fleet Status & Availability'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {fleet.map(bus => (
              <div key={bus.id} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>{bus.sideNumber}</span>
                    <strong style={{ marginLeft: '6px', fontSize: '0.95rem' }}>{bus.plateNumber}</strong>
                  </div>
                  <span className={`badge ${bus.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                    {bus.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {bus.busModel} • {bus.busType === 'LUXURY_2X2' ? '2x2 VIP (45 seats)' : '2x3 Standard (59 seats)'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Amenities: {bus.amenities}
                  </div>
                  <button
                    onClick={() => handleToggleBusStatus(bus.id, bus.status)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    <Wrench size={12} />
                    <span>{bus.status === 'ACTIVE' ? 'Send to Maintenance' : 'Set Active'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Trip Modal */}
      {showScheduleModal && (
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
          <div className="glass-panel" style={{ maxWidth: '540px', width: '100%', padding: '32px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '18px' }}>
              Schedule New Intercity Trip
            </h3>

            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Route</label>
                <select
                  className="form-select"
                  value={selectedRouteId}
                  onChange={e => setSelectedRouteId(e.target.value)}
                  required
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.originStation.nameEn} ➔ {r.destinationStation.nameEn} ({r.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Bus</label>
                <select
                  className="form-select"
                  value={selectedBusId}
                  onChange={e => setSelectedBusId(e.target.value)}
                  required
                >
                  {fleet.filter(b => b.status === 'ACTIVE').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.sideNumber} - {b.plateNumber} ({b.busModel} - {b.totalSeats} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Driver Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kebede Worku"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Driver Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+251 91 ..."
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Conductor Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alemu Girma"
                    value={conductorName}
                    onChange={e => setConductorName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Conductor Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+251 92 ..."
                    value={conductorPhone}
                    onChange={e => setConductorPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Departure Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={depDateTime}
                    onChange={e => setDepDateTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fare (ETB)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fareETB}
                    onChange={e => setFareETB(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Schedule Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showBusModal && (
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
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '32px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '18px' }}>
              Add New Bus to Fleet
            </h3>

            <form onSubmit={handleCreateBus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Plate Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 3-78901 ET"
                    value={newPlate}
                    onChange={e => setNewPlate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Side Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. BUS-104"
                    value={newSide}
                    onChange={e => setNewSide(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bus Model / Make</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Zhongtong Navigator VIP"
                  value={newModel}
                  onChange={e => setNewModel(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Layout Type</label>
                  <select
                    className="form-select"
                    value={newType}
                    onChange={e => {
                      setNewType(e.target.value);
                      setNewSeats(e.target.value === 'LUXURY_2X2' ? '45' : '59');
                    }}
                  >
                    <option value="LUXURY_2X2">2x2 Luxury VIP (45 seats)</option>
                    <option value="STANDARD_2X3">2x3 Standard (59 seats)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Seat Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newSeats}
                    onChange={e => setNewSeats(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowBusModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
