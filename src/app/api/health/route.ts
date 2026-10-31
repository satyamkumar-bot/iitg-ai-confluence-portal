import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAzureConfigured = Boolean(
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID &&
    process.env.AZURE_AD_CLIENT_ID !== "00000000-0000-0000-0000-000000000000"
  );

  const isDevAuthMock = process.env.ENABLE_DEV_AUTH_MOCK === "true";

  const status = {
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    memoryUsageMB: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    services: {
      database: {
        provider: isSupabaseConfigured ? "Supabase PostgreSQL" : "Local Development Repository",
        status: "CONNECTED",
      },
      authentication: {
        provider: isAzureConfigured ? "Microsoft Entra ID (Azure AD)" : "Development Mock Auth",
        mockMode: isDevAuthMock,
      },
      formsIntegration: {
        provider: "Microsoft Power Automate Webhook",
        endpoint: "/api/integrations/microsoft-forms/responses",
        secretConfigured: Boolean(process.env.POWER_AUTOMATE_INTEGRATION_KEY),
      },
    },
  };

  return NextResponse.json(status, { status: 200 });
}
