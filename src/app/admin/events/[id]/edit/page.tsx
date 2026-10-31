import { dataStore } from "@/lib/db/store";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await dataStore.getEventById(params.id);
  if (!event) {
    notFound();
  }

  return <EventForm initialEvent={event} isEdit={true} />;
}
