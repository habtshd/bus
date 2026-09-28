import React, { useState, useRef, useEffect } from 'react';
import { 
  Bus, Ticket, Store, ShieldCheck, QrCode, BarChart3, Radio, 
  Search, Rocket, Sun, Moon, Sparkles, ChevronDown, Check, Smartphone,
  Layers, ChevronRight, Globe, Compass, Headphones, Package, Lock, User
} from 'lucide-react';

export type AppTab = 
  | 'target-demo' 
  | 'passenger' 
  | 'mobile-app' 
  | 'my-bookings' 
  | 'route-guide'
  | 'live-tracking'
  | 'customer-support'
  | 'operations'
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

  // Independent Portal Sessions
  const [opsUser, setOpsUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('abyssinia_ops_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [mgmtUser, setMgmtUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('abyssinia_mgmt_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerUser, setCustomerUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('abyssinia_customer_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncSessions = () => {
      try {
        const sOps = localStorage.getItem('abyssinia_ops_session');
        setOpsUser(sOps ? JSON.parse(sOps) : null);
        const sMgmt = localStorage.getItem('abyssinia_mgmt_session');
        setMgmtUser(sMgmt ? JSON.parse(sMgmt) : null);
        const sCust = localStorage.getItem('abyssinia_customer_session');
        setCustomerUser(sCust ? JSON.parse(sCust) : null);
      } catch {}
    };
    window.addEventListener('storage', syncSessions);
    const interval = setInterval(syncSessions, 1000);
    return () => {
      window.removeEventListener('storage', syncSessions);
      clearInterval(interval);
    };
  }, []);

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
    'operations', 'agent', 'driver', 'dispatch', 'manifest', 'conductor', 'analytics', 'pilot-launch', 'target-demo'
  ].includes(currentTab);

  const getStaffTabLabel = () => {
    switch (currentTab) {
      case 'operations': return isAmharic ? 'የስራ ክፍሎች' : 'Operations Portal';
      case 'agent': return isAmharic ? 'ካውንተር POS' : 'Agent POS';
      case 'driver': return isAmharic ? 'አሽከርካሪ' : 'Driver Cockpit';
      case 'dispatch': return isAmharic ? 'ስምሪት' : 'Dispatch';
      case 'manifest': return isAmharic ? 'ማኒፌስት' : 'Manifest';
      case 'conductor': return isAmharic ? 'QR ስካነር' : 'Conductor';
      case 'analytics': return isAmharic ? 'ማኔጅመንት' : 'Management';
      case 'pilot-launch': return isAmharic ? 'ምረቃ' : 'Launch & Pilot';
      case 'target-demo': return isAmharic ? 'የዒላማ ፍሰት' : '5-Actor Target';
      default: return isAmharic ? 'ተጨማሪ መሳሪያዎች' : 'More Tools';
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

        {/* Simplified & Modernist Central Navigation Featuring 3 Portals */}
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
          {/* 1. Portal 1: Passenger Portal */}
          <button
            onClick={() => setTab('passenger')}
            className={`btn ${['passenger', 'route-guide', 'live-tracking', 'my-bookings', 'customer-support', 'mobile-app'].includes(currentTab) ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontWeight: ['passenger', 'route-guide', 'live-tracking', 'my-bookings', 'customer-support', 'mobile-app'].includes(currentTab) ? 700 : 500,
              gap: '6px'
            }}
          >
            <Ticket size={15} />
            <span>{isAmharic ? 'የተሳፋሪ ፖርታል' : 'Passenger Portal'}</span>
            {customerUser ? (
              <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.25)', color: 'var(--ethiopia-green)', fontWeight: 700 }}>
                {customerUser.fullName?.split(' ')[0]}
              </span>
            ) : (
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--ethiopia-gold)' }}>
                {isAmharic ? 'እንግዳ' : 'Guest'}
              </span>
            )}
          </button>

          {/* 2. Portal 2: Operations Portal */}
          <button
            onClick={() => setTab('operations')}
            className={`btn ${['operations', 'agent', 'driver', 'dispatch', 'manifest', 'conductor'].includes(currentTab) ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontWeight: ['operations', 'agent', 'driver', 'dispatch', 'manifest', 'conductor'].includes(currentTab) ? 700 : 500,
              gap: '6px',
              background: ['operations', 'agent', 'driver', 'dispatch', 'manifest', 'conductor'].includes(currentTab) ? 'rgba(2, 132, 199, 0.18)' : undefined,
              borderColor: ['operations', 'agent', 'driver', 'dispatch', 'manifest', 'conductor'].includes(currentTab) ? '#0284c7' : undefined,
              color: ['operations', 'agent', 'driver', 'dispatch', 'manifest', 'conductor'].includes(currentTab) ? '#0284c7' : undefined
            }}
          >
            <Layers size={14} />
            <span>{isAmharic ? 'የስራ ክፍሎች ፖርታል' : 'Operations Portal'}</span>
            {opsUser ? (
              <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '999px', background: 'rgba(2, 132, 199, 0.25)', color: '#0284c7', fontWeight: 700 }}>
                {opsUser.fullName?.split(' ')[0]}
              </span>
            ) : (
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} />
                <span>Auth</span>
              </span>
            )}
          </button>

          {/* 3. Portal 3: Management Portal */}
          <button
            onClick={() => setTab('analytics')}
            className={`btn ${currentTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontWeight: currentTab === 'analytics' ? 700 : 500,
              gap: '6px'
            }}
          >
            <BarChart3 size={14} />
            <span>{isAmharic ? 'ማኔጅመንት ፖርታል' : 'Management Portal'}</span>
            {mgmtUser ? (
              <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.25)', color: 'var(--ethiopia-gold)', fontWeight: 700 }}>
                L3 Exec
              </span>
            ) : (
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} />
                <span>Level 3</span>
              </span>
            )}
          </button>

          {/* Tools & Secondary Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsPortalsOpen(prev => !prev)}
              className={`btn btn-secondary`}
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                borderRadius: '999px',
                gap: '6px',
                fontWeight: 500
              }}
            >
              <ChevronDown size={13} style={{ transform: isPortalsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              <span>{isAmharic ? 'ተጨማሪ' : 'More'}</span>
            </button>

            {/* Modernist Compact Dropdown Menu */}
            {isPortalsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '6px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                backdropFilter: 'blur(24px)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  
                  {/* Route Guides */}
                  <button
                    onClick={() => handleSelectTab('route-guide')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'route-guide' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'route-guide' ? '#0284c7' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'የጉዞ መስመሮች' : 'Route Guides'}</span>
                    </div>
                    {currentTab === 'route-guide' && <Check size={14} color="#0284c7" />}
                  </button>

                  {/* Live Tracking */}
                  <button
                    onClick={() => handleSelectTab('live-tracking')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'live-tracking' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'live-tracking' ? '#0284c7' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'የአውቶቡስ መገኛ' : 'Live Fleet Tracking'}</span>
                    </div>
                    {currentTab === 'live-tracking' && <Check size={14} color="#0284c7" />}
                  </button>

                  {/* My Bookings */}
                  <button
                    onClick={() => handleSelectTab('my-bookings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'my-bookings' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'my-bookings' ? '#0284c7' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'ትኬቴን ፈልግ' : 'My Bookings'}</span>
                    </div>
                    {currentTab === 'my-bookings' && <Check size={14} color="#0284c7" />}
                  </button>

                  {/* Customer Support */}
                  <button
                    onClick={() => handleSelectTab('customer-support')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'customer-support' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'customer-support' ? '#0284c7' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Headphones size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'የተሳፋሪዎች አገልግሎት' : 'Passenger Support'}</span>
                    </div>
                    {currentTab === 'customer-support' && <Check size={14} color="#0284c7" />}
                  </button>

                  {/* Mobile App Simulator */}
                  <button
                    onClick={() => handleSelectTab('mobile-app')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'mobile-app' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'mobile-app' ? '#0284c7' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'ሞባይል መተግበሪያ' : 'Mobile App'}</span>
                    </div>
                    {currentTab === 'mobile-app' && <Check size={14} color="#0284c7" />}
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '3px 0' }} />

                  {/* Target Flow */}
                  <button
                    onClick={() => handleSelectTab('target-demo')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'target-demo' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'target-demo' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={15} color="var(--ethiopia-gold)" />
                      <span style={{ fontWeight: 600 }}>{isAmharic ? 'የዒላማ ፍሰት' : 'Target Flow (5-Actor)'}</span>
                    </div>
                    {currentTab === 'target-demo' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Launch & Pilot */}
                  <button
                    onClick={() => handleSelectTab('pilot-launch')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'pilot-launch' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'pilot-launch' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Rocket size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'ምረቃ' : 'Launch & Pilot'}</span>
                    </div>
                    {currentTab === 'pilot-launch' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  {/* Checkpoint Manifest */}
                  <button
                    onClick={() => handleSelectTab('manifest')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'manifest' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'manifest' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'ማኒፌስት' : 'Police Manifest'}</span>
                    </div>
                    {currentTab === 'manifest' && <Check size={14} color="var(--ethiopia-gold)" />}
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '3px 0' }} />

                  {/* Management & Analytics */}
                  <button
                    onClick={() => handleSelectTab('analytics')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      background: currentTab === 'analytics' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'analytics' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={15} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'ማኔጅመንት' : 'Management'}</span>
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
                      padding: '7px 10px',
                      background: currentTab === 'pilot-launch' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentTab === 'pilot-launch' ? 'var(--ethiopia-gold)' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Rocket size={15} color="var(--ethiopia-gold)" />
                      <span style={{ fontWeight: 500 }}>{isAmharic ? 'ምረቃ' : 'Launch & Pilot'}</span>
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
