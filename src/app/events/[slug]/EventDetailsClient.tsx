"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  HelpCircle,
  Award,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Share2,
  ExternalLink,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { EventItem, Announcement } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { RegisterModal } from "@/components/events/RegisterModal";

export function EventDetailsClient({
  event,
  relatedAnnouncements,
  userRegistration,
  currentUser,
}: {
  event: EventItem;
  relatedAnnouncements: Announcement[];
  userRegistration?: any;
  currentUser?: any;
}) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "rules" | "faq">("overview");

  const rules = Array.isArray(event.rules) ? event.rules : typeof event.rules === "string" && (event.rules as string).trim() ? [event.rules] : [];
  const agenda = Array.isArray(event.agenda) ? event.agenda : [];
  const prizes = Array.isArray(event.prizes) ? event.prizes : [];
  const coordinators = Array.isArray(event.coordinator_information) ? event.coordinator_information : [];
  const faq = Array.isArray(event.faq) ? event.faq : [];

  const now = new Date();
  const deadline = new Date(event.registration_close_at);
  const isPastDeadline = deadline <= now;
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isClosingSoon = !isPastDeadline && diffHours <= 72;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">ID: {event.id}</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {event.banner_url && (
            <div className="h-64 sm:h-80 w-full overflow-hidden relative">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-900 shadow-sm">
                  {event.category}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div className="space-y-2 max-w-3xl">
                {!event.banner_url && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                    {event.category}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {event.title}
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {event.short_description}
                </p>
              </div>

              {/* Action Box */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px]">
                {userRegistration ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5 text-center shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Already Registered</span>
                    </div>
                    <div className="text-[11px] text-emerald-950">
                      Ref: <span className="font-mono font-bold">{userRegistration.reference_number}</span>
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200/80 text-emerald-900">
                      Status: {userRegistration.registration_status}
                    </div>
                    <div className="pt-1">
                      <Link
                        href="/registrations"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                      >
                        <span>View in My Registrations</span>
                      </Link>
                    </div>
                  </div>
                ) : isPastDeadline ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide block">
                      Registration Closed
                    </span>
                    <span className="text-[11px] text-rose-600 block mt-0.5">
                      Deadline passed: {formatDate(event.registration_close_at)}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="w-full py-3.5 px-6 rounded-xl bg-iitg-navy-900 hover:bg-cyan-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Register Now via MS Forms</span>
                    <ExternalLink className="w-4 h-4 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                <div className="text-center text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Deadline:</span>{" "}
                  {formatDateTime(event.registration_close_at)}
                </div>
              </div>
            </div>

            {/* Event Key Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Date & Time
                </span>
                <div className="font-bold text-slate-900">{formatDate(event.event_start_at || event.registration_open_at)}</div>
                <div className="text-slate-500 text-[11px]">Starts {formatDateTime(event.event_start_at || event.registration_open_at)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Venue & Mode
                </span>
                <div className="font-bold text-slate-900 truncate">{event.venue}</div>
                <div className="text-slate-500 text-[11px]">{event.participation_mode.replace("_", " ")}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-600" /> Team Format
                </span>
                <div className="font-bold text-slate-900">
                  {event.participation_type === "TEAM"
                    ? `${event.minimum_team_size} - ${event.maximum_team_size} Members`
                    : event.participation_type === "INDIVIDUAL"
                    ? "Individual"
                    : "Individual or Team"}
                </div>
                <div className="text-slate-500 text-[11px]">{event.participation_type}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Status
                </span>
                <div className="font-bold text-slate-900">
                  {isPastDeadline ? "Closed" : isClosingSoon ? "Closing Soon" : "Open"}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {isClosingSoon ? "Less than 72 hours remaining" : "Accepting submissions"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs Navigation */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "overview", label: "Overview & Objectives" },
            { id: "rules", label: "Eligibility & Rules" },
            { id: "faq", label: "Coordinators & FAQs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-cyan-600 text-cyan-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tab Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Event Description</h3>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {event.full_description}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Eligibility Criteria</h3>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                    {event.eligibility}
                  </div>
                </div>

                {event.prerequisites && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Prerequisites & Recommended Background</h3>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                      {event.prerequisites}
                    </div>
                  </div>
                )}

                {event.selection_criteria && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Selection & Evaluation Criteria</h3>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                      {event.selection_criteria}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Rules & Regulations</h3>
                  {rules.length === 0 ? (
                    <p className="text-xs text-slate-500">Standard conference code of conduct applies.</p>
                  ) : (
                    <ul className="space-y-2 text-xs text-slate-700">
                      {rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">Event Coordinators</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coordinators.map((coord, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center">
                            {coord.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{coord.name}</div>
                            <div className="text-slate-500 text-[11px]">{coord.role}</div>
                          </div>
                        </div>
                        <div className="pt-1 space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <a href={`mailto:${coord.email}`} className="text-cyan-700 hover:underline">
                              {coord.email}
                            </a>
                          </div>
                          {coord.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              <span>{coord.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">Frequently Asked Questions</h3>
                  {faq.length === 0 ? (
                    <p className="text-xs text-slate-500">No FAQs posted yet for this event.</p>
                  ) : (
                    <div className="space-y-3">
                      {faq.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="font-bold text-slate-900 flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                            <span>{item.question}</span>
                          </div>
                          <div className="text-slate-600 pl-6 leading-relaxed">{item.answer}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Related Announcements & Registration Box (1 col) */}
          <div className="space-y-6">
            {/* Related Announcements */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-600" />
                <span>Related Announcements</span>
              </h3>

              {relatedAnnouncements.length === 0 ? (
                <p className="text-xs text-slate-500">No specific updates posted for this event yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {relatedAnnouncements.map((ann) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {ann.priority}
                        </span>
                        <span className="text-slate-400 text-[10px]">{formatDate(ann.published_at)}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900">{ann.title}</h4>
                      <p className="text-slate-600 line-clamp-3">{ann.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Registration Disclaimer */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-xs text-blue-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-cyan-700" />
                <span>Centralized Microsoft Forms</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Registrations are received via Microsoft Forms and automatically matched to your student profile using Microsoft Power Automate webhooks.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-200/60">
                Need help? Contact <a href="mailto:aiconfluence@iitg.ac.in" className="text-cyan-700 underline">aiconfluence@iitg.ac.in</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      <RegisterModal
        event={event}
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        userRegistration={userRegistration}
      />
    </div>
  );
}
