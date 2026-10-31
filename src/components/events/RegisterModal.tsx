"use client";

import { useState } from "react";
import { X, ExternalLink, ShieldCheck, AlertCircle, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { EventItem, Registration } from "@/types";
import Link from "next/link";

interface RegisterModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  userRegistration?: Registration | null;
}

export function RegisterModal({ event, isOpen, onClose, userRegistration }: RegisterModalProps) {
  const [embedView, setEmbedView] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const deadline = new Date(event.registration_close_at);
  const isPastDeadline = deadline <= now;
  const hasFormUrl = Boolean(event.microsoft_forms_url && event.microsoft_forms_url.startsWith("http"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
              Event Registration
            </div>
            <h2 className="text-base font-bold text-slate-900 line-clamp-1">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Already registered check */}
          {userRegistration ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-emerald-950">You Are Already Registered!</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  We have already received and confirmed your registration for this event.
                </p>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 font-mono text-xs">
                Registration Ref: <span className="font-bold text-emerald-900">{userRegistration.reference_number}</span>
                <span className="block text-[11px] text-emerald-700 mt-0.5">Status: {userRegistration.registration_status}</span>
              </div>
              <div className="pt-2 flex justify-center">
                <Link
                  href="/registrations"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Go to My Registrations
                </Link>
              </div>
            </div>
          ) : isPastDeadline ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Registration Closed</h4>
                <p className="text-xs mt-1 text-rose-700">
                  The official registration window for this event closed on{" "}
                  <strong>{new Date(event.registration_close_at).toLocaleString("en-IN")}</strong>. No further responses can be accepted.
                </p>
              </div>
            </div>
          ) : !hasFormUrl ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Registration Link Not Configured</h4>
                <p className="text-xs mt-1 text-amber-700">
                  The organizers have not yet assigned a Microsoft Forms registration link for this event. Please check back shortly or refer to announcements.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Important Synchronization Disclaimer */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <RefreshCw className="w-4 h-4 text-cyan-600" />
                  <span>Direct Registration Confirmation</span>
                </div>
                <p className="leading-relaxed">
                  1. Fill out the official <strong>Microsoft Forms</strong> registration questionnaire for this event.
                </p>
                <p className="leading-relaxed">
                  2. Upon form submission, your registration is directly matched to your institutional student identity and marked <strong>Confirmed</strong>.
                </p>
                <p className="leading-relaxed">
                  3. You can review your confirmed status anytime under <strong>My Registrations</strong>.
                </p>
              </div>

              {/* Form Action Controls */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    Microsoft Forms Destination:
                  </span>
                  <button
                    onClick={() => setEmbedView(!embedView)}
                    className="text-cyan-700 hover:underline"
                  >
                    {embedView ? "Switch to New Tab view" : "Switch to Embedded view"}
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-mono break-all bg-white p-2.5 rounded border border-slate-200">
                  {event.microsoft_forms_url}
                </div>

                {!embedView ? (
                  <div className="pt-2">
                    <a
                      href={event.microsoft_forms_url!}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-iitg-navy-900 hover:bg-cyan-700 text-white font-semibold text-sm shadow-md transition-colors"
                    >
                      <span>Open Form in Microsoft Forms (New Tab)</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-center text-[11px] text-slate-500 mt-2">
                      Please use your institutional IIT Guwahati email address if prompted.
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-80 border border-slate-300 rounded-lg overflow-hidden bg-white mt-2">
                    <iframe
                      src={event.microsoft_forms_url!}
                      className="w-full h-full border-0"
                      title="Microsoft Forms Embed"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Secure institutional integration</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
