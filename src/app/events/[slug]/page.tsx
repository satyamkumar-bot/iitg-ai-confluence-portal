import { dataStore } from "@/lib/db/store";
import { notFound } from "next/navigation";
import { EventDetailsClient } from "./EventDetailsClient";

export default async function EventDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await dataStore.getEventBySlug(params.slug);
  if (!event || event.archived_at) {
    notFound();
  }

  // Fetch related announcements for this event
  const relatedAnnouncements = await dataStore.getAnnouncements({
    eventId: event.id,
    activeOnly: true,
  });

  return (
    <EventDetailsClient
      event={event}
      relatedAnnouncements={relatedAnnouncements}
    />
  );
}
