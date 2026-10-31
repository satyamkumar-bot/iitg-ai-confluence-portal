import { User, EventItem, Registration, Announcement, IntegrationLog, AuditLog } from "@/types";

export const SEED_USERS: User[] = [
  {
    id: "usr-admin-001",
    microsoft_tenant_id: "iitg-tenant-id",
    microsoft_object_id: "aad-obj-admin",
    email: "confluence.admin@iitg.ac.in",
    display_name: "Confluence Administrator",
    role: "ORGANIZER",
    department: "Mehta Family School of Data Science and AI",
    roll_number: "FACULTY-009",
    created_at: "2026-08-15T09:00:00Z",
    updated_at: "2026-08-15T09:00:00Z",
  },
];

export const SEED_EVENTS: EventItem[] = [];

export const SEED_REGISTRATIONS: Registration[] = [];

export const SEED_ANNOUNCEMENTS: Announcement[] = [];

export const SEED_INTEGRATION_LOGS: IntegrationLog[] = [];

export const SEED_AUDIT_LOGS: AuditLog[] = [];
