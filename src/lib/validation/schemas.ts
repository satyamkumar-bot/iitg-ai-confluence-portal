import { z } from "zod";

// ==============================================================================
// MICROSOFT FORMS / POWER AUTOMATE WEBHOOK PAYLOAD SCHEMA
// ==============================================================================
export const microsoftFormsWebhookSchema = z.object({
  eventId: z.string().min(1, "Event ID is required").transform((val) => val.trim()),
  formId: z.string().optional().nullable(),
  sourceResponseId: z
    .union([z.string(), z.number()])
    .transform((val) => String(val).trim()),
  respondentEmail: z
    .string()
    .min(1, "Respondent email is required")
    .transform((val) => val.trim()),
  respondentName: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? String(val).trim() : undefined)),
  submittedAt: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val) return new Date().toISOString();
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    }),
  answers: z.record(z.any()).optional().default({}),
  teamInfo: z.any().optional(),
});

export type MicrosoftFormsWebhookInput = z.infer<typeof microsoftFormsWebhookSchema>;

// ==============================================================================
// EVENT SCHEMA
// ==============================================================================
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  short_description: z.string().min(10, "Short description must be at least 10 characters").max(500),
  full_description: z.string().min(20, "Full description must be at least 20 characters"),
  category: z.string().min(2, "Category is required"),
  banner_url: z.string().optional().or(z.literal("")).nullable(),
  event_start_at: z.string().optional().nullable(),
  event_end_at: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Kolkata"),
  venue: z.string().min(2, "Venue is required"),
  participation_mode: z.enum(["IN_PERSON", "HYBRID", "ONLINE"]).default("IN_PERSON"),
  registration_open_at: z.string().datetime("Valid registration open date required"),
  registration_close_at: z.string().datetime("Valid registration deadline required"),
  eligibility: z.string().min(5, "Eligibility criteria is required"),
  participation_type: z.enum(["INDIVIDUAL", "TEAM", "EITHER"]).default("INDIVIDUAL"),
  minimum_team_size: z.number().int().min(1).default(1),
  maximum_team_size: z.number().int().min(1).default(1),
  rules: z.array(z.string()).default([]),
  agenda: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        description: z.string().optional(),
        speaker: z.string().optional(),
      })
    )
    .default([]),
  prerequisites: z.string().optional().nullable(),
  selection_criteria: z.string().optional().nullable(),
  prizes: z
    .array(
      z.object({
        position: z.string(),
        prize: z.string(),
        description: z.string().optional(),
      })
    )
    .default([]),
  certificate_information: z.string().optional().nullable(),
  coordinator_information: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .default([]),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
  microsoft_forms_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  publication_status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  archived_at: z.string().datetime().nullable().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

// ==============================================================================
// REGISTRATION STATUS UPDATE SCHEMA
// ==============================================================================
export const updateRegistrationStatusSchema = z.object({
  registration_status: z.enum([
    "AWAITING_REVIEW",
    "CONFIRMED",
    "WAITLISTED",
    "REJECTED",
    "CANCELLED",
  ]),
  review_notes: z.string().optional(),
});

// ==============================================================================
// ANNOUNCEMENT SCHEMA
// ==============================================================================
export const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  body: z.string().min(10, "Announcement body must be at least 10 characters"),
  event_id: z.string().uuid().optional().nullable(),
  priority: z.enum(["NORMAL", "IMPORTANT", "URGENT"]).default("NORMAL"),
  external_link: z.string().url().optional().or(z.literal("")).nullable(),
  published_at: z.string().datetime().optional().default(() => new Date().toISOString()),
  expires_at: z.string().datetime().optional().nullable(),
});
