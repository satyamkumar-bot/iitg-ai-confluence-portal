import {
  User,
  UserRole,
  EventItem,
  Registration,
  Announcement,
  IntegrationLog,
  AuditLog,
  MicrosoftFormsWebhookPayload,
  RegistrationStatus,
} from "@/types";
import {
  SEED_USERS,
  SEED_EVENTS,
  SEED_REGISTRATIONS,
  SEED_ANNOUNCEMENTS,
  SEED_INTEGRATION_LOGS,
  SEED_AUDIT_LOGS,
} from "./seed-data";
import { generateRegistrationReference } from "../utils";

// Global in-memory storage holding initial seed records (persists across API requests during server lifetime)
class DataStore {
  private users: User[] = [...SEED_USERS];
  private events: EventItem[] = [...SEED_EVENTS];
  private registrations: Registration[] = [...SEED_REGISTRATIONS];
  private announcements: Announcement[] = [...SEED_ANNOUNCEMENTS];
  private integrationLogs: IntegrationLog[] = [...SEED_INTEGRATION_LOGS];
  private auditLogs: AuditLog[] = [...SEED_AUDIT_LOGS];

  // Test helper: Allows unit tests to reset store with test fixtures
  resetForTesting(testData?: {
    users?: User[];
    events?: EventItem[];
    registrations?: Registration[];
    announcements?: Announcement[];
    integrationLogs?: IntegrationLog[];
    auditLogs?: AuditLog[];
  }) {
    this.users = testData?.users ? [...testData.users] : [...SEED_USERS];
    this.events = testData?.events ? [...testData.events] : [...SEED_EVENTS];
    this.registrations = testData?.registrations ? [...testData.registrations] : [...SEED_REGISTRATIONS];
    this.announcements = testData?.announcements ? [...testData.announcements] : [...SEED_ANNOUNCEMENTS];
    this.integrationLogs = testData?.integrationLogs ? [...testData.integrationLogs] : [...SEED_INTEGRATION_LOGS];
    this.auditLogs = testData?.auditLogs ? [...testData.auditLogs] : [...SEED_AUDIT_LOGS];
  }

  // ============================================================================
  // USERS
  // ============================================================================
  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  }

  async upsertUser(userData: Partial<User> & { email: string; display_name: string }): Promise<User> {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const index = this.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

    // Determine role: Check if email is in organizer allowlist
    const adminAllowlist = (process.env.ORGANIZER_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isExplicitAdmin = adminAllowlist.includes(normalizedEmail);
    // Explicit security rule: Only allowlist or system can grant ORGANIZER role
    const resolvedRole: UserRole = isExplicitAdmin ? "ORGANIZER" : "STUDENT";

    if (index >= 0) {
      const existing = this.users[index];
      const updated: User = {
        ...existing,
        ...userData,
        role: isExplicitAdmin ? "ORGANIZER" : existing.role,
        updated_at: new Date().toISOString(),
      };
      this.users[index] = updated;
      return { ...updated };
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        microsoft_tenant_id: userData.microsoft_tenant_id ?? null,
        microsoft_object_id: userData.microsoft_object_id ?? null,
        email: normalizedEmail,
        display_name: userData.display_name,
        role: resolvedRole,
        department: userData.department ?? null,
        roll_number: userData.roll_number ?? null,
        avatar_url: userData.avatar_url ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.users.push(newUser);
      return { ...newUser };
    }
  }

  // ============================================================================
  // EVENTS
  // ============================================================================
  async getEvents(options?: {
    onlyPublished?: boolean;
    category?: string;
    search?: string;
    statusFilter?: string;
  }): Promise<EventItem[]> {
    let list = [...this.events].filter((e) => !e.archived_at);

    if (options?.onlyPublished) {
      list = list.filter((e) => e.publication_status === "PUBLISHED");
    }

    if (options?.category && options.category !== "All") {
      list = list.filter((e) => e.category.toLowerCase() === options.category!.toLowerCase());
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.short_description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      );
    }

    if (options?.statusFilter && options.statusFilter !== "All") {
      const now = new Date();
      if (options.statusFilter === "Open") {
        list = list.filter((e) => new Date(e.registration_close_at) > now);
      } else if (options.statusFilter === "Closing Soon") {
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        list = list.filter((e) => {
          const diff = new Date(e.registration_close_at).getTime() - now.getTime();
          return diff > 0 && diff <= threeDays;
        });
      } else if (options.statusFilter === "Closed") {
        list = list.filter((e) => new Date(e.registration_close_at) <= now);
      }
    }

    return list.sort(
      (a, b) => new Date(a.event_start_at).getTime() - new Date(b.event_start_at).getTime()
    );
  }

  async getEventById(id: string): Promise<EventItem | null> {
    const event = this.events.find((e) => e.id === id);
    return event ? { ...event } : null;
  }

  async getEventBySlug(slug: string): Promise<EventItem | null> {
    const event = this.events.find((e) => e.slug === slug);
    return event ? { ...event } : null;
  }

  async createEvent(data: Omit<EventItem, "id" | "created_at" | "updated_at">, actorId?: string): Promise<EventItem> {
    const newEvent: EventItem = {
      ...data,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: false,
    };
    this.events.unshift(newEvent);

    await this.addAuditLog({
      actor_user_id: actorId ?? null,
      action: "EVENT_CREATED",
      entity_type: "EVENT",
      entity_id: newEvent.id,
      sanitized_metadata: { title: newEvent.title, slug: newEvent.slug },
    });

    return { ...newEvent };
  }

  async updateEvent(id: string, data: Partial<EventItem>, actorId?: string): Promise<EventItem | null> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updated: EventItem = {
      ...this.events[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.events[index] = updated;

    await this.addAuditLog({
      actor_user_id: actorId ?? null,
      action: "EVENT_UPDATED",
      entity_type: "EVENT",
      entity_id: id,
      sanitized_metadata: { title: updated.title, publication_status: updated.publication_status },
    });

    return { ...updated };
  }

  async archiveEvent(id: string, actorId?: string): Promise<boolean> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.events[index].archived_at = new Date().toISOString();
    this.events[index].publication_status = "ARCHIVED";
    this.events[index].updated_at = new Date().toISOString();

    await this.addAuditLog({
      actor_user_id: actorId ?? null,
      action: "EVENT_ARCHIVED",
      entity_type: "EVENT",
      entity_id: id,
      sanitized_metadata: { title: this.events[index].title },
    });

    return true;
  }

  // ============================================================================
  // REGISTRATIONS
  // ============================================================================
  async getRegistrations(options?: {
    studentUserId?: string;
    eventId?: string;
    status?: string;
    syncStatus?: string;
    search?: string;
    reviewRequiredOnly?: boolean;
  }): Promise<Registration[]> {
    let list = [...this.registrations];

    if (options?.studentUserId) {
      list = list.filter((r) => r.student_user_id === options.studentUserId);
    }

    if (options?.eventId && options.eventId !== "ALL") {
      list = list.filter((r) => r.event_id === options.eventId);
    }

    if (options?.status && options.status !== "ALL") {
      list = list.filter((r) => r.registration_status === options.status);
    }

    if (options?.syncStatus && options.syncStatus !== "ALL") {
      list = list.filter((r) => r.sync_status === options.syncStatus);
    }

    if (options?.reviewRequiredOnly) {
      list = list.filter((r) => r.review_required === true);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.reference_number.toLowerCase().includes(q) ||
          r.respondent_email.toLowerCase().includes(q) ||
          (r.student_name && r.student_name.toLowerCase().includes(q)) ||
          (r.event_title && r.event_title.toLowerCase().includes(q))
      );
    }

    return list.sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    const reg = this.registrations.find((r) => r.id === id);
    return reg ? { ...reg } : null;
  }

  /**
   * Idempotent Ingestion of Microsoft Forms Webhook Payload
   */
  async ingestMicrosoftFormsWebhook(payload: MicrosoftFormsWebhookPayload): Promise<{
    registration: Registration;
    isDuplicate: boolean;
    unresolvedStudent: boolean;
  }> {
    const event = await this.getEventById(payload.eventId);
    if (!event) {
      throw new Error(`Event not found with ID ${payload.eventId}`);
    }

    // 1. Check duplicate via unique source_response_id per event
    const existingIndex = this.registrations.findIndex(
      (r) => r.event_id === payload.eventId && r.source_response_id === payload.sourceResponseId
    );

    if (existingIndex >= 0) {
      // Idempotency: Return existing without creating duplicate
      const existing = this.registrations[existingIndex];
      await this.addIntegrationLog({
        integration_type: "MICROSOFT_FORMS",
        event_id: event.id,
        event_title: event.title,
        source_reference: payload.sourceResponseId,
        operation: "INGEST_FORM_RESPONSE",
        outcome: "DUPLICATE_SKIPPED",
        metadata: {
          message: "Response with same source response ID already ingested; returned existing record.",
          referenceNumber: existing.reference_number,
        },
      });

      return {
        registration: { ...existing },
        isDuplicate: true,
        unresolvedStudent: existing.sync_status === "UNRESOLVED_STUDENT",
      };
    }

    // 2. Identity Matching: Match email securely against registered students
    const matchedUser = await this.getUserByEmail(payload.respondentEmail);
    const isUnresolved = !matchedUser;

    const newRegistration: Registration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reference_number: generateRegistrationReference(event.slug),
      event_id: event.id,
      event_title: event.title,
      event_slug: event.slug,
      student_user_id: matchedUser ? matchedUser.id : null,
      student_name: matchedUser ? matchedUser.display_name : (payload.respondentName ?? null),
      respondent_email: payload.respondentEmail.trim().toLowerCase(),
      source_response_id: payload.sourceResponseId,
      submitted_at: payload.submittedAt || new Date().toISOString(),
      synchronized_at: new Date().toISOString(),
      response_data: payload.answers,
      team_data: payload.teamInfo ?? null,
      response_received_status: "RECEIVED",
      // Important: By specification, form submission does NOT automatically mean confirmed!
      registration_status: "AWAITING_REVIEW",
      sync_status: isUnresolved ? "UNRESOLVED_STUDENT" : "SUCCESS",
      review_required: isUnresolved,
      review_notes: isUnresolved
        ? `Unmatched respondent email '${payload.respondentEmail}'. Requires manual identity resolution by organizer.`
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: false,
    };

    this.registrations.unshift(newRegistration);

    // Record Integration Log
    await this.addIntegrationLog({
      integration_type: "MICROSOFT_FORMS",
      event_id: event.id,
      event_title: event.title,
      source_reference: payload.sourceResponseId,
      operation: "INGEST_FORM_RESPONSE",
      outcome: isUnresolved ? "UNMATCHED_IDENTITY" : "SUCCESS",
      error_code: isUnresolved ? "STUDENT_NOT_FOUND" : undefined,
      sanitized_error_message: isUnresolved
        ? `No active user matches email '${payload.respondentEmail}'. Record saved for review.`
        : undefined,
      metadata: {
        referenceNumber: newRegistration.reference_number,
        respondentEmail: payload.respondentEmail,
        matchedUserId: matchedUser?.id ?? null,
      },
    });

    return {
      registration: { ...newRegistration },
      isDuplicate: false,
      unresolvedStudent: isUnresolved,
    };
  }

  async updateRegistrationStatus(
    id: string,
    newStatus: RegistrationStatus,
    reviewNotes?: string,
    actorId?: string
  ): Promise<Registration | null> {
    const index = this.registrations.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const prev = this.registrations[index];
    const updated: Registration = {
      ...prev,
      registration_status: newStatus,
      review_notes: reviewNotes !== undefined ? reviewNotes : prev.review_notes,
      updated_at: new Date().toISOString(),
    };

    this.registrations[index] = updated;

    await this.addAuditLog({
      actor_user_id: actorId ?? null,
      action: `REGISTRATION_STATUS_UPDATED_TO_${newStatus}`,
      entity_type: "REGISTRATION",
      entity_id: id,
      sanitized_metadata: {
        referenceNumber: updated.reference_number,
        fromStatus: prev.registration_status,
        toStatus: newStatus,
        notes: reviewNotes,
      },
    });

    return { ...updated };
  }

  async assignUnmatchedRegistration(
    registrationId: string,
    studentUserId: string,
    actorId?: string
  ): Promise<Registration | null> {
    const index = this.registrations.findIndex((r) => r.id === registrationId);
    if (index === -1) return null;

    const student = await this.getUserById(studentUserId);
    if (!student) throw new Error("Target student not found");

    const updated: Registration = {
      ...this.registrations[index],
      student_user_id: student.id,
      student_name: student.display_name,
      sync_status: "SUCCESS",
      review_required: false,
      review_notes: `Manually matched and resolved to ${student.display_name} (${student.email}) by organizer.`,
      updated_at: new Date().toISOString(),
    };

    this.registrations[index] = updated;

    await this.addAuditLog({
      actor_user_id: actorId ?? null,
      action: "UNMATCHED_REGISTRATION_RESOLVED",
      entity_type: "REGISTRATION",
      entity_id: registrationId,
      sanitized_metadata: {
        referenceNumber: updated.reference_number,
        matchedUserId: student.id,
        matchedEmail: student.email,
      },
    });

    return { ...updated };
  }

  // ============================================================================
  // ANNOUNCEMENTS
  // ============================================================================
  async getAnnouncements(options?: { eventId?: string; activeOnly?: boolean }): Promise<Announcement[]> {
    let list = [...this.announcements];

    if (options?.eventId) {
      list = list.filter((a) => !a.event_id || a.event_id === options.eventId);
    }

    if (options?.activeOnly) {
      const now = new Date();
      list = list.filter((a) => !a.expires_at || new Date(a.expires_at) > now);
    }

    return list.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  async createAnnouncement(
    data: Omit<Announcement, "id" | "created_at" | "updated_at">,
    actorId?: string
  ): Promise<Announcement> {
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: false,
    };
    this.announcements.unshift(newAnn);

    await this.addAuditLog({
      actor_user_id: actorId ?? null,
      action: "ANNOUNCEMENT_CREATED",
      entity_type: "ANNOUNCEMENT",
      entity_id: newAnn.id,
      sanitized_metadata: { title: newAnn.title, priority: newAnn.priority },
    });

    return { ...newAnn };
  }

  // ============================================================================
  // INTEGRATION LOGS & AUDIT LOGS
  // ============================================================================
  async getIntegrationLogs(eventId?: string): Promise<IntegrationLog[]> {
    let list = [...this.integrationLogs];
    if (eventId && eventId !== "ALL") {
      list = list.filter((l) => l.event_id === eventId);
    }
    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async addIntegrationLog(log: Omit<IntegrationLog, "id" | "created_at">): Promise<IntegrationLog> {
    const newLog: IntegrationLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.integrationLogs.unshift(newLog);
    return newLog;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async addAuditLog(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: `adt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  // ============================================================================
  // METRICS & ANALYTICS
  // ============================================================================
  async getAdminMetrics() {
    const totalEvents = this.events.filter((e) => !e.archived_at).length;
    const publishedEvents = this.events.filter((e) => e.publication_status === "PUBLISHED" && !e.archived_at).length;
    const draftEvents = this.events.filter((e) => e.publication_status === "DRAFT" && !e.archived_at).length;

    const now = new Date();
    const openRegistrations = this.events.filter(
      (e) => e.publication_status === "PUBLISHED" && new Date(e.registration_close_at) > now
    ).length;
    const closedRegistrations = publishedEvents - openRegistrations;

    const totalResponses = this.registrations.length;
    const matchedRegistrations = this.registrations.filter((r) => r.student_user_id !== null).length;
    const confirmedRegistrations = this.registrations.filter((r) => r.registration_status === "CONFIRMED").length;
    const awaitingReview = this.registrations.filter((r) => r.registration_status === "AWAITING_REVIEW").length;
    const unmatchedResponses = this.registrations.filter((r) => r.review_required || r.student_user_id === null).length;
    const syncFailures = this.integrationLogs.filter((l) => l.outcome === "FAILED").length;

    // Registrations per event
    const eventStats = this.events
      .filter((e) => !e.archived_at)
      .map((e) => {
        const regs = this.registrations.filter((r) => r.event_id === e.id);
        return {
          id: e.id,
          title: e.title.length > 28 ? e.title.slice(0, 25) + "..." : e.title,
          total: regs.length,
          confirmed: regs.filter((r) => r.registration_status === "CONFIRMED").length,
          awaiting: regs.filter((r) => r.registration_status === "AWAITING_REVIEW").length,
        };
      });

    // Status breakdown
    const statusBreakdown = [
      { name: "Confirmed", count: confirmedRegistrations, color: "#10B981" },
      { name: "Awaiting Review", count: awaitingReview, color: "#F59E0B" },
      { name: "Waitlisted", count: this.registrations.filter((r) => r.registration_status === "WAITLISTED").length, color: "#06B6D4" },
      { name: "Rejected", count: this.registrations.filter((r) => r.registration_status === "REJECTED").length, color: "#F43F5E" },
    ];

    return {
      totalEvents,
      publishedEvents,
      draftEvents,
      openRegistrations,
      closedRegistrations,
      totalResponses,
      matchedRegistrations,
      confirmedRegistrations,
      awaitingReview,
      unmatchedResponses,
      syncFailures,
      eventStats,
      statusBreakdown,
    };
  }

  async getStudentMetrics(studentUserId: string) {
    const studentRegistrations = this.registrations.filter((r) => r.student_user_id === studentUserId);
    const publishedEvents = this.events.filter((e) => e.publication_status === "PUBLISHED" && !e.archived_at);

    const now = new Date();
    const approachingDeadlines = publishedEvents.filter((e) => {
      const diff = new Date(e.registration_close_at).getTime() - now.getTime();
      return diff > 0 && diff <= 4 * 24 * 60 * 60 * 1000;
    }).length;

    const confirmedCount = studentRegistrations.filter((r) => r.registration_status === "CONFIRMED").length;
    const awaitingReviewCount = studentRegistrations.filter((r) => r.registration_status === "AWAITING_REVIEW").length;

    return {
      totalAvailableEvents: publishedEvents.length,
      totalRegistrations: studentRegistrations.length,
      confirmedCount,
      awaitingReviewCount,
      approachingDeadlines,
    };
  }
}

// Export singleton instance
export const dataStore = new DataStore();
