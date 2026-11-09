import { NextRequest, NextResponse } from "next/server";
import { microsoftFormsWebhookSchema } from "@/lib/validation/schemas";
import { dataStore } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the integration caller
    const configuredSecret = process.env.POWER_AUTOMATE_INTEGRATION_KEY || "iitg_msforms_dev_secret_key_2026";
    const apiKeyHeader = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");

    let providedSecret = apiKeyHeader;
    if (!providedSecret && authHeader?.startsWith("Bearer ")) {
      providedSecret = authHeader.substring(7).trim();
    }

    if (!providedSecret || providedSecret !== configuredSecret) {
      await dataStore.addIntegrationLog({
        integration_type: "MICROSOFT_FORMS",
        operation: "AUTHENTICATE_WEBHOOK",
        outcome: "FAILED",
        error_code: "UNAUTHORIZED_KEY",
        sanitized_error_message: "Rejected incoming webhook: Invalid or missing API key header.",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing integration secret (x-api-key header required).",
        },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload Size & JSON
    let bodyText: string;
    try {
      bodyText = await req.text();
    } catch {
      return NextResponse.json({ success: false, error: "Failed to read request body" }, { status: 400 });
    }

    if (bodyText.length > 500000) {
      // 500KB safety limit
      return NextResponse.json({ success: false, error: "Payload exceeds maximum allowed size (500KB)" }, { status: 413 });
    }

    let rawJson: any;
    try {
      rawJson = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON format" }, { status: 400 });
    }

    // 3. Validate against Zod schema
    const validationResult = microsoftFormsWebhookSchema.safeParse(rawJson);
    if (!validationResult.success) {
      const issueDetails = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      await dataStore.addIntegrationLog({
        integration_type: "MICROSOFT_FORMS",
        operation: "VALIDATE_PAYLOAD",
        outcome: "FAILED",
        error_code: "SCHEMA_VALIDATION_ERROR",
        sanitized_error_message: `Payload validation failed: ${issueDetails}`,
        metadata: { receivedFields: Object.keys(rawJson) },
      });

      return NextResponse.json(
        {
          success: false,
          error: `Payload validation failed: ${issueDetails}`, 
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // 4. Ingest idempotently into store
    const result = await dataStore.ingestMicrosoftFormsWebhook(payload);

    return NextResponse.json(
      {
        success: true,
        message: result.isDuplicate
          ? "Duplicate response skipped safely (idempotent)."
          : "Form response synchronized successfully.",
        registration: {
          id: result.registration.id,
          referenceNumber: result.registration.reference_number,
          eventId: result.registration.event_id,
          registrationStatus: result.registration.registration_status,
          syncStatus: result.registration.sync_status,
          reviewRequired: result.registration.review_required,
        },
        isDuplicate: result.isDuplicate,
        unresolvedStudent: result.unresolvedStudent,
      },
      { status: result.isDuplicate ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("Error processing Microsoft Forms webhook:", error);

    await dataStore.addIntegrationLog({
      integration_type: "MICROSOFT_FORMS",
      operation: "INGEST_FORM_RESPONSE",
      outcome: "FAILED",
      error_code: "INTERNAL_SERVER_ERROR",
      sanitized_error_message: error?.message || "Internal server error occurred while processing response.",
    });

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred",
      },
      { status: error?.message?.includes("not found") ? 404 : 500 }
    );
  }
}
