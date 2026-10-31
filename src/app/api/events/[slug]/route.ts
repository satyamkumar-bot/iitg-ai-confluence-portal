import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const event = await dataStore.getEventBySlug(params.slug);
    if (!event || event.archived_at) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // If draft, only organizers can view
    if (event.publication_status === "DRAFT") {
      const user = await getCurrentUser();
      if (!user || user.role !== "ORGANIZER") {
        return NextResponse.json(
          { success: false, error: "Event is not published and requires organizer privileges to preview." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load event" }, { status: 500 });
  }
}
