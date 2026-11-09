import { dataStore } from "@/lib/db/store";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  FileText,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { formatDate, formatDateTime, getRegistrationStatusBadge } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const metrics = await dataStore.getAdminMetrics();
  const recentRegistrations = (await dataStore.getRegistrations()).slice(0, 5);
  const recentAudits = (await dataStore.getAuditLogs()).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
            Administration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time participation tracking, Microsoft Forms synchronization health, and submission approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/events/new"
            className="px-3.5 py-2 rounded-xl bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            + Create New Event
          </Link>
          <Link
            href="/admin/registrations"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            Review Registrations
          </Link>
        </div>
      </div>

      <DemoDataNotice />

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Events</span>
            <CalendarDays className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalEvents}</div>
          <div className="text-[11px] text-slate-500">
            {metrics.publishedEvents} published &bull; {metrics.draftEvents} draft
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Responses Received</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalResponses}</div>
          <div className="text-[11px] text-slate-500">
            {metrics.matchedRegistrations} matched to students
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Confirmed Participants</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{metrics.confirmedRegistrations}</div>
          <div className="text-[11px] text-slate-500">
            {metrics.awaitingReview} awaiting review
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Unmatched Responses</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{metrics.unmatchedResponses}</div>
          <div className="text-[11px] text-slate-500">
            Requires manual organizer match
          </div>
        </div>
      </div>

      {/* Visual Charts Component (Recharts) */}
      <DashboardCharts
        eventStats={metrics.eventStats}
        statusBreakdown={metrics.statusBreakdown}
      />

      {/* Two Columns: Recent Registrations & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Registrations Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Synchronized Registrations</h3>
              <p className="text-xs text-slate-500">Latest responses delivered from Microsoft Forms</p>
            </div>
            <Link
              href="/admin/registrations"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              <span>View All ({metrics.totalResponses})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Student / Respondent</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Sync Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRegistrations.map((reg) => {
                  const badge = getRegistrationStatusBadge(reg.registration_status);
                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {reg.reference_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">
                          {reg.student_name || "Unmatched Respondent"}
                        </div>
                        <div className="text-[11px] text-slate-500">{reg.respondent_email}</div>
                      </td>
                      <td className="py-3 px-3 max-w-[180px] truncate text-slate-700" title={reg.event_title}>
                        {reg.event_title}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {formatDate(reg.synchronized_at)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/admin/registrations"
                          className="text-cyan-700 font-semibold hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Administrative Audit Trail (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Admin Activity</h3>
              <p className="text-xs text-slate-500">Audit trail of organizer actions</p>
            </div>
            <Link href="/admin/audit-logs" className="text-xs text-cyan-700 hover:underline">
              All Logs
            </Link>
          </div>

          <div className="space-y-3">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] font-mono text-cyan-800 bg-cyan-100 px-1.5 py-0.5 rounded">
                    {audit.action}
                  </span>
                  <span className="text-slate-400 text-[10px]">{formatDate(audit.created_at)}</span>
                </div>
                <div className="text-slate-700 text-xs">
                  Actor: <strong className="text-slate-900">{audit.actor_email || "System"}</strong>
                </div>
                {audit.sanitized_metadata && (
                  <div className="text-[11px] text-slate-500 truncate">
                    {JSON.stringify(audit.sanitized_metadata)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
