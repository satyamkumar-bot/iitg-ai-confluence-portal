import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { eventSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const event = await dataStore.getEventById(params.id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const body = await req.json();
    const validation = eventSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid event update data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updated = await dataStore.updateEvent(params.id, validation.data, user.id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const archived = await dataStore.archiveEvent(params.id, user.id);
    if (!archived) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Event archived successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
