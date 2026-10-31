import { dataStore } from "@/lib/db/store";
import { getCurrentUser } from "@/lib/auth/session";
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

  // Check if current user is logged in and already registered
  const currentUser = await getCurrentUser();
  let userRegistration = null;
  if (currentUser) {
    const userRegs = await dataStore.getRegistrations({
      eventId: event.id,
      studentEmail: currentUser.email,
    });
    if (userRegs.length > 0) {
      userRegistration = userRegs[0];
    }
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
      userRegistration={userRegistration}
      currentUser={currentUser}
    />
  );
}
