import React, { useState } from 'react';
import { 
  Compass, MapPin, Clock, Calendar, ShieldCheck, Wifi, 
  Coffee, Mountain, CheckCircle2, ChevronRight, Star, ExternalLink, HelpCircle
} from 'lucide-react';

interface RouteGuideProps {
  onSelectRoute?: (origin: string, destination: string) => void;
  isAmharic?: boolean;
}

export const TouristRouteGuideSEO: React.FC<RouteGuideProps> = ({ onSelectRoute, isAmharic = false }) => {
  const [selectedRouteSlug, setSelectedRouteSlug] = useState('addis-ababa-to-bahir-dar');

  const routeGuides = [
    {
      slug: 'addis-ababa-to-bahir-dar',
      origin: 'Addis Ababa',
      destination: 'Bahir Dar',
      originAm: 'አዲስ አበባ',
      destinationAm: 'ባሕር ዳር',
      distanceKm: 620,
      durationHours: 9,
      baseFareETB: 850,
      highway: 'A2 Trans-Ethiopian Highway',
      scenicHighlights: 'Blue Nile Gorge (Abay River Canyon), Debre Sina Mountain Pass, Lake Tana Islands',
      departureTimes: ['06:00 AM Daily', '07:00 AM Express'],
      departureStation: 'Autobis Tera Central Terminal, Gate 12',
      arrivalStation: 'Bahir Dar Lake Highway Terminal',
      description: 'The premier scenic highway corridor in northern Ethiopia. Travel through the breathtaking 1,000-meter drop of the Blue Nile Gorge, historic Debre Sina mountain pass, and arrive along the tropical palm-lined shores of Lake Tana.',
      seoTitle: 'Addis Ababa to Bahir Dar Bus Tickets & Timetable 2026 | Abyssinia Bus',
      seoDescription: 'Book daily luxury intercity bus tickets from Addis Ababa to Bahir Dar. 45-seat Scania luxury coaches with WiFi, AC, and panoramic views of the Blue Nile Gorge. Direct online booking with Telebirr & international cards.',
      highlights: [
        'Safe, professional two-driver rotation through the Blue Nile Gorge',
        '25-minute breakfast rest stop at Debre Sina mountain station',
        'Modern 45-seat Scania Marcopolo coaches with reclining seats',
        '30 kg luggage allowance included in ticket fare'
      ],
      faqs: [
        { q: 'Where does the bus depart in Addis Ababa?', a: 'All Bahir Dar coaches depart from Autobis Tera Central Terminal, Platform 12 at 06:00 AM sharp.' },
        { q: 'Can tourists pay with international cards or mobile money?', a: 'Yes, we accept Telebirr, CBE Birr, Chapa, and international Visa/Mastercard online.' },
        { q: 'Is luggage included in the ticket?', a: 'Each passenger is allowed 1 large checked bag (up to 30 kg) plus 1 small carry-on bag.' }
      ]
    },
    {
      slug: 'addis-ababa-to-hawassa',
      origin: 'Addis Ababa',
      destination: 'Hawassa',
      originAm: 'አዲስ አበባ',
      destinationAm: 'ሀዋሳ',
      distanceKm: 275,
      durationHours: 4,
      baseFareETB: 450,
      highway: 'Addis-Adama & Mojo-Hawassa Expressway',
      scenicHighlights: 'Great Rift Valley Lakes (Lake Ziway, Lake Langano, Lake Hawassa), Acacia Savannah',
      departureTimes: ['07:00 AM Daily', '08:30 AM Express', '01:30 PM Afternoon'],
      departureStation: 'Kality South Departure Gate #04',
      arrivalStation: 'Hawassa Piazza Central Terminal',
      description: 'Fast, smooth transit along Ethiopia’s newest four-lane expressway corridor into the lush Southern Rift Valley. Perfect for weekend getaways, bird watching, and relaxing at lakeside resorts.',
      seoTitle: 'Addis Ababa to Hawassa Luxury Bus Booking | Abyssinia Bus Express',
      seoDescription: 'Travel smoothly from Addis Ababa to Hawassa in under 4 hours via the new Mojo-Hawassa Expressway. Daily departures from Kality Terminal with onboard WiFi and USB charging.',
      highlights: [
        '100% four-lane expressway transit with minimum traffic delays',
        'Panoramic views of Great Rift Valley freshwater lakes and pelicans',
        'High-speed 4-hour connection between the capital and Hawassa',
        'Convenient southern departure from Kality Terminal'
      ],
      faqs: [
        { q: 'Which terminal do Hawassa buses use?', a: 'Buses depart directly from Kality South Terminal (Gate #04) with direct access to the Expressway.' },
        { q: 'How long is the travel time?', a: 'Express coaches complete the 275 km trip in approximately 3.5 to 4 hours including a 15-minute rest stop.' }
      ]
    },
    {
      slug: 'addis-ababa-to-dire-dawa',
      origin: 'Addis Ababa',
      destination: 'Dire Dawa',
      originAm: 'አዲስ አበባ',
      destinationAm: 'ድሬዳዋ',
      distanceKm: 450,
      durationHours: 7,
      baseFareETB: 750,
      highway: 'A1 Eastern Corridor Highway',
      scenicHighlights: 'Adama Escarpment, Awash National Park wildlife crossing, Great Rift Valley plains',
      departureTimes: ['06:30 AM Daily'],
      departureStation: 'Autobis Tera Central Terminal, Gate 08',
      arrivalStation: 'Dire Dawa Kezira Railway Station',
      description: 'Journey eastward from the central highlands through Awash National Park to the historic cosmopolitan oasis of Dire Dawa and the gateway to Harar Jugol UNESCO World Heritage City.',
      seoTitle: 'Addis Ababa to Dire Dawa & Harar Bus Schedule & Booking | Abyssinia Bus',
      seoDescription: 'Direct daily morning departures from Addis Ababa to Dire Dawa. Scenic route past Awash National Park with luxury air-conditioned coaches and verified safety standards.',
      highlights: [
        'Scenic transit bordering Awash National Park with gazelle and oryx sightings',
        'Air-conditioned cabins designed for the warm Eastern Ethiopian climate',
        'Convenient hub for passengers continuing onward to Harar Old Town (50 km)',
        'Comprehensive onboard safety telemetry and GPS speed monitoring'
      ],
      faqs: [
        { q: 'How far is Harar from Dire Dawa?', a: 'Harar is just a 45-minute minibus ride (50 km) from the Dire Dawa Kezira Terminal.' }
      ]
    },
    {
      slug: 'addis-ababa-to-gondar',
      origin: 'Addis Ababa',
      destination: 'Gondar',
      originAm: 'አዲስ አበባ',
      destinationAm: 'ጎንደር',
      distanceKm: 740,
      durationHours: 11,
      baseFareETB: 1100,
      highway: 'A2 Trans-Ethiopian Northern Route',
      scenicHighlights: 'Historic Amhara highlands, Fasilides royal castles gateway, Simien Mountains backdrop',
      departureTimes: ['05:30 AM Daily Express'],
      departureStation: 'Autobis Tera Central Terminal, Gate 14',
      arrivalStation: 'Gondar Azezo Intercity Hub',
      description: 'The ultimate overland journey into Ethiopia’s Camelot. Experience historic mountain passes, vibrant highland market towns, and arrive in the royal capital of Emperor Fasilides.',
      seoTitle: 'Addis Ababa to Gondar Intercity Bus Tickets | Abyssinia Bus S.C.',
      seoDescription: 'Book official coach tickets from Addis Ababa to Gondar. Premium travel with reserved seating, national ID manifest compliance, and certified drivers.',
      highlights: [
        'Dedicated express service with verified highway security clearance',
        'Includes complimentary bottled water and breakfast snack pack',
        'Gateway city to Simien Mountains National Park trekking'
      ],
      faqs: [
        { q: 'What time does the Gondar bus depart?', a: 'Due to the 740 km distance, departures begin at 05:30 AM with check-in open from 04:45 AM.' }
      ]
    }
  ];

  const currentGuide = routeGuides.find(r => r.slug === selectedRouteSlug) || routeGuides[0];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* Schema.org Structured Data Injection for Google Rich Snippets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BusTrip",
          "provider": {
            "@type": "BusCompany",
            "name": "Abyssinia Bus S.C.",
            "url": "https://abyssiniabus.et",
            "telephone": "+251-11-278-1122"
          },
          "departureStation": {
            "@type": "BusStation",
            "name": currentGuide.departureStation,
            "address": { "@type": "PostalAddress", "addressLocality": currentGuide.origin, "addressCountry": "ET" }
          },
          "arrivalStation": {
            "@type": "BusStation",
            "name": currentGuide.arrivalStation,
            "address": { "@type": "PostalAddress", "addressLocality": currentGuide.destination, "addressCountry": "ET" }
          },
          "offers": {
            "@type": "Offer",
            "price": currentGuide.baseFareETB,
            "priceCurrency": "ETB",
            "availability": "https://schema.org/InStock",
            "validFrom": "2026-01-01"
          }
        })
      }} />

      {/* SEO Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Compass size={18} />
          <span>OFFICIAL ETHIOPIAN INTERCITY HIGHWAY TRAVEL GUIDE</span>
        </div>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
          {currentGuide.seoTitle}
        </h1>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '850px', lineHeight: 1.6 }}>
          {currentGuide.seoDescription}
        </p>
      </div>

      {/* Route Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {routeGuides.map(r => {
          const isSelected = r.slug === selectedRouteSlug;
          return (
            <button
              key={r.slug}
              onClick={() => setSelectedRouteSlug(r.slug)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: isSelected ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                background: isSelected ? '#0284c7' : 'var(--bg-surface)',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {r.origin} ➔ {r.destination} (ETB {r.baseFareETB})
            </button>
          );
        })}
      </div>

      {/* Route Details Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Left Column: Route Profile & Highlights */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>HIGHWAY CORRIDOR</span>
              <h2 style={{ margin: '4px 0', fontSize: '1.4rem', color: 'var(--text-main)' }}>
                {currentGuide.origin} ➔ {currentGuide.destination}
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentGuide.highway}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ONE-WAY FARE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>ETB {currentGuide.baseFareETB}</div>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {currentGuide.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'var(--bg-card)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DISTANCE</div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{currentGuide.distanceKm} km</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DURATION</div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>~{currentGuide.durationHours} hrs</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FREQUENCY</div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Daily</strong>
            </div>
          </div>

          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-main)' }}>Travel Highlights</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            {currentGuide.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        {/* Right Column: Schedule & Booking CTA */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Daily Departures & Terminal Gates</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {currentGuide.departureTimes.map((time, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} color="#0284c7" />
                    <strong style={{ color: 'var(--text-main)' }}>{time}</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Guaranteed Coach</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Boarding Terminal: </span>
                <strong style={{ color: 'var(--text-main)' }}>{currentGuide.departureStation}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Drop-off Terminal: </span>
                <strong style={{ color: 'var(--text-main)' }}>{currentGuide.arrivalStation}</strong>
              </div>
            </div>

            {/* Onboard Amenities */}
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wifi size={14} color="#10b981" /> 4G Onboard WiFi</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} color="#10b981" /> GPS Tracked</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coffee size={14} color="#10b981" /> Scheduled Rest Stop</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectRoute) {
                onSelectRoute(currentGuide.origin, currentGuide.destination);
              } else {
                window.location.hash = '#search';
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.3)'
            }}
          >
            <span>Book {currentGuide.origin} to {currentGuide.destination}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ SEO Schema) */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '28px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} color="#0284c7" />
          Frequently Asked Questions for Travelers & Tourists
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentGuide.faqs.map((faq, idx) => (
            <div key={idx} style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '6px' }}>
                {faq.q}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
