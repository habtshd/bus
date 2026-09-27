import React, { useState, useEffect } from 'react';
import { fetchAnalytics, fetchRoutes } from '../lib/api';
import { BarChart3, TrendingUp, Users, Bus, CreditCard, Banknote, ArrowUpRight, UserCheck, Building2, MapPin, Shield } from 'lucide-react';

interface ManagementDashboardProps {
  isAmharic: boolean;
}

type ManagementSubTab = 'overview' | 'drivers' | 'branches' | 'staff' | 'routes';

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ isAmharic }) => {
  const [data, setData] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ManagementSubTab>('overview');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [res, rData] = await Promise.all([
        fetchAnalytics(),
        fetchRoutes()
      ]);
      setData(res);
      setRoutes(rData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Pre-seeded company drivers (Day 6 Spec)
  const driversList = [
    { id: '1', name: 'Kebede Worku', phone: '+251 91 199 8877', license: 'ETH-DRV-44912', exp: '12 yrs', status: 'ON_TRIP', bus: 'BUS-101 (3-45678 ET)' },
    { id: '2', name: 'Fikadu Hailu', phone: '+251 92 288 7766', license: 'ETH-DRV-55823', exp: '9 yrs', status: 'AVAILABLE', bus: 'BUS-102 (3-56789 ET)' },
    { id: '3', name: 'Mohammed Ahmed', phone: '+251 91 355 4433', license: 'ETH-DRV-66734', exp: '15 yrs', status: 'AVAILABLE', bus: 'BUS-103 (3-67890 ET)' },
    { id: '4', name: 'Tsegaye Haile', phone: '+251 91 777 6655', license: 'ETH-DRV-77845', exp: '8 yrs', status: 'STANDBY', bus: 'Unassigned' }
  ];

  // Pre-seeded company branches (Day 6 Spec)
  const branchesList = [
    { id: 'b1', name: 'Autobis Tera Main Branch', city: 'Addis Ababa', terminal: 'Autobis Tera Central Terminal Office #12', phone: '+251 11 278 1122', manager: 'Kassahun Worku', agentsCount: 4 },
    { id: 'b2', name: 'Kality Terminal Branch', city: 'Addis Ababa', terminal: 'Kality South Departure Gate #04', phone: '+251 11 434 2233', manager: 'Mulugeta Assefa', agentsCount: 3 },
    { id: 'b3', name: 'Hawassa Central Branch', city: 'Hawassa', terminal: 'Piazza Intercity Ticket Center', phone: '+251 46 220 5544', manager: 'Dereje Tefera', agentsCount: 2 },
    { id: 'b4', name: 'Bahir Dar Branch', city: 'Bahir Dar', terminal: 'Main Highway Terminal Office #02', phone: '+251 58 226 7788', manager: 'Yonas Gebre', agentsCount: 2 }
  ];

  // Pre-seeded staff users (Day 6 Spec)
  const staffList = [
    { id: 'u1', name: 'Yonas Tadesse', email: 'admin@abyssiniabus.et', role: 'SUPER_ADMIN', branch: 'Autobis Tera Main', phone: '+251 91 123 4567' },
    { id: 'u2', name: 'Tigist Bekele', email: 'agent.autobistera@abyssiniabus.et', role: 'TICKET_AGENT', branch: 'Autobis Tera Main', phone: '+251 92 234 5678' },
    { id: 'u3', name: 'Mulugeta Assefa', email: 'agent.kality@abyssiniabus.et', role: 'TICKET_AGENT', branch: 'Kality Terminal', phone: '+251 93 345 6789' },
    { id: 'u4', name: 'Alemu Girma', email: 'conductor.alemu@abyssiniabus.et', role: 'CONDUCTOR', branch: 'Autobis Tera Main', phone: '+251 94 456 7890' },
    { id: 'u5', name: 'Selamawit Haile', email: 'accountant@abyssiniabus.et', role: 'ACCOUNTANT', branch: 'HQ Finance', phone: '+251 91 222 3344' }
  ];

  if (loading || !data) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading executive analytics...</div>;
  }

  const { summary, paymentBreakdown, recentBookings } = data;

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Cockpit Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '6px' }}>
            EXECUTIVE OPERATIONS & ENTERPRISE MANAGEMENT
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {isAmharic ? 'የስራ አመራር ዳሽቦርድ እና የኩባንያው መቆጣጠሪያ' : 'Executive Management & Administration'}
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Single-company operational visibility: Revenue, Fleet, Drivers, Regional Branches & Staff.
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(24, 34, 52, 0.7)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <BarChart3 size={14} /> Revenue & Occupancy
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`btn ${activeTab === 'drivers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <UserCheck size={14} /> Drivers ({driversList.length})
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`btn ${activeTab === 'branches' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Building2 size={14} /> Branches ({branchesList.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <Users size={14} /> Staff / RBAC
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`btn ${activeTab === 'routes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <MapPin size={14} /> Routes & Stops
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL REVENUE</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color="var(--ethiopia-gold)" />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-gold)', letterSpacing: '-0.02em' }}>
                {summary.totalRevenueETB.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>ETB</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ethiopia-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={14} /> +18.4% this week
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVERAGE OCCUPANCY</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="var(--ethiopia-green)" />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--ethiopia-green)' }}>
                {summary.overallOccupancyRatePercent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Target: 80% load factor
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TICKETS ISSUED / BOARDED</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={20} color="#38BDF8" />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                {summary.boardedPassengers} / {summary.totalTicketsSold}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Across {summary.totalTripsToday} scheduled departures
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE BUSES</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(147, 51, 234, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={20} color="#C084FC" />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                {summary.activeBuses} / 3 Buses
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ethiopia-green)', marginTop: '4px' }}>
                100% active on routes
              </div>
            </div>
          </div>

          {/* Sales Channels & Payment Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                Sales Channel Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Banknote size={16} color="var(--ethiopia-green)" />
                      <strong>Branch Counter (Cash)</strong>
                    </span>
                    <span>{summary.counterSalesETB.toLocaleString()} ETB</span>
                  </div>
                  <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(summary.counterSalesETB / (summary.totalRevenueETB || 1)) * 100}%`,
                      background: 'var(--ethiopia-green)'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={16} color="#38BDF8" />
                      <strong>Online / Telebirr Web</strong>
                    </span>
                    <span>{summary.onlineSalesETB.toLocaleString()} ETB</span>
                  </div>
                  <div style={{ height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(summary.onlineSalesETB / (summary.totalRevenueETB || 1)) * 100}%`,
                      background: '#0284C7'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                Payment Gateways
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.entries(paymentBreakdown).map(([method, stats]: any) => (
                  <div key={method} style={{ padding: '14px', background: '#0F172A', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{method}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0' }}>
                      {stats.totalETB.toLocaleString()} ETB
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {stats.count} transactions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings Feed */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
              Recent Passenger Bookings Feed
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px' }}>REFERENCE</th>
                  <th style={{ padding: '10px' }}>PASSENGER</th>
                  <th style={{ padding: '10px' }}>ROUTE</th>
                  <th style={{ padding: '10px' }}>SEATS</th>
                  <th style={{ padding: '10px' }}>PAYMENT</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-gold)' }}>{b.bookingReference}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customerPhone}</div>
                    </td>
                    <td style={{ padding: '10px' }}>{b.trip?.route?.originStation?.city} ➔ {b.trip?.route?.destinationStation?.city}</td>
                    <td style={{ padding: '10px' }}>
                      {b.tickets.map((t: any) => (
                        <span key={t.id} className="badge badge-gold" style={{ marginRight: '4px', fontSize: '0.75rem' }}>
                          {t.seatNumber}
                        </span>
                      ))}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${b.paymentMethod === 'CASH' ? 'badge-green' : 'badge-blue'}`}>
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800 }}>
                      {b.totalAmountETB} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: DRIVER MANAGEMENT */}
      {activeTab === 'drivers' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Company Driver Directory & Commercial Transit Licenses
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px' }}>DRIVER NAME</th>
                <th style={{ padding: '10px' }}>PHONE</th>
                <th style={{ padding: '10px' }}>LICENSE NUMBER</th>
                <th style={{ padding: '10px' }}>EXPERIENCE</th>
                <th style={{ padding: '10px' }}>ASSIGNED VEHICLE</th>
                <th style={{ padding: '10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {driversList.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{d.name}</td>
                  <td style={{ padding: '10px' }}>{d.phone}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{d.license}</td>
                  <td style={{ padding: '10px' }}>{d.exp}</td>
                  <td style={{ padding: '10px' }}>{d.bus}</td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge ${d.status === 'ON_TRIP' ? 'badge-blue' : d.status === 'AVAILABLE' ? 'badge-green' : 'badge-gold'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BRANCH MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Regional Branch Offices & Ticket Counters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {branchesList.map(b => (
              <div key={b.id} style={{ background: '#0F172A', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-gold">{b.city}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.agentsCount} Ticket Agents</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>{b.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{b.terminal}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager: <strong>{b.manager}</strong></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tel: {b.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Staff User Accounts & Role-Based Permissions (RBAC)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px' }}>STAFF MEMBER</th>
                <th style={{ padding: '10px' }}>EMAIL</th>
                <th style={{ padding: '10px' }}>SYSTEM ROLE</th>
                <th style={{ padding: '10px' }}>ASSIGNED BRANCH</th>
                <th style={{ padding: '10px' }}>CONTACT</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{s.name}</td>
                  <td style={{ padding: '10px' }}>{s.email}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge badge-gold">{s.role}</span>
                  </td>
                  <td style={{ padding: '10px' }}>{s.branch}</td>
                  <td style={{ padding: '10px' }}>{s.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: ROUTES & STOPS */}
      {activeTab === 'routes' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Intercity Network Corridors & Checkpoint Stops
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {routes.map(r => (
              <div key={r.id} style={{ background: '#0F172A', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                    {r.originStation.nameEn} ➔ {r.destinationStation.nameEn}
                  </h4>
                  <div style={{ fontWeight: 800, color: 'var(--text-gold)' }}>
                    Standard Fare: {r.baseFareETB} ETB
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>Distance: <strong>{r.distanceKm} km</strong></div>
                  <div>Estimated Time: <strong>{r.estimatedDurationHours} hours</strong></div>
                  <div>Origin Terminal: <strong>{r.originStation.terminalArea}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
