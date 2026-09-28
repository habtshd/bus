import React, { useState } from 'react';
import { 
  Headphones, MessageSquare, AlertCircle, Package, Send, 
  CheckCircle2, Clock, Phone, Mail, MapPin, ChevronRight
} from 'lucide-react';

interface CustomerSupportViewProps {
  isAmharic?: boolean;
}

export const CustomerSupportView: React.FC<CustomerSupportViewProps> = ({ isAmharic = false }) => {
  const [activeTab, setActiveTab] = useState<'complaint' | 'lost-item' | 'refund-status'>('lost-item');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [tripPnr, setTripPnr] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [seatNumber, setSeatNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refNum = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedMessage(`Your ${activeTab === 'lost-item' ? 'Lost Item Report' : 'Support Ticket'} #${refNum} has been received. Our terminal team will contact ${phone || 'you'} within 30 minutes.`);
    
    // reset form
    setDescription('');
    setSubject('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Headphones size={24} color="#0284c7" />
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isAmharic ? 'የተሳፋሪዎች አገልግሎትና እገዛ ማዕከል' : 'Passenger Support & Care'}
          </h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isAmharic 
            ? 'በጉዞ ላይ የጠፉ እቃዎችን ሪፖርት ያድርጉ፣ ቅሬታዎን ያስመዝግቡ ወይም የገንዘብ ተመላሽ ሁኔታን ያረጋግጡ።' 
            : '24/7 dedicated assistance for baggage claims, lost items, booking inquiries, and instant refund verification.'}
        </p>

        {/* Hotlines */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={18} color="#0284c7" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CALL CENTER HOTLINE</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>+251 11 278 1122</strong>
            </div>
          </div>
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={18} color="#0284c7" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SUPPORT EMAIL</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>support@abyssiniabus.et</strong>
            </div>
          </div>
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} color="#0284c7" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CENTRAL TERMINAL DESK</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Autobis Tera Gate #12</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => { setActiveTab('lost-item'); setSubmittedMessage(null); }}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'lost-item' ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
            background: activeTab === 'lost-item' ? '#0284c7' : 'var(--bg-surface)',
            color: activeTab === 'lost-item' ? '#fff' : 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={16} />
          {isAmharic ? 'የጠፋ እቃ ሪፖርት' : 'Lost & Found Baggage'}
        </button>

        <button
          onClick={() => { setActiveTab('complaint'); setSubmittedMessage(null); }}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'complaint' ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
            background: activeTab === 'complaint' ? '#0284c7' : 'var(--bg-surface)',
            color: activeTab === 'complaint' ? '#fff' : 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} />
          {isAmharic ? 'ቅሬታ ወይም ጥቆማ' : 'Complaints & Feedback'}
        </button>

        <button
          onClick={() => { setActiveTab('refund-status'); setSubmittedMessage(null); }}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeTab === 'refund-status' ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
            background: activeTab === 'refund-status' ? '#0284c7' : 'var(--bg-surface)',
            color: activeTab === 'refund-status' ? '#fff' : 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={16} />
          {isAmharic ? 'የተመላሽ ገንዘብ ሁኔታ' : 'Refund Inquiries'}
        </button>
      </div>

      {submittedMessage ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid #10b981',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.4rem' }}>
            Report Successfully Registered
          </h2>
          <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', marginInline: 'auto' }}>
            {submittedMessage}
          </p>
          <button
            onClick={() => setSubmittedMessage(null)}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '28px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Passenger Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Almaz Tadesse"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 0911223344"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Booking PNR or Ticket #
                </label>
                <input
                  type="text"
                  value={tripPnr}
                  onChange={e => setTripPnr(e.target.value)}
                  placeholder="e.g. 1A85C6 or TKT-416454"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Seat Number (if known)
                </label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={e => setSeatNumber(e.target.value)}
                  placeholder="e.g. 12A"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {activeTab === 'lost-item' ? 'Item Name / Description *' : 'Subject *'}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={activeTab === 'lost-item' ? 'e.g. Black leather backpack with laptop' : 'e.g. Bus air conditioning issue'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Detailed Explanation *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe what happened, travel date, and which terminal or highway corridor..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                padding: '12px 28px',
                borderRadius: '10px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px'
              }}
            >
              <Send size={16} />
              Submit Report
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
