import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { microsoftFormsWebhookSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ORGANIZER") {
      return NextResponse.json({ success: false, error: "Unauthorized: Organizer access required" }, { status: 403 });
    }

    const body = await req.json();
    const validation = microsoftFormsWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid test payload", details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await dataStore.ingestMicrosoftFormsWebhook(validation.data);

    return NextResponse.json({
      success: true,
      message: result.isDuplicate ? "Duplicate response detected and handled safely" : "Test webhook processed successfully!",
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Simulation failed" }, { status: 500 });
  }
}
