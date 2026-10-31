"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn, Sparkles, AlertCircle, ArrowRight, User } from "lucide-react";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [devEmail, setDevEmail] = useState("rahul.sharma@iitg.ac.in");
  const [devRole, setDevRole] = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (session?.user) {
    const role = (session.user as any).role;
    router.push(role === "ORGANIZER" ? "/admin" : "/dashboard");
    return null;
  }

  const handleEntraSignIn = () => {
    setLoading(true);
    signIn("azure-ad", { callbackUrl: "/dashboard" });
  };

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signIn("dev-mock-login", {
      email: devEmail,
      role: devRole,
      redirect: false,
    });

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      router.push(devRole === "ORGANIZER" ? "/admin" : "/dashboard");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-100/60">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-iitg-navy-950 to-iitg-navy-850 p-6 text-white text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-cyan-300" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            IIT Guwahati &bull; MFSDSAI
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            AI Confluence Portal Sign In
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Institutional authentication for students and organizers
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Microsoft Entra ID Button */}
          <div className="space-y-3">
            <button
              onClick={handleEntraSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-iitg-navy-900 hover:bg-iitg-navy-800 text-white font-semibold text-sm shadow-md transition-all border border-slate-700"
            >
              {/* Microsoft Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span>Sign in with Microsoft Entra ID</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Authorized for @iitg.ac.in accounts & approved institutional tenants.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink-0 mx-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Development Testing Mode
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Dev Mock Sign In (Clearly indicated) */}
          <form onSubmit={handleDevSignIn} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mr-1">
                DEV MOCK
              </span>
              Simulate authentication with seed accounts:
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Account Email</label>
              <input
                type="email"
                required
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Assigned Role</label>
              <select
                value={devRole}
                onChange={(e) => setDevRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="STUDENT">Student (Default)</option>
                <option value="ORGANIZER">Organizer / Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Simulate Login</span>
            </button>
          </form>

          {/* Footer security badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Strict server-side role validation enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
