import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { objectsToCsv } from "@/lib/utils";

/**
 * Extracts all file attachment links from a response value (e.g. OneDrive / SharePoint metadata from MS Forms)
 */
function extractAttachmentLinks(value: any): string[] {
  if (!value) return [];
  const links: string[] = [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of arr) {
          if (item && typeof item === "object") {
            const link = item.link || item.url || item.driveUrl;
            if (link) links.push(`${item.name || "File"}: ${link}`);
          }
        }
      } catch {}
    }
    if (links.length === 0 && (trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
      links.push(trimmed);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === "object") {
        const link = item.link || item.url || item.driveUrl;
        if (link) links.push(`${item.name || "File"}: ${link}`);
      } else if (typeof item === "string" && (item.startsWith("http://") || item.startsWith("https://"))) {
        links.push(item);
      }
    }
  } else if (typeof value === "object" && value !== null) {
    const link = value.link || value.url || value.driveUrl;
    if (link) links.push(`${value.name || "File"}: ${link}`);
  }

  return links;
}

/**
 * Formats a questionnaire answer safely for a CSV cell
 */
function formatAnswerForCsv(value: any): string {
  if (value === null || value === undefined) return "";
  const fileLinks = extractAttachmentLinks(value);
  if (fileLinks.length > 0) {
    return fileLinks.join(" | ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;
    const status = searchParams.get("status") || undefined;

    const registrations = await dataStore.getRegistrations({
      eventId,
      status,
    });

    // 1. Collect all distinct question names across all registrations
    const questionSet = new Set<string>();
    for (const r of registrations) {
      if (r.response_data && typeof r.response_data === "object") {
        for (const key of Object.keys(r.response_data)) {
          if (key && key.trim()) {
            questionSet.add(key.trim());
          }
        }
      }
    }
    const questionKeys = Array.from(questionSet);

    // 2. Transform to exportable flat rows with dynamic columns for each question
    const rows = registrations.map((r) => {
      const rowData: Record<string, any> = {
        reference_number: r.reference_number,
        event_title: r.event_title || r.event_id,
        student_name: r.student_name || (r.respondent_email ? r.respondent_email.split("@")[0].replace(/[._]/g, " ") : "Unmatched"),
        student_email: r.respondent_email,
        registration_status: r.registration_status,
        sync_status: r.sync_status,
      };

      const allAttachments: string[] = [];

      // Add each Microsoft Form question as its own distinct column
      for (const qKey of questionKeys) {
        const ans = r.response_data ? r.response_data[qKey] : undefined;
        rowData[`q_${qKey}`] = formatAnswerForCsv(ans);

        const files = extractAttachmentLinks(ans);
        if (files.length > 0) {
          allAttachments.push(...files);
        }
      }

      rowData["all_attachments"] = allAttachments.length > 0 ? allAttachments.join(" ; ") : "None";
      rowData["submitted_at"] = r.submitted_at;
      rowData["synchronized_at"] = r.synchronized_at;
      rowData["source_response_id"] = r.source_response_id || "";
      rowData["review_required"] = r.review_required ? "Yes" : "No";
      rowData["review_notes"] = r.review_notes || "";

      return rowData;
    });

    // 3. Assemble CSV headers
    const baseHeaders = [
      { key: "reference_number", label: "Registration Reference" },
      { key: "event_title", label: "Event Title" },
      { key: "student_name", label: "Student Name" },
      { key: "student_email", label: "Respondent Email" },
      { key: "registration_status", label: "Status" },
      { key: "sync_status", label: "Sync Status" },
    ];

    const questionHeaders = questionKeys.map((qKey) => ({
      key: `q_${qKey}`,
      label: qKey,
    }));

    const trailingHeaders = [
      { key: "all_attachments", label: "All Uploaded Files & Attachments" },
      { key: "submitted_at", label: "Submitted At" },
      { key: "synchronized_at", label: "Synchronized At" },
      { key: "source_response_id", label: "Source Response ID" },
      { key: "review_required", label: "Review Required" },
      { key: "review_notes", label: "Organizer Notes" },
    ];

    const headers = [...baseHeaders, ...questionHeaders, ...trailingHeaders];

    const csvContent = objectsToCsv(rows, headers);

    // Record in Audit Log
    await dataStore.addAuditLog({
      actor_user_id: user.id,
      actor_email: user.email,
      action: "REGISTRATIONS_EXPORTED_CSV",
      entity_type: "REGISTRATION",
      sanitized_metadata: {
        exportedCount: rows.length,
        questionCount: questionKeys.length,
        filterEventId: eventId || "ALL",
        filterStatus: status || "ALL",
      },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `IITG_AI_Confluence_Registrations_${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Export failed" }, { status: 500 });
  }
}
