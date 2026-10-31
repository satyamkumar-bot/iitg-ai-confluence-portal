import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || "AuthenticationFailed";

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-6 shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Authentication Error</h1>
        <p className="text-xs text-slate-600">
          The Microsoft Entra ID authentication request could not be completed.
        </p>
        <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 break-all">
          Code: {error}
        </div>
        <p className="text-xs text-slate-500">
          Please verify that your Microsoft account belongs to the authorized institutional tenant or contact the conference administrator.
        </p>
        <div className="pt-2">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-iitg-navy-900 text-white text-xs font-semibold hover:bg-iitg-navy-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
