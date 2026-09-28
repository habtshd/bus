import React, { useState } from 'react';
import { 
  Ticket, Compass, Radio, Search, Headphones, Smartphone,
  User, ShieldCheck, LogOut, CheckCircle2, ChevronRight
} from 'lucide-react';
import { PassengerPortal } from './PassengerPortal';
import { TouristRouteGuideSEO } from './TouristRouteGuideSEO';
import { EthiopiaLiveFleetMap } from './EthiopiaLiveFleetMap';
import { MyBookingsView } from './MyBookingsView';
import { CustomerSupportView } from './CustomerSupportView';
import { PassengerMobileSimulator } from './PassengerMobileSimulator';
import { PortalAuthCard, AuthUser } from './PortalAuthCard';

export type PassengerSubTab = 
  | 'booking' 
  | 'route-guide' 
  | 'live-tracking' 
  | 'my-bookings' 
  | 'support' 
  | 'mobile-app';

export type CustomerSubTab = PassengerSubTab;

interface PassengerPortalProps {
  isAmharic?: boolean;
  onLogout?: () => void;
}

export type CustomerPortalProps = PassengerPortalProps;

export const CustomerPortal: React.FC<PassengerPortalProps> = ({ isAmharic = false, onLogout }) => {
  const [passengerUser, setPassengerUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('abyssinia_passenger_session') || localStorage.getItem('abyssinia_customer_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeSubTab, setActiveSubTab] = useState<PassengerSubTab>('booking');

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    const userWithToken = { ...user, token };
    setPassengerUser(userWithToken);
    localStorage.setItem('abyssinia_passenger_session', JSON.stringify(userWithToken));
    localStorage.setItem('abyssinia_customer_session', JSON.stringify(userWithToken));
  };

  const handleLogout = () => {
    setPassengerUser(null);
    localStorage.removeItem('abyssinia_passenger_session');
    localStorage.removeItem('abyssinia_customer_session');
    if (onLogout) onLogout();
  };

  const handleGuestAccess = () => {
    const guestUser: AuthUser = {
      id: `usr_guest_${Date.now()}`,
      fullName: isAmharic ? 'እንግዳ ተሳፋሪ' : 'Guest Traveler',
      email: 'guest.traveler@abyssiniabus.et',
      phone: '+251 91 122 3344',
      nationalId: 'KB-ET-GUEST-01',
      role: 'PASSENGER'
    };
    handleLoginSuccess(guestUser, 'guest_session_token');
  };

  // MANDATORY AUTHENTICATION GATE: The passenger portal can ONLY be accessed by passing the authentication page!
  if (!passengerUser) {
    return (
      <div style={{ padding: '40px 20px', minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PortalAuthCard
          portalTitle={isAmharic ? 'የተሳፋሪ ፖርታል መግቢያ በር' : 'Passenger Portal Access'}
          portalSubtitle={isAmharic 
            ? 'የረጅም ርቀት የጉዞ መስመሮችን ለመፈለግ፣ በቴሌብር/ሲቢኢ መቀመጫ ለመያዝ እና ዲጂታል QR ትኬት ለማግኘት መለያዎን ያስገቡ ወይም ይመዝገቡ።' 
            : 'Sign in or register to search Ethiopian intercity routes, secure seats via Telebirr / CBE Birr, and access cryptographic QR e-tickets.'}
          portalBadge={isAmharic ? 'የተሳፋሪ ፖርታል' : 'Passenger Portal · Ticket Booking'}
          portalBadgeColor="var(--ethiopia-gold)"
          allowRegistration={true}
          presets={[
            { label: 'Almaz Tadesse', roleName: 'PASSENGER', email: 'almaz.passenger@example.com', password: 'Password123!', badge: 'Frequent Traveler' },
            { label: 'John Doe (Tourist)', roleName: 'PASSENGER', email: 'tourist.john@traveler.com', password: 'Password123!', badge: 'International Tourist' }
          ]}
          onLoginSuccess={handleLoginSuccess}
          onGuestAccess={handleGuestAccess}
          isAmharic={isAmharic}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Authenticated Passenger Header & Independent Sub-Navigation */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Passenger Identity Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ethiopia-gold)',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                {passengerUser.fullName}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--ethiopia-green)'
              }}>
                {isAmharic ? 'የተረጋገጠ ተሳፋሪ' : 'Verified Traveler'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>{passengerUser.email}</span>
              {passengerUser.phone && <span> • {passengerUser.phone}</span>}
              {passengerUser.nationalId && <span> • ID: {passengerUser.nationalId}</span>}
            </div>
          </div>
        </div>

        {/* Passenger Portal Sub-Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--nav-pill-bg)',
          padding: '4px',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveSubTab('booking')}
            className={`btn ${activeSubTab === 'booking' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px', fontWeight: activeSubTab === 'booking' ? 700 : 500, gap: '6px' }}
          >
            <Ticket size={14} />
            <span>{isAmharic ? 'ትኬት ይቁረጡ' : 'Book Trips'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('route-guide')}
            className={`btn ${activeSubTab === 'route-guide' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px', fontWeight: activeSubTab === 'route-guide' ? 700 : 500, gap: '6px' }}
          >
            <Compass size={14} />
            <span>{isAmharic ? 'የጉዞ መስመሮች' : 'Route Guides'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('live-tracking')}
            className={`btn ${activeSubTab === 'live-tracking' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px', fontWeight: activeSubTab === 'live-tracking' ? 700 : 500, gap: '6px' }}
          >
            <Radio size={14} />
            <span>{isAmharic ? 'የአውቶቡስ መገኛ' : 'Live Fleet'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my-bookings')}
            className={`btn ${activeSubTab === 'my-bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px', fontWeight: activeSubTab === 'my-bookings' ? 700 : 500, gap: '6px' }}
          >
            <Search size={14} />
            <span>{isAmharic ? 'ትኬቴን ፈልግ' : 'My Bookings'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('support')}
            className={`btn ${activeSubTab === 'support' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px', fontWeight: activeSubTab === 'support' ? 700 : 500, gap: '6px' }}
          >
            <Headphones size={14} />
            <span>{isAmharic ? 'ድጋፍ' : 'Support'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mobile-app')}
            className={`btn ${activeSubTab === 'mobile-app' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '999px', fontWeight: activeSubTab === 'mobile-app' ? 700 : 500, gap: '6px' }}
          >
            <Smartphone size={14} />
            <span>{isAmharic ? 'ሞባይል መተግበሪያ' : 'Mobile App'}</span>
          </button>
        </nav>

        {/* Passenger Portal Sign Out */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <LogOut size={14} />
          <span>{isAmharic ? 'ውጣ' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Active Sub-Module View */}
      {activeSubTab === 'booking' && <PassengerPortal isAmharic={isAmharic} />}
      {activeSubTab === 'route-guide' && (
        <TouristRouteGuideSEO 
          isAmharic={isAmharic} 
          onSelectRoute={(origin, dest) => {
            setActiveSubTab('booking');
          }} 
        />
      )}
      {activeSubTab === 'live-tracking' && <EthiopiaLiveFleetMap isAmharic={isAmharic} />}
      {activeSubTab === 'my-bookings' && <MyBookingsView isAmharic={isAmharic} />}
      {activeSubTab === 'support' && <CustomerSupportView isAmharic={isAmharic} />}
      {activeSubTab === 'mobile-app' && <PassengerMobileSimulator isAmharic={isAmharic} />}
    </div>
  );
};

export const PassengerPortalWrapper = CustomerPortal;

