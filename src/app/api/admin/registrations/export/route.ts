import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { objectsToCsv } from "@/lib/utils";

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

    // Transform to exportable flat rows
    const rows = registrations.map((r) => ({
      reference_number: r.reference_number,
      event_title: r.event_title || r.event_id,
      student_name: r.student_name || "Unmatched",
      student_email: r.respondent_email,
      registration_status: r.registration_status,
      sync_status: r.sync_status,
      submitted_at: r.submitted_at,
      synchronized_at: r.synchronized_at,
      source_response_id: r.source_response_id || "",
      review_required: r.review_required ? "Yes" : "No",
      review_notes: r.review_notes || "",
    }));

    const headers = [
      { key: "reference_number", label: "Registration Reference" },
      { key: "event_title", label: "Event Title" },
      { key: "student_name", label: "Student Name" },
      { key: "student_email", label: "Respondent Email" },
      { key: "registration_status", label: "Status" },
      { key: "sync_status", label: "Sync Status" },
      { key: "submitted_at", label: "Submitted At" },
      { key: "synchronized_at", label: "Synchronized At" },
      { key: "source_response_id", label: "Source Response ID" },
      { key: "review_required", label: "Review Required" },
      { key: "review_notes", label: "Organizer Notes" },
    ];

    const csvContent = objectsToCsv(rows, headers);

    // Record in Audit Log
    await dataStore.addAuditLog({
      actor_user_id: user.id,
      actor_email: user.email,
      action: "REGISTRATIONS_EXPORTED_CSV",
      entity_type: "REGISTRATION",
      sanitized_metadata: {
        exportedCount: rows.length,
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
