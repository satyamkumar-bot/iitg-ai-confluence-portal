import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;

    const announcements = await dataStore.getAnnouncements({
      eventId,
      activeOnly: true,
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load announcements" }, { status: 500 });
  }
}
