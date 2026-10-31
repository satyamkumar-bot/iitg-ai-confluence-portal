import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;
    const status = searchParams.get("status") || undefined;
    const syncStatus = searchParams.get("syncStatus") || undefined;
    const search = searchParams.get("search") || undefined;
    const reviewRequiredOnly = searchParams.get("reviewRequired") === "true";

    const registrations = await dataStore.getRegistrations({
      eventId,
      status,
      syncStatus,
      search,
      reviewRequiredOnly,
    });

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load registrations" }, { status: 500 });
  }
}
