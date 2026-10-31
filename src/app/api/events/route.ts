import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const statusFilter = searchParams.get("status") || undefined;

    // Public / student endpoint only returns PUBLISHED events!
    const events = await dataStore.getEvents({
      onlyPublished: true,
      includeArchived: false,
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
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch events" }, { status: 500 });
  }
}
