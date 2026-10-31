// ==============================================================================
// DOMAIN TYPES & INTERFACES
// ==============================================================================

export type UserRole = "STUDENT" | "ORGANIZER";

export interface User {
  id: string;
  microsoft_tenant_id?: string | null;
  microsoft_object_id?: string | null;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string | null;
  department?: string | null;
  roll_number?: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ParticipationMode = "IN_PERSON" | "HYBRID" | "ONLINE";
export type ParticipationType = "INDIVIDUAL" | "TEAM" | "EITHER";

export interface EventRule {
  id: string;
  rule: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface EventPrize {
  position: string;
  prize: string;
  description?: string;
}

export interface EventCoordinator {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface EventFAQ {
  question: string;
  answer: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  banner_url?: string | null;
  event_start_at?: string | null;
  event_end_at?: string | null;
  timezone: string;
  venue: string;
  participation_mode: ParticipationMode;
  registration_open_at: string;
  registration_close_at: string;
  eligibility: string;
  participation_type: ParticipationType;
  minimum_team_size: number;
  maximum_team_size: number;
  rules: string[];
  agenda: EventAgendaItem[];
  prerequisites?: string | null;
  selection_criteria?: string | null;
  prizes: EventPrize[];
  certificate_information?: string | null;
  coordinator_information: EventCoordinator[];
  faq: EventFAQ[];
  microsoft_forms_url?: string | null;
  form_integration_type: string;
  form_mapping?: Record<string, string>;
  publication_status: PublicationStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  is_demo?: boolean;
}

export type RegistrationStatus =
  | "AWAITING_REVIEW"
  | "CONFIRMED"
  | "WAITLISTED"
  | "REJECTED"
  | "CANCELLED";

export type SyncStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "UNRESOLVED_STUDENT";

export interface Registration {
  id: string;
  reference_number: string;
  event_id: string;
  event_title?: string;
  event_slug?: string;
  student_user_id?: string | null;
  student_name?: string | null;
  respondent_email: string;
  source_response_id?: string | null;
  submitted_at: string;
  synchronized_at: string;
  response_data: Record<string, any>;
  team_data?: {
    team_name?: string;
    members?: Array<{ name: string; email: string; roll_number?: string }>;
  } | null;
  response_received_status: string;
  registration_status: RegistrationStatus;
  sync_status: SyncStatus;
  review_required: boolean;
  review_notes?: string | null;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
}

export type AnnouncementPriority = "NORMAL" | "IMPORTANT" | "URGENT";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  event_id?: string | null;
  event_title?: string | null;
  priority: AnnouncementPriority;
  external_link?: string | null;
  published_at: string;
  expires_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
}

export interface IntegrationLog {
  id: string;
  integration_type: string;
  event_id?: string | null;
  event_title?: string | null;
  source_reference?: string | null;
  operation: string;
  outcome: "SUCCESS" | "FAILED" | "DUPLICATE_SKIPPED" | "UNMATCHED_IDENTITY";
  error_code?: string | null;
  sanitized_error_message?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  sanitized_metadata?: Record<string, any>;
  created_at: string;
}

// Power Automate Webhook Payload Contract
export interface MicrosoftFormsWebhookPayload {
  eventId: string;
  formId?: string;
  sourceResponseId: string;
  respondentEmail: string;
  respondentName?: string;
  submittedAt: string;
  answers: Record<string, any>;
  teamInfo?: {
    teamName?: string;
    members?: Array<{ name: string; email: string; rollNumber?: string }>;
  };
}
