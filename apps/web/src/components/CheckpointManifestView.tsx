import React, { useState, useEffect } from 'react';
import { fetchTrips, fetchManifest } from '../lib/api';
import { ShieldCheck, Printer, Bus, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CheckpointManifestViewProps {
  isAmharic: boolean;
}

export const CheckpointManifestView: React.FC<CheckpointManifestViewProps> = ({ isAmharic }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      const data = await fetchTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTripId(data[0].id);
        loadManifest(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadManifest(tripId: string) {
    try {
      setLoading(true);
      const data = await fetchManifest(tripId);
      setManifest(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Manifest Selector Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '6px' }}>
            <ShieldCheck size={14} />
            <span>FDRE TRANSPORT & CHECKPOINT REGULATION</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {isAmharic ? 'የፌደራል ፖሊስ ፍተሻ የመንገደኞች ማኒፌስት' : 'Official Police Checkpoint Passenger Manifest'}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Mandatory legal document for intercity transit through federal and regional security checkpoints.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-select"
            value={selectedTripId}
            onChange={e => {
              setSelectedTripId(e.target.value);
              loadManifest(e.target.value);
            }}
            style={{ minWidth: '300px' }}
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.tripCode}: {t.route.originStation.city} ➔ {t.route.destinationStation.city} ({t.bus.plateNumber})
              </option>
            ))}
          </select>

          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={16} />
            <span>Print Official Manifest</span>
          </button>
        </div>
      </div>

      {/* Official Manifest Document */}
      {loading || !manifest ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>Generating checkpoint manifest...</div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          color: '#000000',
          padding: '36px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          fontFamily: 'serif'
        }}>
          {/* Official Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase' }}>
              Federal Democratic Republic of Ethiopia
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ የትራንስፖርትና ሎጂስቲክስ ሚኒስቴር
            </div>
            <div style={{ fontSize: '0.85rem', color: '#444' }}>
              Ministry of Transport and Logistics • Federal Police Checkpoint Manifest
            </div>
            <div style={{ marginTop: '8px', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em' }}>
              INTERCITY PASSENGER MANIFEST / የመንገደኞች ዝርዝር ማኒፌስት
            </div>
          </div>

          {/* Trip & Vehicle Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            fontSize: '0.85rem',
            padding: '12px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>OPERATOR / ድርጅት:</div>
              <div style={{ fontWeight: 800 }}>Abyssinia Bus S.C.</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>BUS PLATE / ታርጋ:</div>
              <div style={{ fontWeight: 800 }}>{manifest.tripDetails.busPlateNumber} ({manifest.tripDetails.busSideNumber})</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>DRIVER / አሽከርካሪ:</div>
              <div style={{ fontWeight: 800 }}>{manifest.tripDetails.driverName}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>CONDUCTOR / ረዳት:</div>
              <div style={{ fontWeight: 800 }}>{manifest.tripDetails.conductorName}</div>
            </div>

            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>ROUTE / መነሻ - መዳረሻ:</div>
              <div style={{ fontWeight: 800 }}>{manifest.tripDetails.routeOrigin} ➔ {manifest.tripDetails.routeDestination}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>DEPARTURE TIME:</div>
              <div style={{ fontWeight: 800 }}>{new Date(manifest.tripDetails.departureTime).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>CAPACITY / TOTAL SEATS:</div>
              <div style={{ fontWeight: 800 }}>{manifest.passengerStats.totalCapacity} Seats</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>BOARDED / REGISTERED:</div>
              <div style={{ fontWeight: 800 }}>{manifest.passengerStats.boardedCount} / {manifest.passengerStats.totalBooked} Passengers</div>
            </div>
          </div>

          {/* Passenger Manifest Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#FFFFFF', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', border: '1px solid #334155', width: '50px' }}>SEAT</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>PASSENGER NAME (ሙሉ ስም)</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>PHONE (ስልክ)</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>KEBELE / NATIONAL ID (መታወቂያ)</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>BOARDING STATION</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>TICKET NO.</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155', textAlign: 'center' }}>BOARDED</th>
              </tr>
            </thead>
            <tbody>
              {manifest.passengers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                    No passengers booked yet for this trip.
                  </td>
                </tr>
              ) : (
                manifest.passengers.map((p: any, idx: number) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: 800 }}>{p.seatNumber}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{p.passengerName}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>{p.passengerPhone}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontFamily: 'monospace' }}>{p.nationalIdNumber}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>{p.boardingPoint}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontFamily: 'monospace' }}>{p.ticketNumber}</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                      {p.isBoarded ? (
                        <span style={{ color: '#059669', fontWeight: 800 }}>✓ YES</span>
                      ) : (
                        <span style={{ color: '#DC2626' }}>NO</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Legal Certification & Signatures Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid #94A3B8'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '40px' }}>DRIVER SIGNATURE / የአሽከርካሪ ፊርማ:</div>
              <div style={{ borderBottom: '1px solid #000' }}></div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Name: {manifest.tripDetails.driverName}</div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '40px' }}>CONDUCTOR SIGNATURE / የረዳት ፊርማ:</div>
              <div style={{ borderBottom: '1px solid #000' }}></div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Name: {manifest.tripDetails.conductorName}</div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '40px' }}>CHECKPOINT POLICE STAMP / የፖሊስ ማህተም:</div>
              <div style={{ border: '1px dashed #64748B', height: '60px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem' }}>
                Federal Police Checkpoint Seal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
