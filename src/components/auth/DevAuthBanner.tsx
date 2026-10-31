"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { ShieldAlert, UserCheck, LogOut } from "lucide-react";

export function DevAuthBanner() {
  const { data: session } = useSession();

  const handleQuickLogin = async (email: string, role: string) => {
    await signIn("dev-mock-login", {
      email,
      role,
      callbackUrl: role === "ORGANIZER" ? "/admin" : "/dashboard",
    });
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-300/40 text-amber-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>DEVELOPMENT ENVIRONMENT:</strong> Mock Authentication Active.
            {session?.user ? (
              <span className="ml-2 font-normal text-slate-700">
                Logged in as: <strong>{session.user.name}</strong> ({session.user.email}) &bull; Role:{" "}
                <span className="uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  {(session.user as any).role || "STUDENT"}
                </span>
              </span>
            ) : (
              <span className="ml-2 font-normal text-slate-700">Not authenticated.</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Quick switch:</span>
          <button
            onClick={() => handleQuickLogin("rahul.sharma@iitg.ac.in", "STUDENT")}
            className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-300 font-medium text-slate-700 shadow-sm transition-colors"
          >
            Student (Rahul)
          </button>
          <button
            onClick={() => handleQuickLogin("ananya.roy@iitg.ac.in", "STUDENT")}
            className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-300 font-medium text-slate-700 shadow-sm transition-colors"
          >
            Student (Ananya)
          </button>
          <button
            onClick={() => handleQuickLogin("confluence.admin@iitg.ac.in", "ORGANIZER")}
            className="px-2 py-1 bg-iitg-navy-900 hover:bg-iitg-navy-800 text-white rounded font-medium shadow-sm transition-colors"
          >
            Organizer (Admin)
          </button>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign Out"
              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
