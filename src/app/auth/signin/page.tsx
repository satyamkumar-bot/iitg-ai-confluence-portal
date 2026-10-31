"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, LogIn, Sparkles, AlertCircle } from "lucide-react";

const QUICK_ACCOUNTS = [
  {
    name: "Satyam Kumar",
    email: "k.satyam@op.iitg.ac.in",
    password: "rb#AtQ8%C!gXkSG",
    role: "Admin / Organizer",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    name: "Vanshi Sethi",
    email: "s.vanshi@op.iitg.ac.in",
    password: "rb#AtQ8%C!gXkSV",
    role: "Student",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    name: "Amarjeet Kumar",
    email: "amarjeet.kumar@op.iitg.ac.in",
    password: "rb#AtQ8%C!gXkSA",
    role: "Student",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
];

function SignInForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("k.satyam@op.iitg.ac.in");
  const [password, setPassword] = useState("rb#AtQ8%C!gXkSG");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (session?.user) {
    const role = (session.user as any).role;
    router.push(role === "ORGANIZER" ? "/admin" : "/dashboard");
    return null;
  }

  const handleEntraSignIn = () => {
    setLoading(true);
    signIn("azure-ad", { callbackUrl });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setErrorMsg(res.error || "Failed to sign in. Please verify your credentials.");
      setLoading(false);
    } else {
      router.push(email === "k.satyam@op.iitg.ac.in" ? "/admin" : callbackUrl);
      router.refresh();
    }
  };

  const selectQuickAccount = (acc: (typeof QUICK_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg(null);
  };

  return (
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

        {/* Quick Account Fill Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quick Select Account:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {QUICK_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => selectQuickAccount(acc)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  email === acc.email
                    ? "border-cyan-600 bg-cyan-50/70 shadow-xs ring-1 ring-cyan-600"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                    {acc.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{acc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{acc.email}</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}
                >
                  {acc.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Institutional Credentials Form */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-iitg-navy-900 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
          </button>
        </form>

        {/* Microsoft Entra ID Option */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handleEntraSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors border border-slate-300"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            <span>Single Sign-On with Microsoft Entra ID</span>
          </button>
        </div>

        {/* Footer security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>Strict server-side role validation enforced</span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-100/60">
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading sign in...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
