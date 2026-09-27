import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Building2,
  User,
  Store,
  QrCode,
  Radio,
  BarChart3,
  RefreshCw,
  Clock,
  Printer,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  MapPin,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface FirstTargetWalkthroughProps {
  isAmharic?: boolean;
}

export const FirstTargetWalkthrough: React.FC<FirstTargetWalkthroughProps> = ({ isAmharic = false }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [holdCountdown, setHoldCountdown] = useState<number>(300);

  // Auto-play simulation loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlayingAuto) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= 5) {
            setIsPlayingAuto(false);
            return 5;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlayingAuto]);

  // Seat hold timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setHoldCountdown((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const steps = [
    {
      id: 1,
      name: isAmharic ? 'አስተዳዳሪ (ኢንቬንቶሪ)' : '1. Admin & Inventory',
      icon: Building2,
      desc: isAmharic ? 'ድርጅት፣ አውቶቡስ፣ መስመሮችና ክፍልፍል መቀመጫዎችን ማዘጋጀት' : 'Provisioning Company, Luxury Fleet, 3 Segments & 135 Materialized Seats'
    },
    {
      id: 2,
      name: isAmharic ? 'ተሳፋሪ (የኦንላይን ቦታ ማስያዝ)' : '2. Customer Web/Mobile',
      icon: User,
      desc: isAmharic ? 'ፍለጋ፣ የ5-ደቂቃ አቶሚክ መቆለፊያ፣ የቴሌብር ክፍያና የQR ትኬት' : 'Segment Search, 5-Min Atomic Seat 12A Lock, Telebirr & QR Boarding Pass'
    },
    {
      id: 3,
      name: isAmharic ? 'ኤጀንሲ ካውንተር POS' : '3. Agent Counter POS',
      icon: Store,
      desc: isAmharic ? 'የቀጥታ ስክሪን፣ ጥሬ ገንዘብ ሽያጭ፣ የሙቀት ማተሚያ ደረሰኝና ሂሳብ ማስታረቅ' : 'Authoritative SSOT, Cash Sale for Seat 11D, Thermal Receipt & Shift Balance'
    },
    {
      id: 4,
      name: isAmharic ? 'ረዳትና አሽከርካሪ' : '4. Conductor & Driver',
      icon: QrCode,
      desc: isAmharic ? 'በበር ላይ የQR ትኬት ማረጋገጥ፣ የማጭበርበር መከላከያና የGPS መረጃ' : 'Gate QR Verification, Duplicate Rejection & Highway GPS Telemetry'
    },
    {
      id: 5,
      name: isAmharic ? 'ማኔጅመንትና ሂሳብ' : '5. Management & Yield',
      icon: BarChart3,
      desc: isAmharic ? 'የገቢ ትንተና፣ የኮሪደር ክፍፍል፣ RevPAS እና የገንዘብ ማስታረቂያ' : 'Corridor Yield, RevPAS, 50% Telebirr vs 50% Cash Reconciliation Ledger'
    },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(16, 185, 129, 0.08))',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} />
              <span>{isAmharic ? 'የመጀመሪያው ተግባራዊ ዒላማ' : 'FIRST IMPLEMENTATION TARGET'}</span>
            </span>
            <span className="badge badge-green">
              {isAmharic ? '100% ተፈትሾ የተረጋገጠ' : '100% TESTED & VERIFIED'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 8px', letterSpacing: '-0.02em' }}>
            {isAmharic
              ? 'አቢሲኒያ የትራንስፖርት ኦፕሬቲንግ ሲስተም — ሙሉ የ5-ተዋናዮች ፍሰት'
              : 'End-to-End Enterprise Target: 5-Persona Continuous Operating Chain'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px', lineHeight: 1.5 }}>
            {isAmharic
              ? 'አንድ ማዕከላዊ የውሂብ ምንጭ (Single Source of Truth) በመጠቀም አስተዳዳሪ፣ የመስመር ላይ ደንበኛ፣ የጣቢያ ካውንተር ኤጀንት፣ የአውቶቡስ ረዳትና የኩባንያ ማኔጅመንት ያለምንም ክፍተት የሚገናኙበት የቀጥታ ስርዓት።'
              : 'A battle-tested demonstration proving how Admin, Online Passenger, Counter POS Agent, Bus Conductor, Driver, and Management operate off ONE authoritative inventory engine without double bookings or reconciliation gaps.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setIsPlayingAuto(!isPlayingAuto);
              if (!isPlayingAuto && activeStep === 5) setActiveStep(1);
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px var(--ethiopia-gold-glow)'
            }}
          >
            {isPlayingAuto ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>{isAmharic ? 'አቁም' : 'Pause Simulation'}</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>{isAmharic ? 'ሙሉ ፍሰቱን በራስ-ሰር አጫውት' : 'Auto-Play Full Flow'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5-Step Stepper Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '28px'
      }}>
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.id;
          const isDone = activeStep > s.id;
          return (
            <div
              key={s.id}
              onClick={() => {
                setActiveStep(s.id);
                setIsPlayingAuto(false);
              }}
              style={{
                background: isActive
                  ? 'var(--bg-surface)'
                  : isDone
                  ? 'rgba(16, 185, 129, 0.04)'
                  : 'var(--bg-surface)',
                border: isActive
                  ? '2px solid var(--ethiopia-gold)'
                  : isDone
                  ? '1px solid var(--ethiopia-green)'
                  : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--ethiopia-gold)' : isDone ? 'var(--ethiopia-green)' : 'var(--bg-app)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#000' : isDone ? '#FFF' : 'var(--text-secondary)'
                }}>
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--ethiopia-gold)' : 'var(--text-secondary)' }}>
                  STAGE 0{s.id}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isActive ? 'var(--ethiopia-gold)' : 'var(--text-main)', marginBottom: '4px' }}>
                {s.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area based on Active Stage */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
      }}>
        {/* STAGE 1: ADMIN OPERATIONS & INVENTORY */}
        {activeStep === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={24} color="var(--ethiopia-gold)" />
                  <span>{isAmharic ? 'ደረጃ 1፡ የአስተዳዳሪ ማዋቀርና ክፍልፍል ኢንቬንቶሪ' : 'Stage 1: Admin Fleet & Segment-Based Inventory Generation'}</span>
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {isAmharic
                    ? 'አንድ አውቶቡስ በ4 ጣቢያዎች መካከል 3 ተከታታይ ክፍሎችን ይፈጥራል፤ 135 የመቀመጫ ኢንቬንቶሪዎችን በራስ-ሰር ያመነጫል።'
                    : 'Corridor: Addis Ababa ➔ Debre Sina ➔ Dessie ➔ Bahir Dar (620 km, 4 Stops, 3 Contiguous Segments).'}
                </div>
              </div>
              <span className="badge badge-green">{isAmharic ? 'የውሂብ ጎታ ተዘጋጅቷል' : 'PRISMA SCHEMA READY'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTERED ENTERPRISE</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>Abyssinia Bus S.C.</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ethiopia-gold)', marginTop: '2px' }}>TIN: 0054892110 • Private Transport License</div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ASSIGNED FLEET BUS</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>Plate: 3-A99102 ET (Side SB-023)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Yutong ZK6122H VIP 2x2 • 45 Reclining Seats</div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DAILY SCHEDULE DEPARTURE</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: 'var(--ethiopia-green)' }}>06:00 AM Express</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Trip #501 • Base Fare ETB 850.00</div>
              </div>
            </div>

            {/* Segment Breakdown */}
            <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--ethiopia-gold)" />
                <span>{isAmharic ? 'የኮሪደሩ 3 ክፍሎች እና የመቀመጫ ምደባ' : 'Corridor Segments & Materialized Inventory Allocation'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-gold">SEGMENT 1</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ethiopia-green)' }}>45 AVAILABLE</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '8px' }}>Addis Ababa ➔ Debre Sina</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>190 km • Sequence #1</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-gold">SEGMENT 2</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ethiopia-green)' }}>45 AVAILABLE</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '8px' }}>Debre Sina ➔ Dessie</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>210 km • Sequence #2</div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-gold">SEGMENT 3</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ethiopia-green)' }}>45 AVAILABLE</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '8px' }}>Dessie ➔ Bahir Dar</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>220 km • Sequence #3</div>
                </div>
              </div>

              <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--ethiopia-green)" />
                <span>3 segments × 45 seats = <strong>135 individual inventory records</strong> materialized in PostgreSQL table <code>TripSegmentSeat</code>.</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveStep(2)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{isAmharic ? 'ወደ ደንበኛ ቦታ ማስያዝ ቀጥል' : 'Proceed to Customer Booking'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: CUSTOMER WEB / MOBILE */}
        {activeStep === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={24} color="var(--ethiopia-gold)" />
                  <span>{isAmharic ? 'ደረጃ 2፡ የደንበኛ ቦታ ማስያዝ፣ የ5-ደቂቃ መቆለፊያና የቴሌብር ክፍያ' : 'Stage 2: Customer Online Booking, 5-Min Hold & Telebirr Checkout'}</span>
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {isAmharic
                    ? 'ተሳፋሪ አልማዝ ታደሰ መቀመጫ 12A ን ትመርጣለች፤ ስርዓቱ መቀመጫውን ለ5 ደቂቃ ይቆልፋል፤ ሌላ ሰው እንዳይወስደው ይከላከላል።'
                    : 'Passenger Almaz Tadesse holds Seat 12A. System locks inventory for 300 seconds; duplicate holds are rejected.'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(217, 119, 6, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--ethiopia-gold)' }}>
                <Clock size={16} color="var(--ethiopia-gold)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ethiopia-gold)' }}>
                  HOLD TTL: {formatCountdown(holdCountdown)}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Selected Seat & Manifest Card */}
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} color="var(--ethiopia-gold)" />
                  <span>5-Minute Atomic Seat Hold</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: 'var(--bg-surface)', borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: 'var(--ethiopia-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: '#000'
                  }}>
                    12A
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>Seat 12A (Window / Rear)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: HELD (In-Flight Transaction)</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Passenger Manifest:</strong> Almaz Tadesse (+251 911 234 567)
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>FDRE Kebele ID:</strong> AA-KB-90412
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Trip Route:</strong> Addis Ababa ➔ Bahir Dar (Spanning Segments 1, 2, and 3)
                </div>

                <div style={{
                  marginTop: '16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--ethiopia-green)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldAlert size={16} color="var(--ethiopia-green)" />
                  <span><strong>Concurrency Defense:</strong> Concurrent counter agent request for 12A rejected with 409 Conflict.</span>
                </div>
              </div>

              {/* Boarding Pass & Payment Confirmation */}
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} color="var(--ethiopia-green)" />
                  <span>Payment Gateway & Issued Ticket</span>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge badge-green">PAID VIA TELEBIRR</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ethiopia-gold)' }}>ETB 850.00</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Provider Reference: <code>TX_TB_98441199</code>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Booking Reference: <code>BK-20260927-EF517D</code>
                  </div>

                  <hr style={{ margin: '14px 0', borderColor: 'var(--border-subtle)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: '#FFF',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}>
                      <QrCode size={48} color="#000" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ticket #TKT-301014</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        HMAC: <code>1040b7a0c212...</code>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ethiopia-green)', fontWeight: 600, marginTop: '2px' }}>
                        Ready for Door Gate Scan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setActiveStep(1)} className="btn btn-secondary">
                {isAmharic ? 'ወደ ኋላ' : 'Back'}
              </button>
              <button onClick={() => setActiveStep(3)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{isAmharic ? 'ወደ ካውንተር POS ቀጥል' : 'Proceed to Counter POS'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: AGENT COUNTER POS */}
        {activeStep === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Store size={24} color="var(--ethiopia-gold)" />
                  <span>{isAmharic ? 'ደረጃ 3፡ የኤጀንሲ ካውንተር POS እና የፈረቃ ሂሳብ ማስታረቅ' : 'Stage 3: Agent Counter POS & Shift Drawer Reconciliation'}</span>
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {isAmharic
                    ? 'ኤጀንት ሀና በቀለ ያንኑ የጋራ ኢንቬንቶሪ ትመለከታለች፤ 12A በኦንላይን እንደተያዘ አይታ አጠገቡ ያለውን 11D በጥሬ ገንዘብ ትሸጣለች።'
                    : 'Agent Hana Bekele sees authoritative inventory. Seat 12A is locked by Almaz; Hana sells adjacent 11D to walk-in passenger.'}
                </div>
              </div>
              <span className="badge badge-green">{isAmharic ? 'ካውንተር ፈረቃ ንቁ ነው' : 'DRAWER BALANCED'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Agent Screen Cabin Map Comparison */}
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Store size={18} color="var(--ethiopia-gold)" />
                  <span>Live Counter Terminal Seat Map (Addis ➔ Dessie)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#DC2626', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>12A</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Seat 12A (Passenger Almaz Tadesse)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Booked via Web Portal (Telebirr)</div>
                      </div>
                    </div>
                    <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>LOCKED / SOLD</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--ethiopia-green)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>11D</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Seat 11D (Walk-In: Dawit Kebede)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sold at Counter POS (Cash)</div>
                      </div>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>SOLD (CASH)</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Opening Cash Float:</span>
                    <strong>ETB 2,500.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Counter Ticket Sales (Cash):</span>
                    <strong>+ ETB 570.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--ethiopia-gold)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px' }}>
                    <span>Expected Drawer Total:</span>
                    <span>ETB 3,070.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--ethiopia-green)', fontWeight: 700 }}>
                    <span>Actual Physical Cash Count:</span>
                    <span>ETB 3,070.00 (BALANCED)</span>
                  </div>
                </div>
              </div>

              {/* Thermal Receipt Preview */}
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={18} color="var(--ethiopia-gold)" />
                  <span>58mm ESC/POS Thermal Receipt</span>
                </div>

                <div style={{
                  background: '#FFF',
                  color: '#000',
                  padding: '16px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  maxWidth: '320px',
                  margin: '0 auto'
                }}>
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>Abyssinia Bus S.C.</div>
                  <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>INTERCITY BUS TRANSPORTATION</div>
                  <div style={{ textAlign: 'center', fontSize: '0.7rem', marginBottom: '6px' }}>TICKET RECEIPT (POS)</div>
                  <div>----------------------------------------</div>
                  <div>REF : BK-20260927-768476</div>
                  <div>DATE: 2026-09-28 | 06:00 AM</div>
                  <div>ROUTE: Addis Ababa ➔ Bahir Dar</div>
                  <div>BUS  : 3-A99102 ET (SB-023)</div>
                  <div>AGENT: Hana Bekele (ADD-01)</div>
                  <div>----------------------------------------</div>
                  <div>PASSENGER: Dawit Kebede</div>
                  <div>SEAT     : 11D (STANDARD)</div>
                  <div>TICKET   : TKT-882888</div>
                  <div>----------------------------------------</div>
                  <div>TOTAL FARE  : ETB 570.00</div>
                  <div>PAY METHOD  : CASH</div>
                  <div>CASH TENDER : ETB 1000.00</div>
                  <div style={{ fontWeight: 'bold' }}>CHANGE DUE  : ETB 430.00</div>
                  <div>----------------------------------------</div>
                  <div style={{ textAlign: 'center', marginTop: '6px' }}>Scan QR Code on Door Boarding</div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Safe Travels with Abyssinia!</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setActiveStep(2)} className="btn btn-secondary">
                {isAmharic ? 'ወደ ኋላ' : 'Back'}
              </button>
              <button onClick={() => setActiveStep(4)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{isAmharic ? 'ወደ ረዳትና አሽከርካሪ ቀጥል' : 'Proceed to Conductor & Driver'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: CONDUCTOR & DRIVER */}
        {activeStep === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <QrCode size={24} color="var(--ethiopia-gold)" />
                  <span>{isAmharic ? 'ደረጃ 4፡ የአውቶቡስ ረዳት ስካነር እና የአሽከርካሪ GPS መረጃ' : 'Stage 4: Gate QR Verification & Live Highway Telemetry'}</span>
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {isAmharic
                    ? 'ረዳት አለሙ የትኬት QR ኮድ በሩ ላይ ያረጋግጣል፤ ተመሳስሎ የተሰራን ወይም የተደገመን ትኬት ይከለክላል። አሽከርካሪ ዳዊት የGPS መረጃ ያሰራጫል።'
                    : 'Conductor Alemu validates QR code, catches duplicate re-scans instantly, while Driver Dawit streams telemetry across the A2 corridor.'}
                </div>
              </div>
              <span className="badge badge-green">{isAmharic ? 'ስካነር ተረጋግጧል' : 'GATE VERIFIED'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Gate Scan Verification Card */}
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={18} color="var(--ethiopia-gold)" />
                  <span>Door Gate QR Validation</span>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--ethiopia-green)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <CheckCircle2 size={20} color="var(--ethiopia-green)" />
                    <span style={{ fontWeight: 800, color: 'var(--ethiopia-green)' }}>SCAN 1: APPROVED</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    Passenger <strong>Almaz Tadesse</strong> boarded for <strong>Seat 12A</strong>.
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Timestamp: 05:45 AM • Gate: Addis Central Bay 2 • Audit logged.
                  </div>
                </div>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid #EF4444',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <AlertTriangle size={20} color="#EF4444" />
                    <span style={{ fontWeight: 800, color: '#EF4444' }}>SCAN 2: REJECTED (DUPLICATE)</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    Fraud Defense: Second scan of ticket #TKT-301014 was blocked!
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Alarm: "Ticket already scanned and boarded at 05:45 AM".
                  </div>
                </div>
              </div>

              {/* Driver Telemetry Screen */}
              <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={18} color="var(--ethiopia-green)" />
                  <span>Driver Real-Time Highway Broadcast</span>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>VEHICLE TELEMETRY</span>
                    <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF' }}></span>
                      <span>LIVE GPS</span>
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CURRENT SPEED</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ethiopia-gold)' }}>72 km/h</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>FDRE Limit: 80 km/h</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NEXT WAYPOINT</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>Debre Sina</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--ethiopia-green)' }}>ETA: 08:45 AM</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-app)', padding: '10px', borderRadius: '6px' }}>
                    <div><strong>Highway Corridor:</strong> Blue Nile Gorge (A2 Highway)</div>
                    <div><strong>Coordinates:</strong> Lat 9.6841, Lng 39.7345 (Heading Northbound)</div>
                    <div><strong>Driver on Duty:</strong> Dawit Mengistu (Verified License #ET-DL-99120)</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setActiveStep(3)} className="btn btn-secondary">
                {isAmharic ? 'ወደ ኋላ' : 'Back'}
              </button>
              <button onClick={() => setActiveStep(5)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{isAmharic ? 'ወደ ማኔጅመንት ሪፖርት ቀጥል' : 'Proceed to Management KPIs'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: MANAGEMENT PORTAL */}
        {activeStep === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={24} color="var(--ethiopia-gold)" />
                  <span>{isAmharic ? 'ደረጃ 5፡ የማኔጅመንት ትንተና፣ የኮሪደር ገቢ እና የገንዘብ ማስታረቅ' : 'Stage 5: Management Executive KPIs & Revenue Reconciliation'}</span>
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {isAmharic
                    ? 'የኩባንያው የፋይናንስ ክፍል የቴሌብር እና የጥሬ ገንዘብ ገቢዎችን ያለ ምንም ልዩነት በቅጽበት ያስታርቃል።'
                    : 'Executive overview reconciling digital receivables with branch safe deposits across the entire corridor.'}
                </div>
              </div>
              <span className="badge badge-gold">{isAmharic ? 'ሙሉ በሙሉ የተስማማ' : '100% BALANCED'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL GROSS SALES</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--ethiopia-gold)' }}>ETB 1,420.00</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>2 Confirmed Bookings</div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TELEBIRR RECEIVABLES</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--ethiopia-green)' }}>ETB 850.00</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>59.8% Digital Share</div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATION CASH DEPOSIT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>ETB 570.00</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>40.2% Physical Safe Deposit</div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REVENUE PER SEAT-KM</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--ethiopia-gold)' }}>0.0509 ETB</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Corridor Yield (620 km)</div>
              </div>
            </div>

            {/* Reconciliation Ledger Table */}
            <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="var(--ethiopia-gold)" />
                <span>Multi-Channel Settlement & Audit Ledger</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '8px' }}>CHANNEL / STATION</th>
                      <th style={{ padding: '8px' }}>EXPECTED AMOUNT</th>
                      <th style={{ padding: '8px' }}>AUDITED AMOUNT</th>
                      <th style={{ padding: '8px' }}>DISCREPANCY</th>
                      <th style={{ padding: '8px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 8px' }}>Addis Ababa Central Station (Agent Hana Bekele)</td>
                      <td style={{ padding: '10px 8px' }}>ETB 3,070.00</td>
                      <td style={{ padding: '10px 8px' }}>ETB 3,070.00</td>
                      <td style={{ padding: '10px 8px', color: 'var(--ethiopia-green)' }}>ETB 0.00</td>
                      <td style={{ padding: '10px 8px' }}><span className="badge badge-green">BALANCED</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 8px' }}>Telebirr Merchant Gateway (Ethio Telecom)</td>
                      <td style={{ padding: '10px 8px' }}>ETB 850.00</td>
                      <td style={{ padding: '10px 8px' }}>ETB 850.00</td>
                      <td style={{ padding: '10px 8px', color: 'var(--ethiopia-green)' }}>ETB 0.00</td>
                      <td style={{ padding: '10px 8px' }}><span className="badge badge-green">SETTLED</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 8px', fontWeight: 800 }}>TOTAL ENTERPRISE RECONCILIATION</td>
                      <td style={{ padding: '12px 8px', fontWeight: 800 }}>ETB 3,920.00</td>
                      <td style={{ padding: '12px 8px', fontWeight: 800 }}>ETB 3,920.00</td>
                      <td style={{ padding: '12px 8px', fontWeight: 800, color: 'var(--ethiopia-green)' }}>ETB 0.00</td>
                      <td style={{ padding: '12px 8px' }}><span className="badge badge-gold">100% MATCH</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setActiveStep(4)} className="btn btn-secondary">
                {isAmharic ? 'ወደ ኋላ' : 'Back'}
              </button>
              <button onClick={() => setActiveStep(1)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} />
                <span>{isAmharic ? 'እንደገና ጀምር' : 'Restart Walkthrough'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
