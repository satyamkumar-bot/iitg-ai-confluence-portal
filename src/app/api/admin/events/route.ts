import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { eventSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const events = await dataStore.getEvents({
      onlyPublished: false, // Organizers see Draft, Published, etc.
      category,
      search,
    });

    return NextResponse.json({ success: true, events });
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
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid event data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const created = await dataStore.createEvent(
      {
        ...validation.data,
        form_integration_type: "POWER_AUTOMATE_WEBHOOK",
        created_by: user.id,
      },
      user.id
    );

    return NextResponse.json({ success: true, event: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
