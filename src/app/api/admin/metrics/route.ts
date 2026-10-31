import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Organizer role required" }, { status: 403 });
    }

    const metrics = await dataStore.getAdminMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load metrics" }, { status: 500 });
  }
}
