import { User, EventItem, Registration, Announcement, IntegrationLog, AuditLog } from "@/types";

export const SEED_USERS: User[] = [
  {
    id: "usr-satyam-001",
    microsoft_tenant_id: "iitg-tenant-id",
    microsoft_object_id: "aad-satyam-001",
    email: "k.satyam@op.iitg.ac.in",
    display_name: "Satyam Kumar",
    role: "ORGANIZER",
    department: "Mehta Family School of Data Science and AI",
    roll_number: "ADMIN-001",
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-01T09:00:00Z",
  },
  {
    id: "usr-vanshi-002",
    microsoft_tenant_id: "iitg-tenant-id",
    microsoft_object_id: "aad-vanshi-002",
    email: "s.vanshi@op.iitg.ac.in",
    display_name: "Vanshi Sethi",
    role: "STUDENT",
    department: "Data Science and Artificial Intelligence",
    roll_number: "220101001",
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-01T09:00:00Z",
  },
  {
    id: "usr-amarjeet-003",
    microsoft_tenant_id: "iitg-tenant-id",
    microsoft_object_id: "aad-amarjeet-003",
    email: "amarjeet.kumar@op.iitg.ac.in",
    display_name: "Amarjeet Kumar",
    role: "STUDENT",
    department: "Data Science and Artificial Intelligence",
    roll_number: "220101002",
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-01T09:00:00Z",
  },
];

export const SEED_EVENTS: EventItem[] = [];

export const SEED_REGISTRATIONS: Registration[] = [];

export const SEED_ANNOUNCEMENTS: Announcement[] = [];

export const SEED_INTEGRATION_LOGS: IntegrationLog[] = [];

export const SEED_AUDIT_LOGS: AuditLog[] = [];
