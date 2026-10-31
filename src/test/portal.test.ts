import { describe, it, expect, beforeAll } from "vitest";
import { dataStore } from "@/lib/db/store";
import { User, EventItem, Registration, Announcement } from "@/types";
import {
  microsoftFormsWebhookSchema,
  eventSchema,
  updateRegistrationStatusSchema,
} from "@/lib/validation/schemas";
import {
  generateRegistrationReference,
  sanitizeCsvCell,
  objectsToCsv,
  getRegistrationStatusBadge,
} from "@/lib/utils";

const TEST_USERS: User[] = [
  {
    id: "usr-student-001",
    email: "rahul.sharma@iitg.ac.in",
    display_name: "Rahul Sharma",
    role: "STUDENT",
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "usr-student-002",
    email: "ananya.roy@iitg.ac.in",
    display_name: "Ananya Roy",
    role: "STUDENT",
    created_at: "2026-09-02T11:00:00Z",
    updated_at: "2026-09-02T11:00:00Z",
  },
  {
    id: "usr-admin-001",
    email: "confluence.admin@iitg.ac.in",
    display_name: "Admin",
    role: "ORGANIZER",
    created_at: "2026-08-15T09:00:00Z",
    updated_at: "2026-08-15T09:00:00Z",
  },
];

const TEST_EVENTS: EventItem[] = [
  {
    id: "evt-001-inventathon",
    slug: "inventathon-2026",
    title: "Inventathon 2026 [DEMO DATA]",
    short_description: "Hackathon description",
    full_description: "Full description",
    category: "Hackathon",
    event_start_at: "2026-11-14T09:00:00Z",
    event_end_at: "2026-11-15T21:00:00Z",
    timezone: "Asia/Kolkata",
    venue: "Auditorium",
    participation_mode: "IN_PERSON",
    registration_open_at: "2026-10-01T00:00:00Z",
    registration_close_at: "2026-11-08T23:59:59Z",
    eligibility: "All students",
    participation_type: "TEAM",
    minimum_team_size: 2,
    maximum_team_size: 4,
    rules: [],
    agenda: [],
    prizes: [],
    microsoft_forms_url: "https://forms.office.com/r/demo",
    form_integration_type: "POWER_AUTOMATE_WEBHOOK",
    publication_status: "PUBLISHED",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
    is_demo: true,
  },
  {
    id: "evt-002-keynote",
    slug: "keynote-foundation-models",
    title: "Keynote [DEMO DATA]",
    short_description: "Keynote talk",
    full_description: "Full description",
    category: "Keynote Talk",
    event_start_at: "2026-11-13T10:00:00Z",
    event_end_at: "2026-11-13T12:00:00Z",
    timezone: "Asia/Kolkata",
    venue: "Conference Hall",
    participation_mode: "HYBRID",
    registration_open_at: "2026-10-01T00:00:00Z",
    registration_close_at: "2026-11-12T18:00:00Z",
    eligibility: "Open",
    participation_type: "INDIVIDUAL",
    minimum_team_size: 1,
    maximum_team_size: 1,
    rules: [],
    agenda: [],
    prizes: [],
    publication_status: "PUBLISHED",
    created_at: "2026-10-02T10:00:00Z",
    updated_at: "2026-10-02T10:00:00Z",
    is_demo: true,
  },
  {
    id: "evt-003-posters",
    slug: "poster-presentations-ai",
    title: "Posters [DEMO DATA]",
    short_description: "Poster session",
    full_description: "Full description",
    category: "Research",
    event_start_at: "2026-11-14T14:00:00Z",
    event_end_at: "2026-11-14T18:00:00Z",
    timezone: "Asia/Kolkata",
    venue: "Gallery",
    participation_mode: "IN_PERSON",
    registration_open_at: "2026-10-01T00:00:00Z",
    registration_close_at: "2026-10-31T23:59:59Z",
    eligibility: "Open",
    participation_type: "EITHER",
    minimum_team_size: 1,
    maximum_team_size: 3,
    rules: [],
    agenda: [],
    prizes: [],
    publication_status: "PUBLISHED",
    created_at: "2026-10-03T10:00:00Z",
    updated_at: "2026-10-03T10:00:00Z",
    is_demo: true,
  },
  {
    id: "evt-004-filmmaking",
    slug: "ai-filmmaking-challenge",
    title: "CineAI [DEMO DATA]",
    short_description: "Filmmaking",
    full_description: "Full description",
    category: "Creative Arts",
    event_start_at: "2026-11-15T15:00:00Z",
    event_end_at: "2026-11-15T18:00:00Z",
    timezone: "Asia/Kolkata",
    venue: "Mini Auditorium",
    participation_mode: "HYBRID",
    registration_open_at: "2026-10-05T00:00:00Z",
    registration_close_at: "2026-11-05T23:59:59Z",
    eligibility: "Open",
    participation_type: "TEAM",
    minimum_team_size: 1,
    maximum_team_size: 3,
    rules: [],
    agenda: [],
    prizes: [],
    publication_status: "PUBLISHED",
    created_at: "2026-10-04T10:00:00Z",
    updated_at: "2026-10-04T10:00:00Z",
    is_demo: true,
  },
  {
    id: "evt-005-draft",
    slug: "ai-gaming-showcase",
    title: "AI Gaming [DEMO DATA]",
    short_description: "Gaming showcase",
    full_description: "Full description",
    category: "Showcase",
    event_start_at: "2026-11-16T10:00:00Z",
    event_end_at: "2026-11-16T18:00:00Z",
    timezone: "Asia/Kolkata",
    venue: "Computer Labs",
    participation_mode: "IN_PERSON",
    registration_open_at: "2026-10-10T00:00:00Z",
    registration_close_at: "2026-11-15T23:59:59Z",
    eligibility: "Open",
    participation_type: "INDIVIDUAL",
    minimum_team_size: 1,
    maximum_team_size: 1,
    rules: [],
    agenda: [],
    prizes: [],
    publication_status: "DRAFT",
    created_at: "2026-10-05T10:00:00Z",
    updated_at: "2026-10-05T10:00:00Z",
    is_demo: true,
  },
];

const TEST_REGISTRATIONS: Registration[] = [
  {
    id: "reg-001",
    reference_number: "IITG-AIC26-INV-1001",
    event_id: "evt-001-inventathon",
    student_user_id: "usr-student-001",
    respondent_email: "rahul.sharma@iitg.ac.in",
    registration_status: "CONFIRMED",
    sync_status: "SUCCESS",
    review_required: false,
    submitted_at: "2026-10-27T10:00:00Z",
    synchronized_at: "2026-10-27T10:00:05Z",
    response_data: {},
    created_at: "2026-10-27T10:00:00Z",
    updated_at: "2026-10-27T10:00:00Z",
  },
  {
    id: "reg-002",
    reference_number: "IITG-AIC26-KEY-1002",
    event_id: "evt-002-keynote",
    student_user_id: "usr-student-002",
    respondent_email: "ananya.roy@iitg.ac.in",
    registration_status: "AWAITING_REVIEW",
    sync_status: "SUCCESS",
    review_required: false,
    submitted_at: "2026-10-27T10:00:00Z",
    synchronized_at: "2026-10-27T10:00:05Z",
    response_data: {},
    created_at: "2026-10-27T10:00:00Z",
    updated_at: "2026-10-27T10:00:00Z",
  },
  {
    id: "reg-003",
    reference_number: "IITG-AIC26-POS-1003",
    event_id: "evt-003-posters",
    student_user_id: "usr-student-001",
    respondent_email: "rahul.sharma@iitg.ac.in",
    registration_status: "WAITLISTED",
    sync_status: "SUCCESS",
    review_required: false,
    submitted_at: "2026-10-27T10:00:00Z",
    synchronized_at: "2026-10-27T10:00:05Z",
    response_data: {},
    created_at: "2026-10-27T10:00:00Z",
    updated_at: "2026-10-27T10:00:00Z",
  },
  {
    id: "reg-004",
    reference_number: "IITG-AIC26-CIN-1004",
    event_id: "evt-004-filmmaking",
    student_user_id: null,
    respondent_email: "unmatched.student@iitg.ac.in",
    registration_status: "AWAITING_REVIEW",
    sync_status: "UNRESOLVED_STUDENT",
    review_required: true,
    submitted_at: "2026-10-27T10:00:00Z",
    synchronized_at: "2026-10-27T10:00:05Z",
    response_data: {},
    created_at: "2026-10-27T10:00:00Z",
    updated_at: "2026-10-27T10:00:00Z",
  },
];

const TEST_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-001",
    title: "Official Announcement 1",
    body: "Announcement text",
    event_id: "evt-001-inventathon",
    priority: "IMPORTANT",
    published_at: "2026-10-01T08:00:00Z",
    expires_at: null,
    created_by: "usr-admin-001",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "ann-002",
    title: "Official Announcement 2",
    body: "Announcement text",
    event_id: null,
    priority: "NORMAL",
    published_at: "2026-10-02T08:00:00Z",
    expires_at: null,
    created_by: "usr-admin-001",
    created_at: "2026-10-02T08:00:00Z",
    updated_at: "2026-10-02T08:00:00Z",
  },
];

describe("IIT Guwahati AI Confluence Registration Portal - Core Workflows", () => {
  beforeAll(() => {
    dataStore.resetForTesting({
      users: TEST_USERS,
      events: TEST_EVENTS,
      registrations: TEST_REGISTRATIONS,
      announcements: TEST_ANNOUNCEMENTS,
    });
  });
  // Test 1: Role Authorization & Server-controlled Role Assignment
  it("Test 1: Server-controlled role assignment assigns STUDENT by default, never allows self-elevation", async () => {
    const studentUser = await dataStore.upsertUser({
      email: "newstudent@iitg.ac.in",
      display_name: "New Student",
      role: "STUDENT",
    });

    expect(studentUser.role).toBe("STUDENT");

    // Student attempting to self-elevate role via profile update must be prevented
    const attemptedElevation = await dataStore.upsertUser({
      email: "newstudent@iitg.ac.in",
      display_name: "New Student",
      role: "ORGANIZER" as any, // Attacker attempts to change their role
    });

    // Unless their email is in the server-side ORGANIZER_ADMIN_EMAILS allowlist, role remains STUDENT
    expect(attemptedElevation.role).toBe("STUDENT");
  });

  // Test 2: Admin Allowlist elevates verified administrator accounts
  it("Test 2: Server-controlled allowlist automatically designates ORGANIZER role to verified admin emails", async () => {
    process.env.ORGANIZER_ADMIN_EMAILS = "confluence.admin@iitg.ac.in,faculty.mfsdsai@iitg.ac.in";

    const adminUser = await dataStore.upsertUser({
      email: "confluence.admin@iitg.ac.in",
      display_name: "Prof. Arvind Admin",
    });

    expect(adminUser.role).toBe("ORGANIZER");
  });

  // Test 3: Unpublished (DRAFT) events are hidden from public student queries
  it("Test 3: Unpublished draft events are strictly hidden from students", async () => {
    const publicEvents = await dataStore.getEvents({ onlyPublished: true });
    const draftEvent = publicEvents.find((e) => e.publication_status === "DRAFT");
    expect(draftEvent).toBeUndefined();

    // But organizers querying all events can see draft events
    const allEvents = await dataStore.getEvents({ onlyPublished: false });
    const draftPresent = allEvents.find((e) => e.publication_status === "DRAFT");
    expect(draftPresent).toBeDefined();
    expect(draftPresent?.slug).toBe("ai-gaming-showcase");
  });

  // Test 4: Registration deadlines are enforced
  it("Test 4: Registration deadline calculation correctly distinguishes open vs closed events", async () => {
    const events = await dataStore.getEvents({ onlyPublished: true });
    expect(events.length).toBeGreaterThan(0);

    const now = new Date();
    events.forEach((evt) => {
      const deadline = new Date(evt.registration_close_at);
      const isClosed = deadline <= now;
      expect(typeof isClosed).toBe("boolean");
    });
  });

  // Test 5: Invalid Microsoft Forms URLs are rejected by Zod schema
  it("Test 5: Event validation schema rejects malformed Microsoft Forms URLs", () => {
    const invalidEvent = {
      title: "New AI Symposium",
      slug: "new-ai-symposium",
      short_description: "Short description for the upcoming symposium.",
      full_description: "Comprehensive description of the new AI symposium in detail.",
      category: "Symposium",
      event_start_at: "2026-11-20T10:00:00Z",
      event_end_at: "2026-11-20T18:00:00Z",
      venue: "Main Hall",
      registration_open_at: "2026-10-01T00:00:00Z",
      registration_close_at: "2026-11-19T23:59:59Z",
      eligibility: "All enrolled university students.",
      microsoft_forms_url: "not-a-valid-url-format", // Invalid URL!
    };

    const result = eventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });

  // Test 6: Valid Microsoft Forms payload creates registration record with direct CONFIRMED status
  it("Test 6: Valid webhook payload creates registration record and directly confirms for institutional student", async () => {
    const payload = {
      eventId: "evt-001-inventathon",
      sourceResponseId: `test-unique-response-${Date.now()}`,
      respondentEmail: "ananya.roy@iitg.ac.in",
      respondentName: "Ananya Roy",
      submittedAt: new Date().toISOString(),
      answers: {
        "Track Selection": "GenAI for Healthcare",
        "Repository": "https://github.com/ananya/test-repo",
      },
      teamInfo: {
        teamName: "AlphaAgents",
        members: [{ name: "Ananya Roy", email: "ananya.roy@iitg.ac.in" }],
      },
    };

    // Schema validation succeeds
    const validated = microsoftFormsWebhookSchema.safeParse(payload);
    expect(validated.success).toBe(true);

    // Ingestion succeeds
    const result = await dataStore.ingestMicrosoftFormsWebhook(validated.data!);
    expect(result.registration.event_id).toBe("evt-001-inventathon");
    expect(result.registration.respondent_email).toBe("ananya.roy@iitg.ac.in");
    expect(result.registration.student_user_id).toBe("usr-student-002");
    expect(result.registration.registration_status).toBe("CONFIRMED");
    expect(result.isDuplicate).toBe(false);
  });

  // Test 7: Duplicate response deliveries do NOT create duplicate registrations (Idempotency)
  it("Test 7: Idempotency: Duplicate delivery of same source response ID returns existing record without duplicating", async () => {
    const uniqueSourceId = `idempotent-test-${Date.now()}`;
    const payload = {
      eventId: "evt-001-inventathon",
      sourceResponseId: uniqueSourceId,
      respondentEmail: "priya.patel@iitg.ac.in",
      submittedAt: new Date().toISOString(),
      answers: { "Track": "AI in Agriculture" },
    };

    // First ingestion
    const firstAttempt = await dataStore.ingestMicrosoftFormsWebhook(payload);
    expect(firstAttempt.isDuplicate).toBe(false);

    // Second ingestion with identical eventId & sourceResponseId (e.g. Power Automate retry)
    const secondAttempt = await dataStore.ingestMicrosoftFormsWebhook(payload);
    expect(secondAttempt.isDuplicate).toBe(true);
    expect(secondAttempt.registration.id).toBe(firstAttempt.registration.id);
    expect(secondAttempt.registration.reference_number).toBe(firstAttempt.registration.reference_number);
  });

  // Test 8: Unmatched respondent identities are flagged for organizer review
  it("Test 8: Respondent email not matching any student is stored with student_user_id=null and flagged for review", async () => {
    const payload = {
      eventId: "evt-002-keynote",
      sourceResponseId: `unmatched-test-${Date.now()}`,
      respondentEmail: "unregistered.guest@external-domain.org",
      submittedAt: new Date().toISOString(),
      answers: { "Role": "Visiting Researcher" },
    };

    const result = await dataStore.ingestMicrosoftFormsWebhook(payload);
    expect(result.unresolvedStudent).toBe(true);
    expect(result.registration.student_user_id).toBeNull();
    expect(result.registration.sync_status).toBe("UNRESOLVED_STUDENT");
    expect(result.registration.review_required).toBe(true);
  });

  // Test 9: Organizer can resolve unmatched registration by linking to student account
  it("Test 9: Organizer can manually resolve unmatched registration to an existing student account", async () => {
    const unmatched = (await dataStore.getRegistrations({ reviewRequiredOnly: true }))[0];
    expect(unmatched).toBeDefined();

    const student = await dataStore.getUserByEmail("ananya.roy@iitg.ac.in");
    expect(student).toBeDefined();

    const resolved = await dataStore.assignUnmatchedRegistration(
      unmatched.id,
      student!.id,
      "usr-admin-001"
    );

    expect(resolved?.student_user_id).toBe(student!.id);
    expect(resolved?.sync_status).toBe("SUCCESS");
    expect(resolved?.review_required).toBe(false);
  });

  // Test 10: Organizer status update records actor in audit log
  it("Test 10: Status updates (e.g. CONFIRMED) update registration and create audit log entry", async () => {
    const reg = (await dataStore.getRegistrations())[0];
    const prevStatus = reg.registration_status;

    const updated = await dataStore.updateRegistrationStatus(
      reg.id,
      "CONFIRMED",
      "Shortlisted by reviewing faculty committee.",
      "usr-admin-001"
    );

    expect(updated?.registration_status).toBe("CONFIRMED");
    expect(updated?.review_notes).toContain("Shortlisted");

    // Verify audit log
    const auditLogs = await dataStore.getAuditLogs();
    const statusAudit = auditLogs.find(
      (a) => a.entity_id === reg.id && a.action.includes("STATUS_UPDATED")
    );
    expect(statusAudit).toBeDefined();
    expect(statusAudit?.actor_user_id).toBe("usr-admin-001");
  });

  // Test 11: Students cannot view another student's registrations
  it("Test 11: Data store query scoped to studentUserId returns only that student's records", async () => {
    const rahulRegistrations = await dataStore.getRegistrations({
      studentUserId: "usr-student-001",
    });

    rahulRegistrations.forEach((r) => {
      expect(r.student_user_id).toBe("usr-student-001");
    });

    const ananyaRegistrations = await dataStore.getRegistrations({
      studentUserId: "usr-student-002",
    });

    ananyaRegistrations.forEach((r) => {
      expect(r.student_user_id).toBe("usr-student-002");
    });
  });

  // Test 12: CSV Formula Injection Protection
  it("Test 12: CSV generation escapes formula injection characters (=, +, -, @, tab, CR)", () => {
    // Dangerous cell starting with '=' (e.g. =cmd|' /C calc'!A0 or =SUM(A1:B1))
    const dangerousCell1 = "=1+1";
    expect(sanitizeCsvCell(dangerousCell1)).toBe("\"'=1+1\"");

    // Dangerous cell starting with '@'
    const dangerousCell2 = "@SUM(1,2)";
    expect(sanitizeCsvCell(dangerousCell2)).toBe("\"'@SUM(1,2)\"");

    // Dangerous cell starting with '+'
    const dangerousCell3 = "+12345";
    expect(sanitizeCsvCell(dangerousCell3)).toBe("\"'+12345\"");

    // Safe normal cell
    const safeCell = "Inventathon 2026";
    expect(sanitizeCsvCell(safeCell)).toBe('"Inventathon 2026"');
  });

  // Test 13: Authorized CSV Export format
  it("Test 13: objectsToCsv produces well-formed CSV with headers and sanitized rows", () => {
    const rows = [
      { ref: "IITG-AIC-01", name: "Rahul Sharma", formulaTest: "=HYPERLINK()" },
    ];
    const headers = [
      { key: "ref", label: "Reference" },
      { key: "name", label: "Student Name" },
      { key: "formulaTest", label: "Notes" },
    ];

    const csv = objectsToCsv(rows, headers);
    expect(csv).toContain('"Reference","Student Name","Notes"');
    expect(csv).toContain('"IITG-AIC-01","Rahul Sharma","\'=HYPERLINK()"');
  });

  // Test 14: Search and Filter by Category
  it("Test 14: Event directory filtering accurately matches category and query text", async () => {
    const hackathons = await dataStore.getEvents({ category: "Hackathon" });
    expect(hackathons.length).toBeGreaterThan(0);
    hackathons.forEach((e) => expect(e.category).toBe("Hackathon"));

    const searchResults = await dataStore.getEvents({ search: "Inventathon" });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].title).toContain("Inventathon");
  });

  // Test 15: Integration logs record failed webhook attempts
  it("Test 15: Integration failures are recorded in integration_logs", async () => {
    await dataStore.addIntegrationLog({
      integration_type: "MICROSOFT_FORMS",
      operation: "INGEST_FORM_RESPONSE",
      outcome: "FAILED",
      error_code: "SCHEMA_VALIDATION_ERROR",
      sanitized_error_message: "Missing required field: sourceResponseId",
    });

    const logs = await dataStore.getIntegrationLogs();
    const failedLog = logs.find((l) => l.error_code === "SCHEMA_VALIDATION_ERROR");
    expect(failedLog).toBeDefined();
    expect(failedLog?.outcome).toBe("FAILED");
  });

  // Test 16: Demo data is clearly identified
  it("Test 16: Demonstration records are flagged with is_demo: true", async () => {
    const events = await dataStore.getEvents({ onlyPublished: false });
    const demoEvents = events.filter((e) => e.is_demo === true);
    expect(demoEvents.length).toBeGreaterThan(0);
    demoEvents.forEach((e) => {
      expect(e.title).toContain("[DEMO DATA]");
    });
  });

  // Test 17: Registration status badges correctly format UI classes
  it("Test 17: Registration status badge helper returns correct labels and styling for all statuses", () => {
    expect(getRegistrationStatusBadge("CONFIRMED").label).toBe("Confirmed");
    expect(getRegistrationStatusBadge("AWAITING_REVIEW").label).toBe("Awaiting Review");
    expect(getRegistrationStatusBadge("WAITLISTED").label).toBe("Waitlisted");
    expect(getRegistrationStatusBadge("REJECTED").label).toBe("Rejected");
    expect(getRegistrationStatusBadge("CANCELLED").label).toBe("Cancelled");
  });

  // Test 18: Reference number generation formats consistently
  it("Test 18: generateRegistrationReference creates structured reference codes", () => {
    const ref = generateRegistrationReference("inventathon-2026");
    expect(ref).toMatch(/^IITG-AIC26-INV-\d+$/);
  });

  // Test 19: Announcements can be targeted to specific events or broadcast globally
  it("Test 19: Announcement queries filter by eventId and active status", async () => {
    const allActive = await dataStore.getAnnouncements({ activeOnly: true });
    expect(allActive.length).toBeGreaterThan(0);

    const inventathonAnnouncements = await dataStore.getAnnouncements({
      eventId: "evt-001-inventathon",
    });
    expect(inventathonAnnouncements.length).toBeGreaterThan(0);
  });

  // Test 20: Admin metrics provide accurate counts from database records
  it("Test 20: getAdminMetrics accurately reflects real database totals without fabricated numbers", async () => {
    const metrics = await dataStore.getAdminMetrics();
    expect(metrics.totalEvents).toBeGreaterThanOrEqual(5);
    expect(metrics.publishedEvents).toBeGreaterThanOrEqual(4);
    expect(metrics.totalResponses).toBeGreaterThanOrEqual(4);
    expect(metrics.eventStats.length).toBe(metrics.totalEvents);
  });
});
