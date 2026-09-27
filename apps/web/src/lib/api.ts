const API_BASE = 'http://localhost:4000/api';

export async function fetchTrips(originId?: string, destinationId?: string, date?: string) {
  const params = new URLSearchParams();
  if (originId) params.append('originId', originId);
  if (destinationId) params.append('destinationId', destinationId);
  if (date) params.append('date', date);

  const res = await fetch(`${API_BASE}/trips?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function fetchTripDetails(tripId: string) {
  const res = await fetch(`${API_BASE}/trips/${tripId}`);
  if (!res.ok) throw new Error('Failed to fetch trip details');
  return res.json();
}

export async function holdSeat(tripId: string, seatNumbers: string[], sessionId: string) {
  const res = await fetch(`${API_BASE}/bookings/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, seatNumbers, sessionId })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to hold seat');
  }
  return res.json();
}

export async function counterCheckout(payload: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/bookings/counter-checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Counter checkout failed');
  }
  return res.json();
}

export async function onlineCheckout(payload: any) {
  const res = await fetch(`${API_BASE}/bookings/online-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Online checkout failed');
  }
  return res.json();
}

export async function verifyTicketQr(qrPayloadRaw: any, currentTripId?: string) {
  const res = await fetch(`${API_BASE}/tickets/verify-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrPayloadRaw, currentTripId })
  });
  const data = await res.json();
  return data;
}

export async function fetchManifest(tripId: string) {
  const res = await fetch(`${API_BASE}/manifest/trips/${tripId}`);
  if (!res.ok) throw new Error('Failed to fetch manifest');
  return res.json();
}

export async function fetchFleet() {
  const res = await fetch(`${API_BASE}/fleet`);
  if (!res.ok) throw new Error('Failed to fetch fleet');
  return res.json();
}

export async function createBus(data: any) {
  const res = await fetch(`${API_BASE}/fleet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create bus');
  }
  return res.json();
}

export async function updateBusStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/fleet/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update bus status');
  return res.json();
}

export async function fetchRoutes() {
  const res = await fetch(`${API_BASE}/stations/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function scheduleTrip(data: any) {
  const res = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to schedule trip');
  }
  return res.json();
}

export async function updateTripStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/trips/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update trip status');
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function searchBookings(q: string) {
  const res = await fetch(`${API_BASE}/bookings/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search bookings');
  return res.json();
}

export async function searchPassengers(q: string) {
  const res = await fetch(`${API_BASE}/agent/passengers/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search passengers');
  return res.json();
}

export async function rescheduleTicket(payload: {
  bookingReference: string;
  ticketNumber: string;
  newTripId: string;
  newSeatNumber: string;
  agentId?: string;
  changeReason?: string;
}) {
  const res = await fetch(`${API_BASE}/bookings/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to reschedule ticket');
  }
  return res.json();
}

export async function refundBooking(
  reference: string,
  payload: {
    reason?: string;
    refundPercentage?: number;
    deductionFeeETB?: number;
    agentId?: string;
    notes?: string;
  }
) {
  const res = await fetch(`${API_BASE}/bookings/${reference}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to process refund');
  }
  return res.json();
}

export async function sendTicketSms(payload: {
  phone: string;
  bookingReference: string;
  passengerName?: string;
  tripCode: string;
  route: string;
  departureTime: string;
  seatNumber: string;
}) {
  const res = await fetch(`${API_BASE}/bookings/send-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send SMS');
  }
  return res.json();
}

export async function getShiftSummary(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/agent/shift-summary`, { headers });
  if (!res.ok) return { hasOpenShift: false };
  return res.json();
}

export async function closeShift(payload: {
  agentId?: string;
  actualCashCountedETB: number;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/agent/close-shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to close shift');
  }
  return res.json();
}

