import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { updateRegistrationStatusSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const registration = await dataStore.getRegistrationById(params.id);
    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const body = await req.json();

    // Check if this is a manual student assignment action
    if (body.action === "ASSIGN_STUDENT" && body.studentUserId) {
      const updated = await dataStore.assignUnmatchedRegistration(
        params.id,
        body.studentUserId,
        user.id
      );
      return NextResponse.json({
        success: true,
        message: "Registration successfully resolved and assigned to student",
        registration: updated,
      });
    }

    // Otherwise, standard status update
    const validation = updateRegistrationStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid status update payload", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updated = await dataStore.updateRegistrationStatus(
      params.id,
      validation.data.registration_status,
      validation.data.review_notes,
      user.id
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Registration status updated to ${validation.data.registration_status}`,
      registration: updated,
    });
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

    await dataStore.deleteRegistration(params.id, user.id);

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
