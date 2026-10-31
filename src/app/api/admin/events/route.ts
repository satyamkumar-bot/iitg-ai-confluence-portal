import { NextRequest, NextResponse } from "next/server";
import { eventSchema } from "@/lib/validation/schemas";
import { dataStore } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const statusFilter = searchParams.get("status") || undefined;

    const events = await dataStore.getEvents({
      onlyPublished: false,
      includeArchived: true,
      category,
      search,
      statusFilter,
    });

    return NextResponse.json(
      { success: true, events },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
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
      } as any,
      user.id
    );

    return NextResponse.json({ success: true, event: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
