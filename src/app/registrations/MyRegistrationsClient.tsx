"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Info,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Registration, RegistrationStatus } from "@/types";
import { formatDate, formatDateTime, getRegistrationStatusBadge, getSyncStatusBadge } from "@/lib/utils";

export function MyRegistrationsClient({
  initialRegistrations,
}: {
  initialRegistrations: Registration[];
}) {
  const [registrations] = useState<Registration[]>(initialRegistrations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [syncFilter, setSyncFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.reference_number.toLowerCase().includes(q) ||
        (r.event_title && r.event_title.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || r.registration_status === statusFilter;
      const matchesSync = syncFilter === "ALL" || r.sync_status === syncFilter;

      return matchesSearch && matchesStatus && matchesSync;
    });
  }, [registrations, search, statusFilter, syncFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
          <ClipboardList className="w-3.5 h-3.5 text-cyan-600" />
          Centralized Participation
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Event Registrations
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Track all your submissions across AI Confluence tracks. Form responses received via Microsoft Power Automate are automatically linked to your authenticated student identity.
        </p>
      </div>

      {/* Synchronization Explanation Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-3">
        <RefreshCw className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-emerald-900">Direct Registration Confirmation</div>
          <div className="text-slate-600 leading-relaxed">
            Submissions via Microsoft Forms are automatically ingested, directly <strong>Confirmed</strong>, and instantly linked to your account.
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by registration reference number or event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="AWAITING_REVIEW">Awaiting Review</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sync:</span>
          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Sync States</option>
            <option value="SUCCESS">Synchronized</option>
            <option value="PENDING">Pending Sync</option>
            <option value="FAILED">Sync Failed</option>
          </select>
        </div>
      </div>

      {/* Registrations List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Registrations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== "ALL" || syncFilter !== "ALL"
              ? "No registration records match your filter criteria."
              : "You have not submitted registrations for any conference tracks yet."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Browse All Conference Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reg) => {
            const statusBadge = getRegistrationStatusBadge(reg.registration_status);
            const syncBadge = getSyncStatusBadge(reg.sync_status);

            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      {reg.reference_number}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${statusBadge.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                      {statusBadge.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${syncBadge.badgeClass}`}>
                      {syncBadge.label}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Submitted: {formatDateTime(reg.submitted_at)}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">{reg.event_title}</h3>
                    <p className="text-xs text-slate-500">
                      Registered Student: <strong className="text-slate-700">{reg.student_name || "You"}</strong> ({reg.respondent_email})
                    </p>
                    {reg.review_notes && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 mt-2">
                        <span className="font-semibold text-slate-900">Organizer Note: </span>
                        {reg.review_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {reg.event_slug && (
                      <Link
                        href={`/events/${reg.event_slug}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Event Details
                      </Link>
                    )}
                    <Link
                      href={`/registrations/${reg.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>View Full Response</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
