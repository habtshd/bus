import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Gauge,
  MapPin,
  AlertTriangle,
  Clock,
  Phone,
  Radio,
  ShieldAlert,
  CheckCircle2,
  Users,
  Fuel,
  Maximize2,
  Filter,
  Eye,
  Send,
  Wrench,
  Bus
} from 'lucide-react';

export interface FleetVehicleTelemetry {
  tripId: string;
  tripCode: string;
  busPlate: string;
  busSide: string;
  busModel: string;
  busType: string;
  driverName: string;
  driverPhone: string;
  routeTitle: string;
  corridor: 'HAWASSA' | 'BAHIR_DAR' | 'DIRE_DAWA' | 'GONDAR' | 'JIMMA';
  currentMilestone: string;
  speedKmH: number;
  progressPercent: number; // 0 to 100 along path
  occupancyCount: number;
  totalCapacity: number;
  fuelPercent: number;
  status: 'IN_TRANSIT' | 'AT_TERMINAL' | 'REST_STOP' | 'DELAYED' | 'OVERSPEED';
  coordinates: { x: number; y: number };
  headingDeg: number;
  estimatedArrival: string;
}

interface EthiopiaLiveFleetMapProps {
  onDelayTrip?: (tripCode: string) => void;
  onEmergencyReroute?: (tripCode: string) => void;
  isAmharic: boolean;
}

export const EthiopiaLiveFleetMap: React.FC<EthiopiaLiveFleetMapProps> = ({
  onDelayTrip,
  onEmergencyReroute,
  isAmharic
}) => {
  const [activeCorridorFilter, setActiveCorridorFilter] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicleTelemetry | null>(null);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [showSpeedAlertsOnly, setShowSpeedAlertsOnly] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  // Initial Real-Time Fleet Vehicles on Ethiopian Corridors
  const [vehicles, setVehicles] = useState<FleetVehicleTelemetry[]>([
    {
      tripId: 'tel_01',
      tripCode: 'AB-101',
      busPlate: 'ET-3-92144',
      busSide: '#401',
      busModel: 'Yutong ZK6122H VIP',
      busType: 'LUXURY_2X2',
      driverName: 'Dawit Mengistu',
      driverPhone: '+251 91 123 4567',
      routeTitle: 'Addis Ababa ➔ Hawassa',
      corridor: 'HAWASSA',
      currentMilestone: 'Ziway / Batu Tollway Rest Stop',
      speedKmH: 74,
      progressPercent: 55,
      occupancyCount: 41,
      totalCapacity: 45,
      fuelPercent: 82,
      status: 'IN_TRANSIT',
      coordinates: { x: 480, y: 360 },
      headingDeg: 170,
      estimatedArrival: '10:30 AM'
    },
    {
      tripId: 'tel_02',
      tripCode: 'AB-201',
      busPlate: 'ET-3-51209',
      busSide: '#302',
      busModel: 'Zhongtong Elegance',
      busType: 'STANDARD_2X3',
      driverName: 'Abebe Bikila',
      driverPhone: '+251 91 345 6789',
      routeTitle: 'Addis Ababa ➔ Bahir Dar',
      corridor: 'BAHIR_DAR',
      currentMilestone: 'Dejen Scenic Blue Nile Gorge Bypass',
      speedKmH: 66,
      progressPercent: 42,
      occupancyCount: 46,
      totalCapacity: 49,
      fuelPercent: 68,
      status: 'IN_TRANSIT',
      coordinates: { x: 428, y: 215 },
      headingDeg: 330,
      estimatedArrival: '02:30 PM'
    },
    {
      tripId: 'tel_03',
      tripCode: 'AB-301',
      busPlate: 'ET-3-77412',
      busSide: '#502',
      busModel: 'Yutong ZK6122H VIP',
      busType: 'LUXURY_2X2',
      driverName: 'Kassahun Belay',
      driverPhone: '+251 91 456 7890',
      routeTitle: 'Addis Ababa ➔ Dire Dawa',
      corridor: 'DIRE_DAWA',
      currentMilestone: 'Awash Arba Junction Checkpoint',
      speedKmH: 78,
      progressPercent: 60,
      occupancyCount: 39,
      totalCapacity: 45,
      fuelPercent: 62,
      status: 'IN_TRANSIT',
      coordinates: { x: 590, y: 282 },
      headingDeg: 80,
      estimatedArrival: '02:45 PM'
    },
    {
      tripId: 'tel_04',
      tripCode: 'AB-104',
      busPlate: 'ET-3-88201',
      busSide: '#405',
      busModel: 'Golden Dragon Navigator VIP',
      busType: 'LUXURY_2X2',
      driverName: 'Solomon Tadesse',
      driverPhone: '+251 91 234 5678',
      routeTitle: 'Hawassa ➔ Addis Ababa (Northbound)',
      corridor: 'HAWASSA',
      currentMilestone: 'Mojo Expressway Toll Plaza (Approaching)',
      speedKmH: 84, // OVERSPEED (>80 km/h FDRE limit)
      progressPercent: 82,
      occupancyCount: 43,
      totalCapacity: 45,
      fuelPercent: 49,
      status: 'OVERSPEED',
      coordinates: { x: 495, y: 320 },
      headingDeg: 350,
      estimatedArrival: '11:15 AM'
    },
    {
      tripId: 'tel_05',
      tripCode: 'AB-501',
      busPlate: 'ET-3-44129',
      busSide: '#603',
      busModel: 'Yutong ZK6122H VIP',
      busType: 'LUXURY_2X2',
      driverName: 'Yohannes Girma',
      driverPhone: '+251 91 678 9012',
      routeTitle: 'Addis Ababa ➔ Jimma',
      corridor: 'JIMMA',
      currentMilestone: 'Gibe River Valley Crossing',
      speedKmH: 58,
      progressPercent: 68,
      occupancyCount: 35,
      totalCapacity: 45,
      fuelPercent: 71,
      status: 'IN_TRANSIT',
      coordinates: { x: 375, y: 355 },
      headingDeg: 230,
      estimatedArrival: '01:00 PM'
    }
  ]);

  // Real-Time GPS Heartbeat Simulation
  useEffect(() => {
    if (!isLiveSimulating) return;

    const timer = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          // Slight speed fluctuation within realistic ranges
          const speedDelta = (Math.random() - 0.5) * 4;
          let newSpeed = Math.round(Math.max(45, Math.min(88, v.speedKmH + speedDelta)));
          const isOver = newSpeed > 80;

          // Micro coordinate movement along path
          const deltaX = (Math.random() - 0.45) * 1.2;
          const deltaY = (Math.random() - 0.45) * 1.2;

          return {
            ...v,
            speedKmH: newSpeed,
            status: isOver ? 'OVERSPEED' : v.status === 'OVERSPEED' ? 'IN_TRANSIT' : v.status,
            coordinates: {
              x: Number((v.coordinates.x + deltaX).toFixed(1)),
              y: Number((v.coordinates.y + deltaY).toFixed(1))
            }
          };
        })
      );
    }, 3500);

    return () => clearInterval(timer);
  }, [isLiveSimulating]);

  // Major Highway Waypoints / Terminals in Ethiopia
  const waypoints = [
    { id: 'addis', name: 'Addis Ababa (Hub)', nameAm: 'አዲስ አበባ', x: 460, y: 280, isHub: true },
    { id: 'mojo', name: 'Mojo Tollway', nameAm: 'ሞጆ', x: 505, y: 312 },
    { id: 'ziway', name: 'Lake Ziway / Batu', nameAm: 'ዝዋይ / ባቱ', x: 482, y: 365 },
    { id: 'hawassa', name: 'Hawassa Terminal', nameAm: 'ሀዋሳ', x: 470, y: 425, isTerminal: true },
    { id: 'dejen', name: 'Dejen Gorge', nameAm: 'ደጀን', x: 430, y: 220 },
    { id: 'debrmarkos', name: 'Debre Markos', nameAm: 'ደብረ ማርቆስ', x: 412, y: 185 },
    { id: 'bahirdar', name: 'Bahir Dar Lake Tana', nameAm: 'ባሕር ዳር', x: 390, y: 140, isTerminal: true },
    { id: 'gondar', name: 'Gondar Fasilides', nameAm: 'ጎንደር', x: 395, y: 88, isTerminal: true },
    { id: 'adama', name: 'Adama Expressway', nameAm: 'አዳማ', x: 525, y: 300 },
    { id: 'awash', name: 'Awash Junction', nameAm: 'አዋሽ', x: 590, y: 280 },
    { id: 'diredawa', name: 'Dire Dawa Kezira', nameAm: 'ድሬዳዋ', x: 665, y: 250, isTerminal: true },
    { id: 'welkite', name: 'Welkite Stop', nameAm: 'ወልቂጤ', x: 410, y: 322 },
    { id: 'jimma', name: 'Jimma Aba Jifar', nameAm: 'ጅማ', x: 350, y: 372, isTerminal: true }
  ];

  // Highway corridors
  const highwayPaths = [
    {
      id: 'hawassa',
      corridor: 'HAWASSA',
      name: 'Rift Valley Highway',
      pathD: 'M 460 280 L 505 312 L 482 365 L 470 425',
      color: '#10B981'
    },
    {
      id: 'bahirdar',
      corridor: 'BAHIR_DAR',
      name: 'Blue Nile Gorge Highway',
      pathD: 'M 460 280 L 430 220 L 412 185 L 390 140',
      color: '#0284C7'
    },
    {
      id: 'gondar',
      corridor: 'GONDAR',
      name: 'Historic North Highway',
      pathD: 'M 390 140 L 395 88',
      color: '#A855F7'
    },
    {
      id: 'diredawa',
      corridor: 'DIRE_DAWA',
      name: 'Eastern Awash Highway',
      pathD: 'M 460 280 L 525 300 L 590 280 L 665 250',
      color: '#F59E0B'
    },
    {
      id: 'jimma',
      corridor: 'JIMMA',
      name: 'Coffee Highlands Highway',
      pathD: 'M 460 280 L 410 322 L 350 372',
      color: '#EC4899'
    }
  ];

  const filteredVehicles = vehicles.filter((v) => {
    if (activeCorridorFilter !== 'ALL' && v.corridor !== activeCorridorFilter) return false;
    if (showSpeedAlertsOnly && v.status !== 'OVERSPEED') return false;
    return true;
  });

  const overspeedCount = vehicles.filter((v) => v.status === 'OVERSPEED').length;

  function handleSendBroadcastSMS(v: FleetVehicleTelemetry) {
    setSmsSentNotice(`SMS broadcast dispatched to all ${v.occupancyCount} passengers on ${v.tripCode} regarding ETA update.`);
    setTimeout(() => setSmsSentNotice(null), 4000);
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Map Control Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid var(--ethiopia-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Navigation size={22} color="var(--ethiopia-gold)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {isAmharic ? 'የኢትዮጵያ የቀጥታ አውራ ጎዳና የፍሊት ካርታ' : 'Ethiopia Live Highway Fleet GPS Map'}
              </h3>
              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                {isLiveSimulating ? 'STREAM ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {isAmharic
                ? 'በአዲስ አበባ፣ ሀዋሳ፣ ባሕር ዳር፣ ድሬዳዋ እና ጅማ አውራ ጎዳናዎች የሚጓዙ አውቶቡሶች የቀጥታ ፍጥነት እና መገኛ'
                : 'Real-time telemetry pings across Great Rift Valley, Blue Nile Gorge, Awash & Jimma Corridors'}
            </div>
          </div>
        </div>

        {/* Action Controls & Speed Warning Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {overspeedCount > 0 && (
            <button
              onClick={() => setShowSpeedAlertsOnly(!showSpeedAlertsOnly)}
              className="btn btn-secondary"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'var(--ethiopia-red)',
                color: '#F87171',
                padding: '6px 12px',
                fontSize: '0.75rem',
                gap: '6px'
              }}
            >
              <AlertTriangle size={14} color="#EF4444" />
              <span>{overspeedCount} Overspeed Alert (&gt;80 km/h)</span>
            </button>
          )}

          <button
            onClick={() => setShowCheckpoints(!showCheckpoints)}
            className={`btn ${showCheckpoints ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <MapPin size={14} />
            <span>Checkpoints</span>
          </button>

          <button
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Radio size={14} color={isLiveSimulating ? 'var(--ethiopia-green)' : 'var(--text-muted)'} />
            <span>{isLiveSimulating ? 'Pause GPS' : 'Resume GPS'}</span>
          </button>
        </div>
      </div>

      {/* Corridor Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {[
          { key: 'ALL', label: 'All Corridors (ሁሉም)', count: vehicles.length },
          { key: 'HAWASSA', label: 'Addis ➔ Hawassa (Rift Valley)', count: 2, color: '#10B981' },
          { key: 'BAHIR_DAR', label: 'Addis ➔ Bahir Dar (Nile Gorge)', count: 1, color: '#0284C7' },
          { key: 'DIRE_DAWA', label: 'Addis ➔ Dire Dawa (Awash)', count: 1, color: '#F59E0B' },
          { key: 'JIMMA', label: 'Addis ➔ Jimma (Highlands)', count: 1, color: '#EC4899' }
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setActiveCorridorFilter(chip.key)}
            className={`btn ${activeCorridorFilter === chip.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              borderRadius: '20px'
            }}
          >
            {chip.color && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: chip.color }} />
            )}
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* SMS Broadcast Alert Toast */}
      {smsSentNotice && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--ethiopia-green)',
            padding: '10px 16px',
            borderRadius: '8px',
            color: 'var(--ethiopia-green)',
            fontSize: '0.85rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{smsSentNotice}</span>
        </div>
      )}

      {/* Split Grid: Left = Interactive Map Canvas, Right = Vehicle Telemetry Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedVehicle ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'flex-start' }}>

        {/* Vector SVG Map Container */}
        <div
          style={{
            position: 'relative',
            background: 'var(--nav-pill-bg)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            minHeight: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Compass Rose */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '6px 10px',
              background: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>N ↑</span>
            <span>ETHIOPIA HIGHWAY GRID</span>
          </div>

          {/* Interactive Scalable SVG Map Canvas */}
          <svg
            viewBox="300 60 420 400"
            style={{
              width: '100%',
              height: '520px',
              cursor: 'grab',
              userSelect: 'none'
            }}
          >
            {/* Soft Ethiopia Territory Contour Outline (Stylized) */}
            <path
              d="M 330 220 Q 360 120 400 80 Q 520 70 600 120 Q 710 180 700 280 Q 640 370 540 430 Q 420 440 350 380 Z"
              fill="rgba(245, 158, 11, 0.03)"
              stroke="var(--border-subtle)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />

            {/* Highway Corridor Tracks */}
            {highwayPaths.map((h) => {
              const isHighlighted = activeCorridorFilter === 'ALL' || activeCorridorFilter === h.corridor;
              return (
                <g key={h.id}>
                  {/* Highway Glow underlay */}
                  <path
                    d={h.pathD}
                    fill="none"
                    stroke={h.color}
                    strokeWidth={isHighlighted ? 6 : 2}
                    strokeOpacity={isHighlighted ? 0.3 : 0.1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Highway Main Track */}
                  <path
                    d={h.pathD}
                    fill="none"
                    stroke={h.color}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : 0.3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Flowing animated traffic dash */}
                  {isHighlighted && isLiveSimulating && (
                    <path
                      d={h.pathD}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeDasharray="6,18"
                      strokeLinecap="round"
                      strokeOpacity="0.7"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-48"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </path>
                  )}
                </g>
              );
            })}

            {/* Waypoint Stations & Terminals */}
            {showCheckpoints &&
              waypoints.map((wp) => (
                <g key={wp.id} transform={`translate(${wp.x}, ${wp.y})`}>
                  {wp.isHub ? (
                    // Addis Ababa Main Capital Hub Marker
                    <>
                      <circle r="10" fill="rgba(245, 158, 11, 0.25)" />
                      <circle r="6" fill="var(--ethiopia-gold)" />
                      <circle r="2.5" fill="#0B0F19" />
                      <text
                        x="0"
                        y="-14"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="900"
                        fill="var(--text-main)"
                        paintOrder="stroke"
                        stroke="var(--bg-main)"
                        strokeWidth="3"
                      >
                        {wp.name}
                      </text>
                    </>
                  ) : wp.isTerminal ? (
                    // Destination Terminal
                    <>
                      <rect x="-5" y="-5" width="10" height="10" rx="2" fill="var(--ethiopia-green)" />
                      <text
                        x="0"
                        y="14"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="800"
                        fill="var(--text-main)"
                        paintOrder="stroke"
                        stroke="var(--bg-main)"
                        strokeWidth="2.5"
                      >
                        {wp.name}
                      </text>
                    </>
                  ) : (
                    // Intermediate Waypoint / Rest Stop
                    <>
                      <circle r="3.5" fill="var(--text-secondary)" opacity="0.8" />
                      <text
                        x="6"
                        y="3"
                        fontSize="7"
                        fill="var(--text-muted)"
                        paintOrder="stroke"
                        stroke="var(--bg-main)"
                        strokeWidth="2"
                      >
                        {wp.name}
                      </text>
                    </>
                  )}
                </g>
              ))}

            {/* Live Moving Bus Vehicles */}
            {filteredVehicles.map((v) => {
              const isSelected = selectedVehicle?.tripId === v.tripId;
              const isOverspeed = v.status === 'OVERSPEED';

              return (
                <g
                  key={v.tripId}
                  transform={`translate(${v.coordinates.x}, ${v.coordinates.y})`}
                  onClick={() => setSelectedVehicle(v)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Ping animation ripple */}
                  <circle
                    r={isSelected ? 16 : 12}
                    fill={isOverspeed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)'}
                  >
                    <animate
                      attributeName="r"
                      values="8;20;8"
                      dur={isOverspeed ? '1s' : '2.5s'}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.1;0.8"
                      dur={isOverspeed ? '1s' : '2.5s'}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Vehicle Body Box */}
                  <rect
                    x="-12"
                    y="-8"
                    width="24"
                    height="16"
                    rx="4"
                    fill={isOverspeed ? '#EF4444' : isSelected ? 'var(--ethiopia-gold)' : '#10B981'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />

                  {/* Windshield */}
                  <rect x="4" y="-5" width="5" height="10" rx="1.5" fill="#0B0F19" />

                  {/* Bus Side # label */}
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="900"
                    fill="#FFFFFF"
                  >
                    {v.busSide}
                  </text>

                  {/* Top Floating Badge: Trip Code & Speed */}
                  <g transform="translate(0, -14)">
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="12"
                      rx="3"
                      fill="#0B0F19"
                      stroke={isOverspeed ? '#EF4444' : 'var(--ethiopia-gold)'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="800"
                      fill={isOverspeed ? '#F87171' : '#FCD34D'}
                    >
                      {v.tripCode} • {v.speedKmH}k
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Drawer: Selected Vehicle Telemetry Card */}
        {selectedVehicle && (
          <div
            style={{
              background: 'var(--nav-pill-bg)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Header with Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                  {selectedVehicle.tripCode} • {selectedVehicle.busSide}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {selectedVehicle.routeTitle}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Plate: {selectedVehicle.busPlate} ({selectedVehicle.busModel})
                </div>
              </div>

              <button
                onClick={() => setSelectedVehicle(null)}
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              >
                ✕
              </button>
            </div>

            {/* Speed & Safety Status */}
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: selectedVehicle.status === 'OVERSPEED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: selectedVehicle.status === 'OVERSPEED' ? '1px solid #EF4444' : '1px solid #10B981',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gauge size={20} color={selectedVehicle.status === 'OVERSPEED' ? '#EF4444' : '#10B981'} />
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>
                    {selectedVehicle.speedKmH} <span style={{ fontSize: '0.75rem' }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    FDRE Limit: 80 km/h
                  </div>
                </div>
              </div>

              <span
                className={`badge ${selectedVehicle.status === 'OVERSPEED' ? 'badge-red' : 'badge-green'}`}
                style={{ fontSize: '0.7rem' }}
              >
                {selectedVehicle.status === 'OVERSPEED' ? '⚡ OVERSPEED' : '✓ NORMAL'}
              </span>
            </div>

            {/* Current Waypoint Milestone */}
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>CURRENT MILESTONE</div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--ethiopia-gold)" />
                <span>{selectedVehicle.currentMilestone}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Est. Arrival at Terminal: <strong>{selectedVehicle.estimatedArrival}</strong>
              </div>
            </div>

            {/* Passenger Load & Fuel Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PASSENGERS</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} color="var(--ethiopia-green)" />
                  <span>{selectedVehicle.occupancyCount} / {selectedVehicle.totalCapacity}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Manifest Verified</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DIESEL TANK</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Fuel size={14} color="var(--ethiopia-gold)" />
                  <span>{selectedVehicle.fuelPercent}%</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Sufficient for ETA</div>
              </div>
            </div>

            {/* Assigned Driver Profile */}
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ASSIGNED CREW</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selectedVehicle.driverName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedVehicle.driverPhone}</div>
              <a
                href={`tel:${selectedVehicle.driverPhone.replace(/\\s+/g, '')}`}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }}
              >
                <Phone size={13} />
                <span>Call Driver Direct</span>
              </a>
            </div>

            {/* Dispatcher Highway Interventions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => handleSendBroadcastSMS(selectedVehicle)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
              >
                <Send size={14} />
                <span>Broadcast ETA to Passengers (SMS)</span>
              </button>

              <button
                onClick={() => {
                  if (onDelayTrip) onDelayTrip(selectedVehicle.tripCode);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '8px', fontSize: '0.78rem', justifyContent: 'center', color: '#F87171' }}
              >
                <Clock size={14} />
                <span>Broadcast Highway Delay</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EthiopiaLiveFleetMap;
