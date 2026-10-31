import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { User, UserRole } from "@/types";
import { dataStore } from "../db/store";

export interface SafeSessionUser {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  department?: string | null;
  roll_number?: string | null;
}

export async function getCurrentUser(): Promise<SafeSessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  // Verify strictly against database store
  const dbUser = await dataStore.getUserByEmail(session.user.email);
  if (!dbUser) {
    return {
      id: (session.user as any).id || "unknown",
      name: session.user.name,
      email: session.user.email,
      role: ((session.user as any).role || "STUDENT") as UserRole,
    };
  }

  return {
    id: dbUser.id,
    name: dbUser.display_name,
    email: dbUser.email,
    role: dbUser.role,
    department: dbUser.department,
    roll_number: dbUser.roll_number,
  };
}

export async function requireAuth(): Promise<SafeSessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireOrganizer(): Promise<SafeSessionUser> {
  const user = await requireAuth();
  if (user.role !== "ORGANIZER") {
    throw new Error("FORBIDDEN_ORGANIZER_ONLY");
  }
  return user;
}
