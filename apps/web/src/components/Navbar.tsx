import React from 'react';
import { Bus, Ticket, Store, ShieldCheck, QrCode, BarChart3, Globe, Radio, Search, Rocket } from 'lucide-react';

export type AppTab = 'passenger' | 'mobile-app' | 'my-bookings' | 'agent' | 'driver' | 'dispatch' | 'manifest' | 'conductor' | 'analytics' | 'pilot-launch';

interface NavbarProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  isAmharic: boolean;
  setIsAmharic: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, isAmharic, setIsAmharic }) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.95)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setTab('passenger')}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--ethiopia-gold), #B45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--ethiopia-gold-glow)'
          }}>
            <Bus size={22} color="#0B0F19" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ABYSSINIA BUS</span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>MVP</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isAmharic ? 'አቢሲኒያ የረጅም ርቀት አውቶቡስ' : 'Ethiopian Intercity Bus Platform'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(24, 34, 52, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('passenger')}
            className={`btn ${currentTab === 'passenger' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Ticket size={14} />
            <span>{isAmharic ? 'ድረ-ገጽ' : 'Web Booking'}</span>
          </button>

          <button
            onClick={() => setTab('mobile-app')}
            className={`btn ${currentTab === 'mobile-app' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Ticket size={14} />
            <span>{isAmharic ? 'ሞባይል መተግበሪያ' : 'Mobile App'}</span>
          </button>

          <button
            onClick={() => setTab('my-bookings')}
            className={`btn ${currentTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Search size={14} />
            <span>{isAmharic ? 'ትኬቴ' : 'My Bookings'}</span>
          </button>

          <button
            onClick={() => setTab('agent')}
            className={`btn ${currentTab === 'agent' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Store size={14} />
            <span>{isAmharic ? 'ካውንተር' : 'Agent POS'}</span>
          </button>

          <button
            onClick={() => setTab('driver')}
            className={`btn ${currentTab === 'driver' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Radio size={14} />
            <span>{isAmharic ? 'አሽከርካሪ' : 'Driver App'}</span>
          </button>

          <button
            onClick={() => setTab('dispatch')}
            className={`btn ${currentTab === 'dispatch' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <Radio size={14} />
            <span>{isAmharic ? 'ስምሪት' : 'Dispatch'}</span>
          </button>

          <button
            onClick={() => setTab('manifest')}
            className={`btn ${currentTab === 'manifest' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <ShieldCheck size={14} />
            <span>{isAmharic ? 'ማኒፌስት' : 'Manifest'}</span>
          </button>

          <button
            onClick={() => setTab('conductor')}
            className={`btn ${currentTab === 'conductor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <QrCode size={14} />
            <span>{isAmharic ? 'ስካነር' : 'Scanner'}</span>
          </button>

          <button
            onClick={() => setTab('analytics')}
            className={`btn ${currentTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <BarChart3 size={14} />
            <span>{isAmharic ? 'ማኔጅመንት' : 'Management'}</span>
          </button>

          <button
            onClick={() => setTab('pilot-launch')}
            className={`btn ${currentTab === 'pilot-launch' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', fontSize: '0.8rem', borderColor: 'var(--ethiopia-gold)' }}
          >
            <Rocket size={14} color="var(--ethiopia-gold)" />
            <span style={{ fontWeight: 800 }}>{isAmharic ? 'ምረቃ' : 'Launch & Pilot'}</span>
          </button>
        </nav>

        {/* Right actions: Language & API status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsAmharic(!isAmharic)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            title="Toggle English / Amharic"
          >
            <Globe size={14} color="var(--ethiopia-gold)" />
            <span style={{ fontWeight: 700 }}>{isAmharic ? 'English' : 'አማርኛ'}</span>
          </button>

          <div className="badge badge-green" style={{ fontSize: '0.7rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ethiopia-green)' }}></span>
            <span>API :4000</span>
          </div>
        </div>
      </div>
    </header>
  );
};
