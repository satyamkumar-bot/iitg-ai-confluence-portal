import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const registration = await dataStore.getRegistrationById(params.id);
    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 });
    }

    // Strict access control: Student can only view their own registration!
    const isOwner = registration.student_user_id === user.id;
    const isOrganizer = user.role === "ORGANIZER";

    if (!isOwner && !isOrganizer) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to view another student's registration." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load registration" }, { status: 500 });
  }
}
