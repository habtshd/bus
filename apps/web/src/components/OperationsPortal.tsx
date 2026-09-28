import React, { useState } from 'react';
import { 
  Store, UserCheck, Bus, QrCode, Radio, Wrench, Headphones,
  ShieldCheck, FileText, ChevronRight, CheckCircle2, AlertTriangle,
  Clock, DollarSign, MapPin, Search, Filter, Phone, User, RefreshCw, LogOut
} from 'lucide-react';
import { AgentCounterPOS } from './AgentCounterPOS';
import { DriverPortal } from './DriverPortal';
import { ConductorBoardingScanner } from './ConductorBoardingScanner';
import { OperationsDispatcher } from './OperationsDispatcher';
import { CheckpointManifestView } from './CheckpointManifestView';
import { PortalAuthCard, AuthUser } from './PortalAuthCard';

export type OperationRole = 
  | 'AGENT' 
  | 'BRANCH_MANAGER' 
  | 'DRIVER' 
  | 'CONDUCTOR' 
  | 'DISPATCHER' 
  | 'FLEET' 
  | 'SUPPORT';

interface OperationsPortalProps {
  isAmharic?: boolean;
  initialRole?: OperationRole;
  onLogout?: () => void;
}

export const OperationsPortal: React.FC<OperationsPortalProps> = ({ isAmharic = false, initialRole, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('abyssinia_ops_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState<OperationRole>(() => {
    if (initialRole) return initialRole;
    if (currentUser?.role) {
      switch (currentUser.role) {
        case 'TICKET_AGENT': return 'AGENT';
        case 'BRANCH_MANAGER': return 'BRANCH_MANAGER';
        case 'DRIVER': return 'DRIVER';
        case 'CONDUCTOR': return 'CONDUCTOR';
        case 'DISPATCHER': return 'DISPATCHER';
        case 'FLEET_MANAGER': return 'FLEET';
        case 'CUSTOMER_SUPPORT': return 'SUPPORT';
      }
    }
    return 'AGENT';
  });
  
  // Fleet state
  const [fleetTab, setFleetTab] = useState<'buses' | 'maintenance' | 'fuel' | 'parts'>('buses');
  
  // Support state
  const [searchPnr, setSearchPnr] = useState('');
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<any>(null);
  const [refundPnr, setRefundPnr] = useState('');
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  // Branch Manager state
  const [selectedBranch, setSelectedBranch] = useState('Autobis Tera Central Terminal');

  const staffPresets = [
    { label: 'Hana Bekele', roleName: 'TICKET_AGENT', email: 'hana.bekele@abyssiniabus.et', password: 'Password123!', badge: 'Ticket Agent (POS)' },
    { label: 'Kassahun Worku', roleName: 'BRANCH_MANAGER', email: 'kassahun@abyssiniabus.et', password: 'Password123!', badge: 'Branch Manager' },
    { label: 'Girma Tadesse', roleName: 'DRIVER', email: 'girma.driver@abyssiniabus.et', password: 'Password123!', badge: 'Driver Cockpit' },
    { label: 'Ermias Assefa', roleName: 'CONDUCTOR', email: 'ermias.conductor@abyssiniabus.et', password: 'Password123!', badge: 'Conductor QR Gate' },
    { label: 'Yohannes Haile', roleName: 'DISPATCHER', email: 'dispatch@abyssiniabus.et', password: 'Password123!', badge: 'Corridor Dispatcher' },
    { label: 'Solomon Bekele', roleName: 'FLEET_MANAGER', email: 'solomon.tech@abyssiniabus.et', password: 'Password123!', badge: 'Depot Fleet Tech' },
    { label: 'Selamawit Desta', roleName: 'CUSTOMER_SUPPORT', email: 'support@abyssiniabus.et', password: 'Password123!', badge: 'Passenger Helpdesk' },
  ];

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    const userWithToken = { ...user, token };
    setCurrentUser(userWithToken);
    localStorage.setItem('abyssinia_ops_session', JSON.stringify(userWithToken));

    // Map role
    if (user.role === 'TICKET_AGENT') setActiveRole('AGENT');
    else if (user.role === 'BRANCH_MANAGER') setActiveRole('BRANCH_MANAGER');
    else if (user.role === 'DRIVER') setActiveRole('DRIVER');
    else if (user.role === 'CONDUCTOR') setActiveRole('CONDUCTOR');
    else if (user.role === 'DISPATCHER') setActiveRole('DISPATCHER');
    else if (user.role === 'FLEET_MANAGER') setActiveRole('FLEET');
    else if (user.role === 'CUSTOMER_SUPPORT') setActiveRole('SUPPORT');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('abyssinia_ops_session');
    if (onLogout) onLogout();
  };

  // If not logged in, render the Operations Authentication Gateway
  if (!currentUser) {
    return (
      <div style={{ padding: '24px 20px', minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PortalAuthCard
          portalTitle={isAmharic ? 'የስራ ክፍሎች መግቢያ በር' : 'Operations Portal Staff Access'}
          portalSubtitle={isAmharic 
            ? 'ለትኬት ቆጣሪዎች፣ ለአሽከርካሪዎች፣ ለኮንዳክተሮች እና ለስምሪት ሰራተኞች የተዘጋጀ ደህንነቱ የተጠበቀ መግቢያ' 
            : 'Secure role-authenticated access for ticket agents, dispatchers, drivers, conductors, and depot engineers.'}
          portalBadge={isAmharic ? 'የስራ ክፍሎች ፖርታል' : 'Operations Portal'}
          portalBadgeColor="#0284c7"
          allowedRoles={['TICKET_AGENT', 'BRANCH_MANAGER', 'DRIVER', 'CONDUCTOR', 'DISPATCHER', 'FLEET_MANAGER', 'CUSTOMER_SUPPORT', 'SUPER_ADMIN']}
          presets={staffPresets}
          onLoginSuccess={handleLoginSuccess}
          isAmharic={isAmharic}
        />
      </div>
    );
  }

  const roles = [
    { id: 'AGENT', label: isAmharic ? 'የቲኬት ቆጣሪ (POS)' : 'Ticket Agent POS', icon: Store, badge: 'Counter' },
    { id: 'BRANCH_MANAGER', label: isAmharic ? 'የቅርንጫፍ ስራ አስኪያጅ' : 'Branch Manager', icon: UserCheck, badge: 'Terminal' },
    { id: 'DRIVER', label: isAmharic ? 'አሽከርካሪ (Cockpit)' : 'Driver Cockpit', icon: Bus, badge: 'En-Route' },
    { id: 'CONDUCTOR', label: isAmharic ? 'ኮንዳክተር (QR Scan)' : 'Conductor Gate', icon: QrCode, badge: 'Boarding' },
    { id: 'DISPATCHER', label: isAmharic ? 'የስምሪት መቆጣጠሪያ' : 'Dispatcher Command', icon: Radio, badge: 'Corridor' },
    { id: 'FLEET', label: isAmharic ? 'የተሽከርካሪ ጥገና' : 'Fleet & Maintenance', icon: Wrench, badge: 'Depot' },
    { id: 'SUPPORT', label: isAmharic ? 'የተሳፋሪዎች አገልግሎት' : 'Passenger Support', icon: Headphones, badge: 'Helpdesk' },
  ];

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & Role Switcher */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                background: 'rgba(56, 189, 248, 0.12)', 
                color: '#0284c7', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Portal 2 · Operations
              </span>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {isAmharic ? 'የአሰራርና የስራ ክፍሎች ፖርታል' : 'Operations Portal (Active Staff Session)'}
              </h1>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isAmharic 
                ? 'በተሰጠዎት የስራ ሃላፊነት መሰረት የሚቀያየር የስራ አመራር ስርዓት' 
                : 'Role-based operational interface dynamically adapting permissions, tools, and workflows.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Authenticated Staff Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'var(--bg-card)', 
              padding: '6px 14px', 
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                {currentUser.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{currentUser.fullName}</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>{currentUser.role}</div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'var(--bg-card)', 
              padding: '8px 14px', 
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Station:</span>
              <strong style={{ color: 'var(--text-main)' }}>{currentUser.branchName || 'Autobis Tera Central Terminal'}</strong>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              <span>{isAmharic ? 'ውጣ' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Role Pills */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px'
        }}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id as OperationRole)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                  background: isSelected ? '#0284c7' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{role.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)'
                }}>
                  {role.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Role Views */}
      {activeRole === 'AGENT' && <AgentCounterPOS isAmharic={isAmharic} />}
      {activeRole === 'DRIVER' && <DriverPortal isAmharic={isAmharic} />}
      {activeRole === 'CONDUCTOR' && <ConductorBoardingScanner isAmharic={isAmharic} />}
      {activeRole === 'DISPATCHER' && <OperationsDispatcher isAmharic={isAmharic} />}

      {/* Branch Manager View */}
      {activeRole === 'BRANCH_MANAGER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Branch KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TODAY'S BRANCH TICKETS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>148</div>
              <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '6px' }}>↑ 12% vs yesterday</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>CASH IN SAFE (RECONCILED)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '8px' }}>ETB 84,360</div>
              <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '6px' }}>100% Drawer Balanced</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>ACTIVE COUNTER AGENTS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>6 Agents</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>All shifts on track</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TERMINAL DEPARTURES</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>12 Departures</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>96.5% on-time</div>
            </div>
          </div>

          {/* Agents Performance Table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Counter Agents Shift Status & Cash Reconciliation</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Agent Name</th>
                    <th style={{ padding: '12px' }}>Counter Window</th>
                    <th style={{ padding: '12px' }}>Shift Start</th>
                    <th style={{ padding: '12px' }}>Opening Float</th>
                    <th style={{ padding: '12px' }}>Tickets Sold</th>
                    <th style={{ padding: '12px' }}>Cash Collected</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Hana Bekele</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Window #01 (Bahir Dar Express)</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>05:30 AM</td>
                    <td style={{ padding: '12px' }}>ETB 2,500.00</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>42</td>
                    <td style={{ padding: '12px', color: '#0284c7', fontWeight: 700 }}>ETB 35,700.00</td>
                    <td style={{ padding: '12px' }}><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>BALANCED</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Tewodros Kassahun</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Window #02 (Hawassa / South)</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>06:00 AM</td>
                    <td style={{ padding: '12px' }}>ETB 2,000.00</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>54</td>
                    <td style={{ padding: '12px', color: '#0284c7', fontWeight: 700 }}>ETB 24,300.00</td>
                    <td style={{ padding: '12px' }}><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>BALANCED</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Bethlehem Hailu</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>Window #03 (Dire Dawa Express)</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>06:00 AM</td>
                    <td style={{ padding: '12px' }}>ETB 2,000.00</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>32</td>
                    <td style={{ padding: '12px', color: '#0284c7', fontWeight: 700 }}>ETB 24,000.00</td>
                    <td style={{ padding: '12px' }}><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>BALANCED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fleet & Maintenance View */}
      {activeRole === 'FLEET' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub tabs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setFleetTab('buses')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: fleetTab === 'buses' ? 'var(--text-main)' : 'var(--bg-surface)',
                color: fleetTab === 'buses' ? 'var(--bg-main)' : 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Active Coaches (3)
            </button>
            <button
              onClick={() => setFleetTab('maintenance')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: fleetTab === 'maintenance' ? 'var(--text-main)' : 'var(--bg-surface)',
                color: fleetTab === 'maintenance' ? 'var(--bg-main)' : 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Work Orders & Service Logs
            </button>
            <button
              onClick={() => setFleetTab('fuel')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: fleetTab === 'fuel' ? 'var(--text-main)' : 'var(--bg-surface)',
                color: fleetTab === 'fuel' ? 'var(--bg-main)' : 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Fuel Consumption & Receipts
            </button>
            <button
              onClick={() => setFleetTab('parts')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: fleetTab === 'parts' ? 'var(--text-main)' : 'var(--bg-surface)',
                color: fleetTab === 'parts' ? 'var(--bg-main)' : 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Spare Parts Inventory
            </button>
          </div>

          {fleetTab === 'buses' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {[
                { plate: '3-A99102 ET', side: 'SB-023', make: 'Scania Marcopolo 1200', year: 2023, odo: '84,250 km', status: 'IN_SERVICE', fuelEff: '28.5 L/100km', nextService: '90,000 km' },
                { plate: '3-B10293 ET', side: 'SB-024', make: 'Scania Marcopolo 1200', year: 2023, odo: '62,100 km', status: 'IN_SERVICE', fuelEff: '27.9 L/100km', nextService: '70,000 km' },
                { plate: '3-C55421 ET', side: 'SB-025', make: 'Golden Dragon Navigator', year: 2024, odo: '31,400 km', status: 'IN_SERVICE', fuelEff: '26.5 L/100km', nextService: '40,000 km' }
              ].map(b => (
                <div key={b.side} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>{b.side}</span>
                      <h4 style={{ margin: '4px 0', fontSize: '1.15rem', color: 'var(--text-main)' }}>{b.plate}</h4>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.make} ({b.year})</div>
                    </div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {b.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Odometer: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{b.odo}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Fuel Efficiency: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{b.fuelEff}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Next Service: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{b.nextService}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Insurance: </span>
                      <strong style={{ color: '#10b981' }}>Valid 2027</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {fleetTab === 'maintenance' && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Maintenance History & Open Work Orders</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: 'var(--text-main)' }}>WO-2026-0815 · Preventive Service "A" (SB-023)</strong>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}>COMPLETED</span>
                  </div>
                  <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Engine oil flush, Scania fuel filter replacement, and front/rear ceramic brake pad thickness check.
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                    <span>Technician: Solomon Bekele</span>
                    <span>Cost: ETB 12,500.00</span>
                    <span>Odometer: 80,000 km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {fleetTab === 'fuel' && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Fuel Transaction Logs (Electronic Station Clearing)</h3>
              <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--text-main)' }}>TotalEnergies Gotera Terminal Station · Coach SB-023</strong>
                  <strong style={{ color: '#0284c7' }}>ETB 27,000.00</strong>
                </div>
                <div style={{ margin: '8px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  240.0 Liters Diesel @ ETB 112.50/L · Driver: Girma Tadesse · Fuel Card #FC-ETH-9921
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receipt #TOT-2026-88912 · Verified & Matched via GPS Telemetry</div>
              </div>
            </div>
          )}

          {fleetTab === 'parts' && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Spare Parts Storehouse Inventory</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Part #</th>
                    <th style={{ padding: '10px' }}>Description</th>
                    <th style={{ padding: '10px' }}>Category</th>
                    <th style={{ padding: '10px' }}>In Stock</th>
                    <th style={{ padding: '10px' }}>Unit Cost</th>
                    <th style={{ padding: '10px' }}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>SC-OIL-FIL-09</td>
                    <td style={{ padding: '10px' }}>Scania Oil Filter Element</td>
                    <td style={{ padding: '10px' }}>Filters</td>
                    <td style={{ padding: '10px', color: '#10b981', fontWeight: 700 }}>18 units</td>
                    <td style={{ padding: '10px' }}>ETB 1,850.00</td>
                    <td style={{ padding: '10px' }}>Scania Commercial Parts Ethiopia</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>BRK-PAD-HD-22</td>
                    <td style={{ padding: '10px' }}>Heavy-Duty Ceramic Brake Pads</td>
                    <td style={{ padding: '10px' }}>Brakes</td>
                    <td style={{ padding: '10px', color: '#f59e0b', fontWeight: 700 }}>8 sets</td>
                    <td style={{ padding: '10px' }}>ETB 6,400.00</td>
                    <td style={{ padding: '10px' }}>Addis Brake Importers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Passenger Support View */}
      {activeRole === 'SUPPORT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Search Passenger & Booking */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} />
              Passenger & PNR Investigation
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter PNR (e.g. 1A85C6) or Phone (0911...)"
                value={searchPnr}
                onChange={e => setSearchPnr(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
              <button
                onClick={() => {
                  setSelectedSupportTicket({
                    pnr: searchPnr || '1A85C6',
                    passenger: 'Almaz Tadesse',
                    phone: '+251911223344',
                    trip: 'ETB-AA-BD-01 (Addis Ababa -> Bahir Dar)',
                    seat: '12A',
                    payment: 'TELEBIRR (ETB 850.00)',
                    paymentStatus: 'PAID / SETTLED',
                    ticketStatus: 'CONFIRMED (Boarded)',
                    nationalId: 'ET-9912048123'
                  });
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>

            {selectedSupportTicket && (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ color: '#0284c7' }}>PNR #{selectedSupportTicket.pnr}</strong>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {selectedSupportTicket.paymentStatus}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Passenger: </span><strong style={{ color: 'var(--text-main)' }}>{selectedSupportTicket.passenger}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Phone: </span><strong style={{ color: 'var(--text-main)' }}>{selectedSupportTicket.phone}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>National ID: </span><strong style={{ color: 'var(--text-main)' }}>{selectedSupportTicket.nationalId}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Trip: </span><strong style={{ color: 'var(--text-main)' }}>{selectedSupportTicket.trip}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Seat Number: </span><strong style={{ color: 'var(--text-main)' }}>{selectedSupportTicket.seat}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Payment Channel: </span><strong style={{ color: 'var(--text-main)' }}>{selectedSupportTicket.payment}</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => alert(`Resend SMS Ticket to ${selectedSupportTicket.phone} triggered via Ethio Telecom Gateway`)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Resend SMS Ticket
                  </button>
                  <button
                    onClick={() => {
                      setRefundStatus('Approved: ETB 765.00 refunded to Telebirr wallet (10% policy fee applied).');
                    }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Initiate Refund
                  </button>
                </div>
                {refundStatus && (
                  <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.8rem' }}>
                    {refundStatus}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lost & Found Item Tickets */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Lost & Found Baggage Reports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>TKT-SUP-89102 · Black Samsonite Backpack</strong>
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>INVESTIGATING</span>
                </div>
                <p style={{ margin: '6px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Reported by Abebe Kebede (+251911445588) on Trip ETB-AA-BD-01. Left on overhead rack near Seat 04B.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    onClick={() => alert('Conductor Ermias notified via in-app alert to inspect bus luggage compartment.')}
                    style={{ padding: '6px 12px', borderRadius: '6px', background: '#0284c7', color: '#fff', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Contact Bus Conductor
                  </button>
                  <button 
                    onClick={() => alert('Passenger notified: Item located at Bahir Dar Terminal Office.')}
                    style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Mark Found & Notify Passenger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
