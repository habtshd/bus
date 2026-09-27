import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../lib/api';
import { BarChart3, TrendingUp, Users, Bus, CreditCard, Banknote, Calendar, ArrowUpRight } from 'lucide-react';

interface ManagementDashboardProps {
  isAmharic: boolean;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ isAmharic }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const res = await fetchAnalytics();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading executive analytics...</div>;
  }

  const { summary, paymentBreakdown, recentBookings } = data;

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div className="badge badge-gold" style={{ marginBottom: '6px' }}>
          EXECUTIVE OPERATIONS COCKPIT
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {isAmharic ? 'የስራ አመራር ዳሽቦርድ እና የገቢ ሪፖርት' : 'Executive Management Dashboard & Revenue'}
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Real-time visibility into intercity trip occupancy, branch cash drawers, and digital Telebirr revenue.
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Revenue */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL REVENUE (ETB)</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="var(--ethiopia-gold)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-gold)', letterSpacing: '-0.02em' }}>
            {summary.totalRevenueETB.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>ETB</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ethiopia-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +18.4% vs yesterday
          </div>
        </div>

        {/* Occupancy Rate */}
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

        {/* Passengers Boarded */}
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

        {/* Active Fleet */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FLEET UTILIZATION</span>
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

      {/* Two Column Section: Channel Breakdown & Payment Mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Sales Channels: Counter vs Online */}
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

        {/* Payment Methods */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
            Payment Methods Breakdown
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
    </div>
  );
};
