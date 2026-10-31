# Database & Security Architecture Guide

This document describes the PostgreSQL database schema, Supabase setup, Row Level Security (RLS) policies, and data protection controls for the **IIT Guwahati AI Confluence Centralized Event Registration Portal**.

---

## 1. Relational Schema Overview

The database uses PostgreSQL 15+ hosted on Supabase (or any PostgreSQL instance).

### Key Tables & Constraints

| Table Name | Primary Key | Key Foreign Keys & Constraints | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id (UUID)` | Unique `(microsoft_tenant_id, microsoft_object_id)`, Unique `email` | Authenticated students and organizers |
| `events` | `id (UUID)` | Unique `slug`, `created_by -> users.id` | Conference tracks, hackathons, and symposiums |
| `registrations` | `id (UUID)` | Unique `(event_id, source_response_id)`, `event_id -> events.id`, `student_user_id -> users.id` | Consolidated Microsoft Forms submissions |
| `announcements` | `id (UUID)` | `event_id -> events.id`, `created_by -> users.id` | Global and track-specific circulars |
| `integration_logs`| `id (UUID)` | `event_id -> events.id` | Audit trail of webhook calls and sync errors |
| `audit_logs` | `id (UUID)` | `actor_user_id -> users.id` | Immutable trail of administrative actions |

---

## 2. Row Level Security (RLS) Matrix

RLS is enabled on all core tables to enforce least-privilege data access:

```sql
-- Helper function: checks if session user is an organizer
CREATE OR REPLACE FUNCTION is_organizer() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'ORGANIZER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Table Access Rules:
1. **`users`**:
   - `SELECT`: Users can view their own profile; Organizers can view all user records.
   - `UPDATE`: Users can update non-sensitive profile details (e.g. phone/department). Role changes are prohibited via user-scoped updates.
2. **`events`**:
   - `SELECT`: Anyone (including anonymous students) can read `PUBLISHED` non-archived events.
   - `INSERT / UPDATE / DELETE`: Restricted to verified `ORGANIZER` role.
3. **`registrations`**:
   - `SELECT`: Students can **ONLY** read rows where `student_user_id = auth.uid()`. Organizers can read all rows.
   - Cross-student access is strictly forbidden at both application and database layers.
   - `INSERT`: Restricted to the authenticated Power Automate webhook service or admin role.
   - `UPDATE`: Organizers only.
4. **`announcements`**:
   - `SELECT`: Public can read active non-expired announcements.
   - `INSERT / UPDATE / DELETE`: Organizers only.
5. **`integration_logs` & `audit_logs`**:
   - Read and write access restricted to organizers and system services.

---

## 3. CSV Formula Injection Defense (OWASP Recommendation)

Spreadsheet formula injection occurs when cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` execute arbitrary commands or leak data when opened in Microsoft Excel or Google Sheets.

The portal enforces cell sanitization in `src/lib/utils.ts`:
```ts
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // If starts with formula triggers, prepend a single quote
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}
```

---

## 4. Running Migrations on Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/20261027_initial_schema.sql` from this repository.
4. Paste the SQL script and click **Run**.
5. In **Project Settings** > **API**, copy your `URL`, `anon key`, and `service_role key`.
6. Add them to your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
