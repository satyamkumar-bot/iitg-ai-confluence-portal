import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { announcementSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const announcements = await dataStore.getAnnouncements({ activeOnly: false });
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const body = await req.json();
    const validation = announcementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid announcement data", details: validation.error.issues },
        { status: 400 }
      );
    }

    let eventTitle: string | undefined;
    if (validation.data.event_id) {
      const event = await dataStore.getEventById(validation.data.event_id);
      eventTitle = event?.title;
    }

    const announcement = await dataStore.createAnnouncement(
      {
        ...validation.data,
        event_title: eventTitle,
        created_by: user.id,
        is_demo: false,
      },
      user.id
    );

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
