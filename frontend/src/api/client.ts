import {
  Resource,
  Booking,
  EligibilityResult,
  TrustCapsuleBlock,
  ChainVerification,
  ResourceCategory,
} from '../types';

const API_BASE = '/api/v1';

export async function fetchResources(category?: ResourceCategory, search?: string): Promise<Resource[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load resources');
  return res.json();
}

export async function checkEligibility(resourceId: string, userId: string): Promise<EligibilityResult> {
  const res = await fetch(`${API_BASE}/resources/${resourceId}/eligibility?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to check eligibility');
  return res.json();
}

export async function createBooking(payload: {
  resource_id: string;
  requester_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Booking failed' }));
    throw new Error(error.detail || 'Failed to submit booking');
  }
  return res.json();
}

export async function fetchBookings(requesterId?: string, resourceId?: string): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (requesterId) params.append('requester_id', requesterId);
  if (resourceId) params.append('resource_id', resourceId);

  const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export async function approveBooking(bookingId: string, custodianId: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/approve?custodian_id=${custodianId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Approval failed' }));
    throw new Error(error.detail || 'Approval failed');
  }
  return res.json();
}

export async function rejectBooking(bookingId: string, custodianId: string, reason: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/reject?custodian_id=${custodianId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: 'REJECT', rejection_reason: reason }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Rejection failed' }));
    throw new Error(error.detail || 'Rejection failed');
  }
  return res.json();
}

export async function generateHandoverToken(bookingId: string, requesterId: string): Promise<{ handover_token: string; expires_at: string }> {
  const res = await fetch(`${API_BASE}/handovers/generate-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, requester_id: requesterId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to generate token' }));
    throw new Error(error.detail || 'Token generation failed');
  }
  return res.json();
}

export async function verifyCheckIn(payload: {
  booking_id: string;
  custodian_id: string;
  handover_token: string;
  baseline_condition_notes: string;
  checklist?: Record<string, boolean>;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/handovers/verify-checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Check-in failed' }));
    throw new Error(error.detail || 'Check-in verification failed');
  }
  return res.json();
}

export async function inspectReturn(payload: {
  booking_id: string;
  custodian_id: string;
  return_condition_notes: string;
  flag_incident: boolean;
  incident_type?: string;
  incident_severity?: string;
  incident_description?: string;
  checklist?: Record<string, boolean>;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/returns/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Return inspection failed' }));
    throw new Error(error.detail || 'Return inspection failed');
  }
  return res.json();
}

export async function fetchAuditTimeline(resourceId: string): Promise<TrustCapsuleBlock[]> {
  const res = await fetch(`${API_BASE}/audit/resources/${resourceId}/timeline`);
  if (!res.ok) throw new Error('Failed to load audit timeline');
  return res.json();
}

export async function verifyAuditChain(): Promise<ChainVerification> {
  const res = await fetch(`${API_BASE}/audit/verify-chain`);
  if (!res.ok) throw new Error('Failed to verify audit ledger');
  return res.json();
}

