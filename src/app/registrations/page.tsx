import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { redirect } from "next/navigation";
import { MyRegistrationsClient } from "./MyRegistrationsClient";

export default async function MyRegistrationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch only this student's registrations
  const registrations = await dataStore.getRegistrations({ studentUserId: user.id });

  return <MyRegistrationsClient initialRegistrations={registrations} />;
}
