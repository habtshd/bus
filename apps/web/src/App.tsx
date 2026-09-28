import React, { useState, useEffect } from 'react';
import { LoginPage, PortalType } from './components/LoginPage';
import { CustomerPortal } from './components/CustomerPortal';
import { OperationsPortal } from './components/OperationsPortal';
import { ManagementDashboard } from './components/ManagementDashboard';
import { FirstTargetWalkthrough } from './components/FirstTargetWalkthrough';
import { PilotLaunchCenter } from './components/PilotLaunchCenter';
import { AuthUser } from './components/PortalAuthCard';
import { Bus, LogOut, Sun, Moon, Globe, Shield, Sparkles, Rocket } from 'lucide-react';

interface ActiveSession {
  portal: PortalType;
  user: AuthUser;
  token: string;
}

export function App() {
  const [session, setSession] = useState<ActiveSession | null>(() => {
    try {
      const saved = localStorage.getItem('abyssinia_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeSpecialView, setActiveSpecialView] = useState<'none' | 'target-demo' | 'pilot-launch'>('none');
  const [isAmharic, setIsAmharic] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('bus_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('bus_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLoginSuccess = (portal: PortalType, user: AuthUser, token: string) => {
    const newSession: ActiveSession = { portal, user, token };
    setSession(newSession);
    localStorage.setItem('abyssinia_active_session', JSON.stringify(newSession));
    
    // Sync portal-specific keys
    if (portal === 'passenger') {
      localStorage.setItem('abyssinia_passenger_session', JSON.stringify({ ...user, token }));
      localStorage.setItem('abyssinia_customer_session', JSON.stringify({ ...user, token }));
    } else if (portal === 'operations') {
      localStorage.setItem('abyssinia_ops_session', JSON.stringify({ ...user, token }));
    } else if (portal === 'management') {
      localStorage.setItem('abyssinia_mgmt_session', JSON.stringify({ ...user, token }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('abyssinia_active_session');
    localStorage.removeItem('abyssinia_passenger_session');
    localStorage.removeItem('abyssinia_customer_session');
    localStorage.removeItem('abyssinia_ops_session');
    localStorage.removeItem('abyssinia_mgmt_session');
    setSession(null);
    setActiveSpecialView('none');
  };

  // If NOT authenticated, render the dedicated separate Authentication Page!
  if (!session) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        isAmharic={isAmharic}
        setIsAmharic={setIsAmharic}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // When Authenticated, render the specific independent portal
  const getPortalTitle = () => {
    switch (session.portal) {
      case 'passenger': return isAmharic ? 'የተሳፋሪ ፖርታል' : 'Passenger Portal';
      case 'operations': return isAmharic ? 'የስራ ክፍሎች ፖርታል' : 'Operations Portal';
      case 'management': return isAmharic ? 'ማኔጅመንት ፖርታል' : 'Management Portal';
    }
  };

  const getPortalColor = () => {
    switch (session.portal) {
      case 'passenger': return 'var(--ethiopia-gold)';
      case 'operations': return '#0284c7';
      case 'management': return '#8b5cf6';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className={isAmharic ? 'lang-am' : ''}>
      
      {/* Authenticated Portal Top Header */}
      <header style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Brand & Active Portal Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => setActiveSpecialView('none')}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--ethiopia-gold), #B45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--ethiopia-gold-glow)'
              }}>
                <Bus size={20} color="#0B0F19" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                <span>ABYSSINIA </span>
                <span style={{ color: 'var(--ethiopia-gold)' }}>BUS</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: `${getPortalColor()}18`,
              border: `1px solid ${getPortalColor()}40`,
              color: getPortalColor(),
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Shield size={13} />
              <span>{getPortalTitle()}</span>
            </div>
          </div>

          {/* User Identity, Tools & Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Quick Demonstration Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setActiveSpecialView(activeSpecialView === 'target-demo' ? 'none' : 'target-demo')}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                  gap: '6px',
                  borderColor: activeSpecialView === 'target-demo' ? 'var(--ethiopia-gold)' : undefined,
                  color: activeSpecialView === 'target-demo' ? 'var(--ethiopia-gold)' : undefined
                }}
              >
                <Sparkles size={13} />
                <span>{isAmharic ? 'የዒላማ ፍሰት' : '5-Actor Target'}</span>
              </button>

              <button
                onClick={() => setActiveSpecialView(activeSpecialView === 'pilot-launch' ? 'none' : 'pilot-launch')}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                  gap: '6px',
                  borderColor: activeSpecialView === 'pilot-launch' ? 'var(--ethiopia-gold)' : undefined,
                  color: activeSpecialView === 'pilot-launch' ? 'var(--ethiopia-gold)' : undefined
                }}
              >
                <Rocket size={13} />
                <span>{isAmharic ? 'ምረቃ' : 'Launch'}</span>
              </button>
            </div>

            <div style={{ height: '20px', width: '1px', background: 'var(--border-subtle)' }} />

            {/* Language & Theme */}
            <button
              onClick={() => setIsAmharic(!isAmharic)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: '8px' }}
            >
              <Globe size={13} />
              <span>{isAmharic ? 'EN' : 'አማ'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', borderRadius: '8px' }}
            >
              {theme === 'dark' ? <Sun size={14} color="var(--ethiopia-gold)" /> : <Moon size={14} />}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              <span>{isAmharic ? 'ውጣ' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeSpecialView === 'target-demo' && <FirstTargetWalkthrough isAmharic={isAmharic} />}
        {activeSpecialView === 'pilot-launch' && <PilotLaunchCenter isAmharic={isAmharic} />}

        {activeSpecialView === 'none' && (
          <>
            {session.portal === 'passenger' && (
              <CustomerPortal isAmharic={isAmharic} onLogout={handleLogout} />
            )}

            {session.portal === 'operations' && (
              <OperationsPortal isAmharic={isAmharic} onLogout={handleLogout} />
            )}

            {session.portal === 'management' && (
              <ManagementDashboard isAmharic={isAmharic} onLogout={handleLogout} />
            )}
          </>
        )}
      </main>

      {/* Modernist Subtle Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '18px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        background: 'var(--bg-surface)'
      }}>
        Abyssinia Intercity Bus Platform © 2026. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
