import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ORGANIZER") {
      redirect("/admin");
    } else {
      redirect("/events");
    }
  }
  redirect("/auth/signin");
}
