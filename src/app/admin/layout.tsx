import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Strict server-side organizer authorization check
  if (!user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (user.role !== "ORGANIZER") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Organizer Privileges Required</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            You are signed in as <strong>{user.email}</strong> with the <strong>STUDENT</strong> role.
            Administrative pages are restricted to authorized conference organizers.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 text-left">
            <strong>Development Note:</strong> In local testing mode, use the top switcher to switch to <em>Organizer (Admin)</em>, or add your email to the <code>ORGANIZER_ADMIN_EMAILS</code> environment variable.
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-iitg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-cyan-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Student Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden p-6 lg:p-8">{children}</div>
    </div>
  );
}
