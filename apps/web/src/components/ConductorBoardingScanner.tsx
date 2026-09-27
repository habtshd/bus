import React, { useState, useEffect } from 'react';
import { fetchTrips, verifyTicketQr, fetchTripDetails } from '../lib/api';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Search, Bus, UserCheck, ShieldAlert } from 'lucide-react';

interface ConductorBoardingScannerProps {
  isAmharic: boolean;
}

export const ConductorBoardingScanner: React.FC<ConductorBoardingScannerProps> = ({ isAmharic }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [boardedCount, setBoardedCount] = useState(2);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      const data = await fetchTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleVerify(payload: string) {
    if (!payload.trim()) return;
    try {
      setScanning(true);
      setScanResult(null);
      const res = await verifyTicketQr(payload, selectedTrip?.id);
      setScanResult(res);
      if (res.valid) {
        setBoardedCount(prev => prev + 1);
      }
    } catch (err: any) {
      setScanResult({
        valid: false,
        code: 'NETWORK_ERROR',
        message: 'Could not connect to verification server.'
      });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Conductor Scanner Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 0 20px var(--ethiopia-gold-glow)'
        }}>
          <QrCode size={36} color="var(--ethiopia-gold)" />
        </div>

        <div className="badge badge-gold" style={{ marginBottom: '8px' }}>
          {isAmharic ? 'የአውቶቡስ በር መግቢያ ፈታሽ' : 'DOOR BOARDING & SCANNER MODULE'}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isAmharic ? 'የኮንዳክተር QR ትኬት ማረጋገጫ' : 'Conductor High-Speed QR Scanner'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
          Instant ticket verification, seat validation, and passenger manifest check-in at the bus entrance door.
        </p>

        {/* Active Trip Selector */}
        {selectedTrip && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Bus size={20} color="var(--ethiopia-gold)" />
            <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 800 }}>
                {selectedTrip.tripCode} | {selectedTrip.route.originStation.city} ➔ {selectedTrip.route.destinationStation.city}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Bus: <strong>{selectedTrip.bus.plateNumber}</strong> • Conductor: <strong>Alemu Girma</strong>
              </div>
            </div>
            <div className="badge badge-green" style={{ marginLeft: '12px' }}>
              {boardedCount} / {selectedTrip.totalSeats} Boarded
            </div>
          </div>
        )}
      </div>

      {/* Camera Simulator & QR Input */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          {isAmharic ? 'ትኬት ስካን ያድርጉ ወይም ኮድ ያስገቡ' : 'Scan Ticket QR or Enter Ticket / Phone'}
        </h3>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. TKT-1003 or paste QR payload"
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify(qrInput)}
            style={{ flex: 1, fontSize: '1.05rem', fontWeight: 600 }}
          />
          <button
            onClick={() => handleVerify(qrInput)}
            disabled={scanning || !qrInput.trim()}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            <UserCheck size={18} />
            <span>Verify</span>
          </button>
        </div>

        {/* Demo Fast Scan Simulators */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            DEMO QUICK SCENARIOS:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setQrInput('TKT-1003');
                handleVerify('TKT-1003');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              🟢 Scan Valid Ticket (TKT-1003)
            </button>

            <button
              onClick={() => {
                setQrInput('TKT-1001');
                handleVerify('TKT-1001');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              🔴 Test Duplicate Boarding (TKT-1001)
            </button>

            <button
              onClick={() => {
                setQrInput('FAKE-TICKET-999');
                handleVerify('FAKE-TICKET-999');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              ⚠️ Test Fake / Invalid Code
            </button>
          </div>
        </div>

        {/* Verification Result Feedback Banner */}
        {scanResult && (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: scanResult.valid
              ? 'rgba(16, 185, 129, 0.15)'
              : scanResult.code === 'ALREADY_BOARDED'
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(245, 158, 11, 0.2)',
            border: `2px solid ${
              scanResult.valid
                ? 'var(--ethiopia-green)'
                : scanResult.code === 'ALREADY_BOARDED'
                ? 'var(--ethiopia-red)'
                : 'var(--ethiopia-gold)'
            }`,
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              {scanResult.valid ? (
                <CheckCircle2 size={32} color="var(--ethiopia-green)" />
              ) : scanResult.code === 'ALREADY_BOARDED' ? (
                <ShieldAlert size={32} color="var(--ethiopia-red)" />
              ) : (
                <AlertTriangle size={32} color="var(--ethiopia-gold)" />
              )}

              <div>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: scanResult.valid
                    ? 'var(--ethiopia-green)'
                    : scanResult.code === 'ALREADY_BOARDED'
                    ? '#F87171'
                    : 'var(--text-gold)'
                }}>
                  {scanResult.valid ? 'VALID TICKET - BOARDING APPROVED' : scanResult.code}
                </h4>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {scanResult.message}
                </div>
              </div>
            </div>

            {scanResult.passenger && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#0F172A',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Passenger: </span>
                  <strong>{scanResult.passenger.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Seat: </span>
                  <span className="badge badge-gold" style={{ fontSize: '0.9rem' }}>{scanResult.passenger.seatNumber}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>ID Number: </span>
                  <strong>{scanResult.passenger.idNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Boarded Time: </span>
                  <strong>{new Date(scanResult.passenger.boardedAt).toLocaleTimeString()}</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
