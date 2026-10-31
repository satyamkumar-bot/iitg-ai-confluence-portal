-- ==============================================================================
-- IIT GUWAHATI AI CONFLUENCE CENTRALIZED EVENT REGISTRATION PORTAL
-- DATABASE SCHEMA MIGRATION: 20261027_initial_schema.sql
-- TARGET: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER ROLES ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ORGANIZER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PUBLICATION STATUS ENUM
DO $$ BEGIN
    CREATE TYPE publication_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. REGISTRATION STATUS ENUM
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM (
        'AWAITING_REVIEW',
        'CONFIRMED',
        'WAITLISTED',
        'REJECTED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. SYNCHRONIZATION STATUS ENUM
DO $$ BEGIN
    CREATE TYPE sync_status AS ENUM (
        'PENDING',
        'SUCCESS',
        'FAILED',
        'UNRESOLVED_STUDENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. ANNOUNCEMENT PRIORITY ENUM
DO $$ BEGIN
    CREATE TYPE announcement_priority AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- TABLE: USERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    microsoft_tenant_id VARCHAR(128),
    microsoft_object_id VARCHAR(128),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    department VARCHAR(255),
    roll_number VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_microsoft_identity UNIQUE (microsoft_tenant_id, microsoft_object_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==============================================================================
-- TABLE: EVENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    banner_url TEXT,
    event_start_at TIMESTAMPTZ NOT NULL,
    event_end_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    venue VARCHAR(255) NOT NULL,
    participation_mode VARCHAR(64) NOT NULL DEFAULT 'IN_PERSON', -- IN_PERSON, HYBRID, ONLINE
    registration_open_at TIMESTAMPTZ NOT NULL,
    registration_close_at TIMESTAMPTZ NOT NULL,
    eligibility TEXT NOT NULL,
    participation_type VARCHAR(64) NOT NULL DEFAULT 'INDIVIDUAL', -- INDIVIDUAL, TEAM, EITHER
    minimum_team_size INT NOT NULL DEFAULT 1,
    maximum_team_size INT NOT NULL DEFAULT 1,
    rules JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of rule strings
    agenda JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {time, title, description, speaker}
    prerequisites TEXT,
    selection_criteria TEXT,
    prizes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {position, prize, description}
    certificate_information TEXT,
    coordinator_information JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {name, role, email, phone}
    faq JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {question, answer}
    microsoft_forms_url TEXT,
    form_integration_type VARCHAR(64) NOT NULL DEFAULT 'POWER_AUTOMATE_WEBHOOK',
    form_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
    publication_status publication_status NOT NULL DEFAULT 'DRAFT',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_publication_status ON events(publication_status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(event_start_at, event_end_at);
CREATE INDEX IF NOT EXISTS idx_events_reg_close ON events(registration_close_at);

-- ==============================================================================
-- TABLE: REGISTRATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(64) NOT NULL UNIQUE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable when unmatched
    respondent_email VARCHAR(255) NOT NULL,
    source_response_id VARCHAR(255), -- Unique ID provided by Microsoft Forms/Power Automate
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synchronized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    team_data JSONB DEFAULT NULL,
    response_received_status VARCHAR(64) NOT NULL DEFAULT 'RECEIVED',
    registration_status registration_status NOT NULL DEFAULT 'AWAITING_REVIEW',
    sync_status sync_status NOT NULL DEFAULT 'SUCCESS',
    review_required BOOLEAN NOT NULL DEFAULT FALSE,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Enforce idempotency: an event can only receive a specific source response ID once!
    CONSTRAINT uq_event_source_response UNIQUE (event_id, source_response_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_user_id ON registrations(student_user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_respondent_email ON registrations(respondent_email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_registrations_sync_status ON registrations(sync_status);
CREATE INDEX IF NOT EXISTS idx_registrations_review_required ON registrations(review_required);

-- ==============================================================================
-- TABLE: ANNOUNCEMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- Optional: NULL for global
    priority announcement_priority NOT NULL DEFAULT 'NORMAL',
    external_link TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_event_id ON announcements(event_id);

-- ==============================================================================
-- TABLE: INTEGRATION_LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_type VARCHAR(64) NOT NULL DEFAULT 'MICROSOFT_FORMS',
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    source_reference VARCHAR(255),
    operation VARCHAR(100) NOT NULL,
    outcome VARCHAR(64) NOT NULL, -- SUCCESS, FAILED, DUPLICATE_SKIPPED, UNMATCHED_IDENTITY
    error_code VARCHAR(64),
    sanitized_error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_event_id ON integration_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);

-- ==============================================================================
-- TABLE: AUDIT_LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(255),
    sanitized_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is authenticated user an organizer?
CREATE OR REPLACE FUNCTION is_organizer() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'ORGANIZER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. USERS POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id OR is_organizer());

-- Users can update their own non-role fields
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- 2. EVENTS POLICIES
-- Anyone can view published events
CREATE POLICY "Public can view published events"
    ON events FOR SELECT
    USING (publication_status = 'PUBLISHED' OR is_organizer());

-- Organizers can insert/update/delete events
CREATE POLICY "Organizers can manage events"
    ON events FOR ALL
    USING (is_organizer())
    WITH CHECK (is_organizer());

-- 3. REGISTRATIONS POLICIES
-- Students can only view their own registrations
CREATE POLICY "Students can view own registrations"
    ON registrations FOR SELECT
    USING (student_user_id = auth.uid() OR is_organizer());

-- Organizers can update registrations
CREATE POLICY "Organizers can update registrations"
    ON registrations FOR UPDATE
    USING (is_organizer())
    WITH CHECK (is_organizer());

-- 4. ANNOUNCEMENTS POLICIES
-- Public can view active published announcements
CREATE POLICY "Public can view active announcements"
    ON announcements FOR SELECT
    USING (expires_at IS NULL OR expires_at > NOW() OR is_organizer());

-- Organizers can manage announcements
CREATE POLICY "Organizers can manage announcements"
    ON announcements FOR ALL
    USING (is_organizer())
    WITH CHECK (is_organizer());

-- 5. INTEGRATION LOGS & AUDIT LOGS
-- Only organizers can view integration logs
CREATE POLICY "Organizers can view integration logs"
    ON integration_logs FOR SELECT
    USING (is_organizer());

-- Only organizers can view audit logs
CREATE POLICY "Organizers can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_organizer());
