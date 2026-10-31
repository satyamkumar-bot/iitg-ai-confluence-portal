import { dataStore } from "@/lib/db/store";
import { AdminIntegrationsClient } from "./AdminIntegrationsClient";

export default async function AdminIntegrationsPage() {
  const events = await dataStore.getEvents();
  const integrationLogs = await dataStore.getIntegrationLogs();

  return (
    <AdminIntegrationsClient
      events={events}
      initialLogs={integrationLogs}
    />
  );
}
