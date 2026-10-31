import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    // Strict access control: only fetch registrations belonging to this student!
    const registrations = await dataStore.getRegistrations({
      studentUserId: user.id,
      status,
      search,
    });

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load registrations" }, { status: 500 });
  }
}
