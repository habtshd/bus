import React, { useState, useRef, useEffect } from 'react';
import { 
  Bus, Ticket, Store, ShieldCheck, QrCode, BarChart3, Radio, 
  Search, Rocket, Sun, Moon, Sparkles, ChevronDown, Check, Smartphone,
  Layers, ChevronRight, Globe
} from 'lucide-react';

export type AppTab = 
  | 'target-demo' 
  | 'passenger' 
  | 'mobile-app' 
  | 'my-bookings' 
  | 'agent' 
  | 'driver' 
  | 'dispatch' 
  | 'manifest' 
  | 'conductor' 
  | 'analytics' 
  | 'pilot-launch';

interface NavbarProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  isAmharic: boolean;
  setIsAmharic: (val: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setTab, 
  isAmharic, 
  setIsAmharic, 
  theme, 
  toggleTheme 
}) => {
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPortalsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isStaffTab = [
    'agent', 'driver', 'dispatch', 'manifest', 'conductor', 'analytics', 'pilot-launch', 'target-demo'
  ].includes(currentTab);

  const getStaffTabLabel = () => {
    switch (currentTab) {
      case 'agent': return isAmharic ? 'ካውንተር POS' : 'Agent POS';
      case 'driver': return isAmharic ? 'አሽከርካሪ' : 'Driver Cockpit';
      case 'dispatch': return isAmharic ? 'ስምሪት' : 'Dispatch';
      case 'manifest': return isAmharic ? 'ማኒፌስት' : 'Manifest';
      case 'conductor': return isAmharic ? 'QR ስካነር' : 'Conductor';
      case 'analytics': return isAmharic ? 'ማኔጅመንት' : 'Management';
      case 'pilot-launch': return isAmharic ? 'ምረቃ' : 'Launch & Pilot';
      case 'target-demo': return isAmharic ? 'የዒላማ ፍሰት' : '5-Actor Target';
      default: return isAmharic ? 'የስራ ክፍሎች' : 'Staff Portals';
    }
  };

  const handleSelectTab = (tab: AppTab) => {
    setTab(tab);
    setIsPortalsOpen(false);
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Brand Logo - Modern & Minimalist */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }} 
          onClick={() => setTab('passenger')}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--ethiopia-gold), #B45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--ethiopia-gold-glow)'
          }}>
            <Bus size={20} color="#0B0F19" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ABYSSINIA</span>
              <span style={{ color: 'var(--ethiopia-gold)', fontWeight: 600 }}>BUS</span>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: 'var(--ethiopia-green)',
                boxShadow: '0 0 8px var(--ethiopia-green)' 
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {isAmharic ? 'የረጅም ርቀት አውቶቡስ ትራንስፖርት' : 'Intercity Transportation S.C.'}
            </div>
          </div>
        </div>

        {/* Simplified & Modernist Central Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--nav-pill-bg)',
          padding: '4px 6px',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* 1. Book Trip (Primary Passenger) */}
          <button
            onClick={() => setTab('passenger')}
            className={`btn ${currentTab === 'passenger' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontWeight: currentTab === 'passenger' ? 700 : 500,
              gap: '6px'
            }}
          >
            <Ticket size={15} />
            <span>{isAmharic ? 'ትኬት ይቁረጡ' : 'Book Trips'}</span>
          </button>

          {/* 2. My Bookings */}
          <button
            onClick={() => setTab('my-bookings')}
            className={`btn ${currentTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '7px 14px',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontWeight: currentTab === 'my-bookings' ? 700 : 500,
              gap: '6px'
            }}
          >
            <Search size={14} />
            <span>{isAmharic ? 'ትኬቴን ፈልግ' : 'My Bookings'}</span>
          </button>

          {/* 3. Mobile App Simulator */}
          <button
            onClick={() => setTab('mobile-app')}
            className={`btn ${currentTab === 'mobile-app' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '7px 14px',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontWeight: currentTab === 'mobile-app' ? 700 : 500,
              gap: '6px'
            }}
          >
            <Smartphone size={14} />
            <span>{isAmharic ? 'ሞባይል መተግበሪያ' : 'Mobile App'}</span>
          </button>

          {/* Modernist Portals / Workspaces Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsPortalsOpen(prev => !prev)}
              className={`btn ${isStaffTab ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                borderRadius: '999px',
                gap: '6px',
                fontWeight: isStaffTab ? 700 : 500,
                background: isStaffTab ? 'rgba(245, 158, 11, 0.18)' : undefined,
                color: isStaffTab ? 'var(--ethiopia-gold)' : undefined,
                borderColor: isStaffTab ? 'var(--ethiopia-gold)' : undefined
              }}
            >
              <Layers size={14} />
              <span>{isStaffTab ? getStaffTabLabel() : (isAmharic ? 'የስራ ክፍሎች' : 'Staff & Operations')}</span>
              <ChevronDown size={13} style={{ transform: isPortalsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Modernist Dropdown Menu */}
            {isPortalsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                backdropFilter: 'blur(24px)'
              }}>
                <div style={{ 
                  padding: '4px 10px 8px', 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: 'var(--text-muted)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.06em' 
                }}>
                  {isAmharic ? 'የኩባንያው የስራ ክፍሎች' : 'Internal Portals & Operations'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  
                  {/* Target Flow (5-Actor) */}
                  <button
                    onClick={() => handleSelectTab('target-demo')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'target-demo' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'target-demo' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="var(--ethiopia-gold)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የዒላማ ፍሰት (5-ተዋናይ)' : '5-Actor Target Chain'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin → Passenger → Agent → Conductor → Lead</div>
                      </div>
                    </div>
                    {currentTab === 'target-demo' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                  {/* Frontline POS Counter */}
                  <button
                    onClick={() => handleSelectTab('agent')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'agent' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'agent' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Store size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የቲኬት ቆጣሪ POS' : 'Agent POS Counter'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cash sales, thermal printing & shift drawer</div>
                      </div>
                    </div>
                    {currentTab === 'agent' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Driver Cockpit */}
                  <button
                    onClick={() => handleSelectTab('driver')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'driver' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'driver' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የአሽከርካሪ መተግበሪያ' : 'Driver Cockpit'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPS telemetry, speed monitoring & passenger log</div>
                      </div>
                    </div>
                    {currentTab === 'driver' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Conductor QR Scanner */}
                  <button
                    onClick={() => handleSelectTab('conductor')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'conductor' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'conductor' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <QrCode size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የኮንዳክተር QR ስካነር' : 'Conductor QR Scanner'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gate boarding validation & fraud prevention</div>
                      </div>
                    </div>
                    {currentTab === 'conductor' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Dispatcher Control */}
                  <button
                    onClick={() => handleSelectTab('dispatch')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'dispatch' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'dispatch' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የኦፕሬሽን ስምሪት' : 'Fleet Dispatcher'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bus assignments, delays & live telemetry map</div>
                      </div>
                    </div>
                    {currentTab === 'dispatch' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Checkpoint Manifest */}
                  <button
                    onClick={() => handleSelectTab('manifest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'manifest' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'manifest' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የፍተሻ ኬላ ማኒፌስት' : 'Checkpoint Manifest'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Federal Police & Kebele compliance report</div>
                      </div>
                    </div>
                    {currentTab === 'manifest' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                  {/* Management & Analytics */}
                  <button
                    onClick={() => handleSelectTab('analytics')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'analytics' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'analytics' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={15} color="var(--text-muted)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የስራ አስኪያጅ ዳሽቦርድ' : 'Management & Analytics'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Revenue, load factor & settlement ledger</div>
                      </div>
                    </div>
                    {currentTab === 'analytics' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Launch & Pilot */}
                  <button
                    onClick={() => handleSelectTab('pilot-launch')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: currentTab === 'pilot-launch' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'pilot-launch' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Rocket size={15} color="var(--ethiopia-gold)" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{isAmharic ? 'የፓይለት ምረቃ ማዕከል' : 'Launch & Pilot Center'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Readiness checklist & live corridor rollout</div>
                      </div>
                    </div>
                    {currentTab === 'pilot-launch' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions: Language Switch, Theme, Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Modern Language Toggle Switch */}
          <button
            onClick={() => setIsAmharic(!isAmharic)}
            className="btn btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              borderRadius: '8px',
              fontWeight: 600,
              gap: '4px'
            }}
            title="Toggle English / አማርኛ"
          >
            <Globe size={13} color="var(--text-muted)" />
            <span>{isAmharic ? 'አማርኛ' : 'EN'}</span>
          </button>

          {/* Modern Theme Icon Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Sun size={16} color="var(--ethiopia-gold)" />
            ) : (
              <Moon size={16} color="var(--text-secondary)" />
            )}
          </button>

          {/* Subtle Live API Status */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--ethiopia-green)'
            }}
            title="Production API connected on port 4000"
          >
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: 'var(--ethiopia-green)' 
            }} />
            <span>4000</span>
          </div>

        </div>

      </div>
    </header>
  );
};
