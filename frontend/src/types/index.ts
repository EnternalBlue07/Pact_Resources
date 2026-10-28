export type UserRole = 'REQUESTER' | 'CUSTODIAN' | 'ADMINISTRATOR' | 'AUDITOR';

export interface User {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: UserRole;
  active_booking_quota: number;
}

export type ResourceCategory = 'EQUIPMENT' | 'SPACE';
export type ResourceStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED';

export interface Requirement {
  id?: string;
  qualification_key: string;
  description: string;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  asset_tag: string;
  department: string;
  location: string;
  custodian_id: string;
  status: ResourceStatus;
  max_duration_hours: number;
  image_url?: string;
  requirements: Requirement[];
  created_at: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'INFO_NEEDED'
  | 'HANDOVER_PENDING'
  | 'CHECKED_OUT'
  | 'RETURNED'
  | 'CLOSED'
  | 'OVERDUE'
  | 'INCIDENT_OPEN'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Booking {
  id: string;
  resource_id: string;
  requester_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: BookingStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface EligibilityResult {
  resource_id: string;
  user_id: string;
  is_eligible: boolean;
  missing_qualifications: string[];
  active_bookings_count: number;
  max_quota: number;
  quota_available: boolean;
  explanation: string;
}

export interface TrustCapsuleBlock {
  entry_id: number;
  resource_id: string;
  booking_id?: string;
  event_type: string;
  actor_id: string;
  event_timestamp: string;
  payload_json: Record<string, any>;
  prev_hash: string;
  entry_hash: string;
}

export interface ChainVerification {
  status: 'VALID' | 'INTEGRITY_BREACH_DETECTED';
  total_blocks_verified: number;
  tampered_block_ids: number[];
  message: string;
}

