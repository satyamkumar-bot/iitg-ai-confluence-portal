import { dataStore } from "@/lib/db/store";
import { AdminAnnouncementsClient } from "./AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const announcements = await dataStore.getAnnouncements({ activeOnly: false });
  const events = await dataStore.getEvents();

  return (
    <AdminAnnouncementsClient
      initialAnnouncements={announcements}
      events={events}
    />
  );
}
