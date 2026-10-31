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
import { supabasePublic, isSupabaseConfigured } from "./supabase";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic.from("users").select("*");
        if (!error && data && data.length > 0) return data as User[];
      } catch (err) {
        console.error("Supabase getUsers error:", err);
      }
    }
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic
          .from("users")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return data as User;
      } catch (err) {
        console.error("Supabase getUserById error:", err);
      }
    }
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic
          .from("users")
          .select("*")
          .ilike("email", normalized)
          .maybeSingle();
        if (!error && data) return data as User;
      } catch (err) {
        console.error("Supabase getUserByEmail error:", err);
      }
    }
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

      if (isSupabaseConfigured && supabasePublic) {
        try {
          await supabasePublic.from("users").update({
            display_name: updated.display_name,
            role: updated.role,
            department: updated.department,
            roll_number: updated.roll_number,
            updated_at: updated.updated_at,
          }).eq("id", updated.id);
        } catch (err) {
          console.error("Supabase upsertUser update error:", err);
        }
      }

      return { ...updated };
    } else {
      const newId = generateUUID();
      const newUser: User = {
        id: newId,
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

      if (isSupabaseConfigured && supabasePublic) {
        try {
          await supabasePublic.from("users").upsert({
            id: newUser.id,
            email: newUser.email,
            display_name: newUser.display_name,
            role: newUser.role,
            department: newUser.department,
            roll_number: newUser.roll_number,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at,
          });
        } catch (err) {
          console.error("Supabase upsertUser insert error:", err);
        }
      }

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
    if (isSupabaseConfigured && supabasePublic) {
      try {
        let query = supabasePublic.from("events").select("*").is("archived_at", null);
        if (options?.onlyPublished) {
          query = query.eq("publication_status", "PUBLISHED");
        }
        if (options?.category && options.category !== "All") {
          query = query.ilike("category", options.category);
        }
        const { data, error } = await query;
        if (!error && data) {
          let list = data as EventItem[];
          if (options?.search) {
            const q = options.search.toLowerCase();
            list = list.filter(
              (e) =>
                e.title.toLowerCase().includes(q) ||
                (e.short_description && e.short_description.toLowerCase().includes(q)) ||
                (e.venue && e.venue.toLowerCase().includes(q))
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
            (a, b) =>
              new Date(b.created_at || b.registration_open_at).getTime() -
              new Date(a.created_at || a.registration_open_at).getTime()
          );
        }
      } catch (err) {
        console.error("Supabase getEvents fallback to memory:", err);
      }
    }

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
      (a, b) =>
        new Date(a.event_start_at || a.registration_open_at).getTime() -
        new Date(b.event_start_at || b.registration_open_at).getTime()
    );
  }

  async getEventById(id: string): Promise<EventItem | null> {
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic
          .from("events")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) return data as EventItem;
      } catch (err) {
        console.error("Supabase getEventById error:", err);
      }
    }

    const event = this.events.find((e) => e.id === id);
    return event ? { ...event } : null;
  }

  async getEventBySlug(slug: string): Promise<EventItem | null> {
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic
          .from("events")
          .select("*")
          .eq("slug", slug)
          .is("archived_at", null)
          .maybeSingle();
        if (!error && data) return data as EventItem;
      } catch (err) {
        console.error("Supabase getEventBySlug error:", err);
      }
    }

    const event = this.events.find((e) => e.slug === slug);
    return event ? { ...event } : null;
  }

  async createEvent(data: Omit<EventItem, "id" | "created_at" | "updated_at">, actorId?: string): Promise<EventItem> {
    const newId = (data as any).id || generateUUID();
    const nowIso = new Date().toISOString();
    const newEvent: EventItem = {
      ...data,
      id: newId,
      event_start_at: data.event_start_at || data.registration_open_at || nowIso,
      event_end_at: data.event_end_at || data.registration_close_at || nowIso,
      created_at: nowIso,
      updated_at: nowIso,
      is_demo: false,
    };
    this.events.unshift(newEvent);

    if (isSupabaseConfigured && supabasePublic) {
      try {
        await supabasePublic.from("events").insert({
          id: newEvent.id,
          slug: newEvent.slug,
          title: newEvent.title,
          short_description: newEvent.short_description,
          full_description: newEvent.full_description,
          category: newEvent.category,
          banner_url: newEvent.banner_url || null,
          event_start_at: newEvent.event_start_at,
          event_end_at: newEvent.event_end_at,
          timezone: newEvent.timezone || "Asia/Kolkata",
          venue: newEvent.venue,
          participation_mode: newEvent.participation_mode,
          registration_open_at: newEvent.registration_open_at,
          registration_close_at: newEvent.registration_close_at,
          eligibility: newEvent.eligibility,
          participation_type: newEvent.participation_type,
          minimum_team_size: newEvent.minimum_team_size || 1,
          maximum_team_size: newEvent.maximum_team_size || 1,
          rules: newEvent.rules || [],
          agenda: newEvent.agenda || [],
          prerequisites: newEvent.prerequisites || null,
          selection_criteria: newEvent.selection_criteria || null,
          prizes: newEvent.prizes || [],
          certificate_information: newEvent.certificate_information || null,
          coordinator_information: newEvent.coordinator_information || [],
          faq: newEvent.faq || [],
          microsoft_forms_url: newEvent.microsoft_forms_url || null,
          form_integration_type: (data as any).form_integration_type || "POWER_AUTOMATE_WEBHOOK",
          form_mapping: (data as any).form_mapping || {},
          publication_status: newEvent.publication_status || "PUBLISHED",
          created_at: newEvent.created_at,
          updated_at: newEvent.updated_at,
        });
      } catch (err) {
        console.error("Supabase createEvent error:", err);
      }
    }

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
    if (isSupabaseConfigured && supabasePublic) {
      try {
        await supabasePublic.from("events").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
      } catch (err) {
        console.error("Supabase updateEvent error:", err);
      }
    }

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
    if (isSupabaseConfigured && supabasePublic) {
      try {
        await supabasePublic.from("events").update({
          archived_at: new Date().toISOString(),
          publication_status: "ARCHIVED",
          updated_at: new Date().toISOString(),
        }).eq("id", id);
      } catch (err) {
        console.error("Supabase archiveEvent error:", err);
      }
    }

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
    studentEmail?: string;
    eventId?: string;
    status?: string;
    syncStatus?: string;
    search?: string;
    reviewRequiredOnly?: boolean;
  }): Promise<Registration[]> {
    if (isSupabaseConfigured && supabasePublic) {
      try {
        let query = supabasePublic.from("registrations").select("*, events(title, slug)");
        if (options?.studentUserId) {
          query = query.eq("student_user_id", options.studentUserId);
        }
        if (options?.studentEmail) {
          query = query.ilike("respondent_email", options.studentEmail.trim());
        }
        if (options?.eventId && options.eventId !== "ALL") {
          query = query.eq("event_id", options.eventId);
        }
        if (options?.status && options.status !== "ALL") {
          query = query.eq("registration_status", options.status);
        }
        if (options?.syncStatus && options.syncStatus !== "ALL") {
          query = query.eq("sync_status", options.syncStatus);
        }
        if (options?.reviewRequiredOnly) {
          query = query.eq("review_required", true);
        }
        const { data, error } = await query;
        if (!error && data) {
          let list = data.map((r: any) => ({
            ...r,
            event_title: r.events?.title || r.event_title,
            event_slug: r.events?.slug || r.event_slug,
          })) as Registration[];

          if (options?.search) {
            const q = options.search.toLowerCase();
            list = list.filter(
              (r) =>
                (r.reference_number && r.reference_number.toLowerCase().includes(q)) ||
                (r.respondent_email && r.respondent_email.toLowerCase().includes(q)) ||
                (r.student_name && r.student_name.toLowerCase().includes(q)) ||
                (r.event_title && r.event_title.toLowerCase().includes(q))
            );
          }

          return list.sort(
            (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
          );
        }
      } catch (err) {
        console.error("Supabase getRegistrations fallback to memory:", err);
      }
    }

    let list = [...this.registrations];

    if (options?.studentUserId || options?.studentEmail) {
      const uid = options?.studentUserId;
      const email = options?.studentEmail?.trim().toLowerCase();
      list = list.filter((r) =>
        (uid && r.student_user_id === uid) ||
        (email && r.respondent_email.toLowerCase() === email)
      );
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
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic
          .from("registrations")
          .select("*, events(title, slug)")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) {
          return {
            ...data,
            event_title: (data as any).events?.title || (data as any).event_title,
            event_slug: (data as any).events?.slug || (data as any).event_slug,
          } as Registration;
        }
      } catch (err) {
        console.error("Supabase getRegistrationById error:", err);
      }
    }

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

    const normalizedEmail = payload.respondentEmail.trim().toLowerCase();

    // 1. Check duplicate via unique source_response_id OR (event_id, respondent_email)
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data: existingRegs } = await supabasePublic
          .from("registrations")
          .select("*, events(title, slug)")
          .eq("event_id", payload.eventId)
          .or(`source_response_id.eq.${payload.sourceResponseId},respondent_email.ilike.${normalizedEmail}`);

        if (existingRegs && existingRegs.length > 0) {
          const existing = {
            ...existingRegs[0],
            event_title: (existingRegs[0] as any).events?.title || event.title,
            event_slug: (existingRegs[0] as any).events?.slug || event.slug,
          } as Registration;

          await this.addIntegrationLog({
            integration_type: "MICROSOFT_FORMS",
            event_id: event.id,
            event_title: event.title,
            source_reference: payload.sourceResponseId,
            operation: "INGEST_FORM_RESPONSE",
            outcome: "DUPLICATE_SKIPPED",
            metadata: {
              message: "Student already registered for this event. Returned existing registration record.",
              referenceNumber: existing.reference_number,
              respondentEmail: payload.respondentEmail,
            },
          });

          return {
            registration: existing,
            isDuplicate: true,
            unresolvedStudent: false,
          };
        }
      } catch (err) {
        console.error("Supabase check existing registration error:", err);
      }
    }

    const existingIndex = this.registrations.findIndex(
      (r) =>
        r.event_id === payload.eventId &&
        (r.source_response_id === payload.sourceResponseId ||
          r.respondent_email.toLowerCase() === normalizedEmail)
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
          message: "Student already registered for this event. Returned existing registration record.",
          referenceNumber: existing.reference_number,
          respondentEmail: payload.respondentEmail,
        },
      });

      return {
        registration: { ...existing },
        isDuplicate: true,
        unresolvedStudent: false,
      };
    }

    // 2. Identity Matching:
    let matchedUser = await this.getUserByEmail(normalizedEmail);
    const isInstitutionalEmail = normalizedEmail.endsWith("iitg.ac.in");

    // Auto-create student user for institutional emails if not already present
    if (!matchedUser && isInstitutionalEmail) {
      matchedUser = await this.upsertUser({
        email: normalizedEmail,
        display_name: payload.respondentName || normalizedEmail.split("@")[0].replace(".", " "),
        role: "STUDENT",
        department: "Data Science and Artificial Intelligence",
      });
    }

    const isUnresolved = !matchedUser;

    const newRegistration: Registration = {
      id: generateUUID(),
      reference_number: generateRegistrationReference(event.slug),
      event_id: event.id,
      event_title: event.title,
      event_slug: event.slug,
      student_user_id: matchedUser ? matchedUser.id : null,
      student_name: matchedUser ? matchedUser.display_name : (payload.respondentName ?? null),
      respondent_email: normalizedEmail,
      source_response_id: payload.sourceResponseId,
      submitted_at: payload.submittedAt || new Date().toISOString(),
      synchronized_at: new Date().toISOString(),
      response_data: payload.answers,
      team_data: payload.teamInfo ?? null,
      response_received_status: "RECEIVED",
      // Direct registration confirmation for verified students, review only for external/unmatched
      registration_status: isUnresolved ? "AWAITING_REVIEW" : "CONFIRMED",
      sync_status: isUnresolved ? "UNRESOLVED_STUDENT" : "SUCCESS",
      review_required: isUnresolved,
      review_notes: isUnresolved
        ? `External/unmatched respondent email '${payload.respondentEmail}'. Requires manual identity resolution by organizer.`
        : "Direct automatic registration confirmation.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: false,
    };

    this.registrations.unshift(newRegistration);

    if (isSupabaseConfigured && supabasePublic) {
      try {
        await supabasePublic.from("registrations").insert({
          id: newRegistration.id,
          reference_number: newRegistration.reference_number,
          event_id: newRegistration.event_id,
          student_user_id: newRegistration.student_user_id,
          respondent_email: newRegistration.respondent_email,
          source_response_id: newRegistration.source_response_id,
          submitted_at: newRegistration.submitted_at,
          synchronized_at: newRegistration.synchronized_at,
          response_data: newRegistration.response_data,
          team_data: newRegistration.team_data,
          response_received_status: newRegistration.response_received_status,
          registration_status: newRegistration.registration_status,
          sync_status: newRegistration.sync_status,
          review_required: newRegistration.review_required,
          review_notes: newRegistration.review_notes,
          created_at: newRegistration.created_at,
          updated_at: newRegistration.updated_at,
        });
      } catch (err) {
        console.error("Supabase insert registration error:", err);
      }
    }

    // Record Integration Log
    await this.addIntegrationLog({
      integration_type: "MICROSOFT_FORMS",
      event_id: event.id,
      event_title: event.title,
      source_reference: payload.sourceResponseId,
      operation: "INGEST_FORM_RESPONSE",
      outcome: "SUCCESS",
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
    if (isSupabaseConfigured && supabasePublic) {
      try {
        await supabasePublic
          .from("registrations")
          .update({
            registration_status: newStatus,
            review_notes: reviewNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      } catch (err) {
        console.error("Supabase updateRegistrationStatus error:", err);
      }
    }

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
    const events = await this.getEvents();
    const registrations = await this.getRegistrations();
    const integrationLogs = await this.getIntegrationLogs();

    const totalEvents = events.filter((e) => !e.archived_at).length;
    const publishedEvents = events.filter((e) => e.publication_status === "PUBLISHED" && !e.archived_at).length;
    const draftEvents = events.filter((e) => e.publication_status === "DRAFT" && !e.archived_at).length;

    const now = new Date();
    const openRegistrations = events.filter(
      (e) => e.publication_status === "PUBLISHED" && new Date(e.registration_close_at) > now
    ).length;
    const closedRegistrations = publishedEvents - openRegistrations;

    const totalResponses = registrations.length;
    const matchedRegistrations = registrations.filter((r) => r.student_user_id !== null).length;
    const confirmedRegistrations = registrations.filter((r) => r.registration_status === "CONFIRMED").length;
    const awaitingReview = registrations.filter((r) => r.registration_status === "AWAITING_REVIEW").length;
    const unmatchedResponses = registrations.filter((r) => r.review_required || r.student_user_id === null).length;
    const syncFailures = integrationLogs.filter((l) => l.outcome === "FAILED").length;

    // Registrations per event
    const eventStats = events
      .filter((e) => !e.archived_at)
      .map((e) => {
        const regs = registrations.filter((r) => r.event_id === e.id);
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
      { name: "Waitlisted", count: registrations.filter((r) => r.registration_status === "WAITLISTED").length, color: "#06B6D4" },
      { name: "Rejected", count: registrations.filter((r) => r.registration_status === "REJECTED").length, color: "#F43F5E" },
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

  async getStudentMetrics(studentUserId: string, studentEmail?: string) {
    const studentRegistrations = await this.getRegistrations({
      studentUserId,
      studentEmail,
    });
    const publishedEvents = await this.getEvents({ onlyPublished: true });

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
