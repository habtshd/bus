import React from 'react';
import { Bus, Ticket, Store, ShieldCheck, QrCode, BarChart3, Globe } from 'lucide-react';

export type AppTab = 'passenger' | 'agent' | 'manifest' | 'conductor' | 'analytics';

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
      background: 'rgba(11, 15, 25, 0.9)',
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
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setTab('passenger')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--ethiopia-gold), #B45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--ethiopia-gold-glow)'
          }}>
            <Bus size={24} color="#0B0F19" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ABYSSINIA BUS</span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>MVP</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isAmharic ? 'አቢሲኒያ የረጅም ርቀት አውቶቡስ ትራንስፖርት' : 'Ethiopian Intercity Bus Platform'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(24, 34, 52, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setTab('passenger')}
            className={`btn ${currentTab === 'passenger' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Ticket size={16} />
            <span>{isAmharic ? 'የመንገደኛ ቦታ ማስያዝ' : 'Passenger Booking'}</span>
          </button>

          <button
            onClick={() => setTab('agent')}
            className={`btn ${currentTab === 'agent' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Store size={16} />
            <span>{isAmharic ? 'የቅርንጫፍ ካውንተር POS' : 'Branch Agent POS'}</span>
          </button>

          <button
            onClick={() => setTab('manifest')}
            className={`btn ${currentTab === 'manifest' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={16} />
            <span>{isAmharic ? 'የፖሊስ ማኒፌስት' : 'Checkpoint Manifest'}</span>
          </button>

          <button
            onClick={() => setTab('conductor')}
            className={`btn ${currentTab === 'conductor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <QrCode size={16} />
            <span>{isAmharic ? 'ኮንዳክተር QR ስካነር' : 'Conductor Scanner'}</span>
          </button>

          <button
            onClick={() => setTab('analytics')}
            className={`btn ${currentTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <BarChart3 size={16} />
            <span>{isAmharic ? 'ማኔጅመንት ዳሽቦርድ' : 'Management'}</span>
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
