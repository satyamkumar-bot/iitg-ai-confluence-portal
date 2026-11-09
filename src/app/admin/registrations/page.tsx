import { dataStore } from "@/lib/db/store";
import { AdminRegistrationsClient } from "./AdminRegistrationsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRegistrationsPage() {
  const registrations = await dataStore.getRegistrations();
  const events = await dataStore.getEvents();
  const users = await dataStore.getUsers();

  return (
    <AdminRegistrationsClient
      initialRegistrations={registrations}
      events={events}
      users={users}
    />
  );
}
