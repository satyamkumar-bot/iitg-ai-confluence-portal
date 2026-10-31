import { dataStore } from "@/lib/db/store";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatDateTime } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export default async function AdminMonitoringPage() {
  const events = await dataStore.getEvents();
  const registrations = await dataStore.getRegistrations();
  const integrationLogs = await dataStore.getIntegrationLogs();

  // Compute event-wise breakdown
  const eventMetrics = events.map((event) => {
    const eventRegs = registrations.filter((r) => r.event_id === event.id);
    const eventLogs = integrationLogs.filter((l) => l.event_id === event.id);
    const lastSyncLog = eventLogs[0]; // sorted by created_at desc

    const confirmed = eventRegs.filter((r) => r.registration_status === "CONFIRMED").length;
    const awaiting = eventRegs.filter((r) => r.registration_status === "AWAITING_REVIEW").length;
    const waitlisted = eventRegs.filter((r) => r.registration_status === "WAITLISTED").length;
    const rejected = eventRegs.filter((r) => r.registration_status === "REJECTED").length;
    const unmatched = eventRegs.filter((r) => r.review_required || r.student_user_id === null).length;
    const failures = eventLogs.filter((l) => l.outcome === "FAILED").length;

    const now = new Date();
    const deadline = new Date(event.registration_close_at);
    const isPastDeadline = deadline <= now;
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      event,
      totalResponses: eventRegs.length,
      matched: eventRegs.length - unmatched,
      unmatched,
      confirmed,
      awaiting,
      waitlisted,
      rejected,
      failures,
      isPastDeadline,
      daysRemaining,
      lastSyncAt: lastSyncLog ? lastSyncLog.created_at : null,
      syncHealth: failures > 0 ? "WARNING" : eventRegs.length > 0 ? "HEALTHY" : "IDLE",
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
          Participation Monitoring
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Participation & Synchronization Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time metrics for every conference track: submitted responses, student identity match rates, and approval conversions.
        </p>
      </div>

      <DemoDataNotice />

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {eventMetrics.map((em) => {
          return (
            <div
              key={em.event.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded uppercase">
                    {em.event.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      em.syncHealth === "HEALTHY"
                        ? "bg-emerald-100 text-emerald-800"
                        : em.syncHealth === "WARNING"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {em.syncHealth}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                  {em.event.title}
                </h3>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {em.isPastDeadline
                      ? "Deadline Passed"
                      : `${em.daysRemaining} days remaining for registration`}
                  </span>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Responses</span>
                  <span className="font-extrabold text-slate-900 text-base">{em.totalResponses}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Confirmed</span>
                  <span className="font-extrabold text-emerald-700 text-base">{em.confirmed}</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <span className="text-[10px] text-amber-700 block uppercase font-semibold">Awaiting</span>
                  <span className="font-extrabold text-amber-700 text-base">{em.awaiting}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between text-[11px]">
                  <span>Matched Identity Rate:</span>
                  <strong className="text-slate-900">
                    {em.totalResponses > 0
                      ? `${Math.round((em.matched / em.totalResponses) * 100)}%`
                      : "N/A"}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Unmatched Responses:</span>
                  <strong className={em.unmatched > 0 ? "text-amber-600" : "text-slate-700"}>
                    {em.unmatched}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Last Sync Event:</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {em.lastSyncAt ? formatDateTime(em.lastSyncAt) : "No sync yet"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <Link
                  href={`/admin/registrations?eventId=${em.event.id}`}
                  className="font-semibold text-cyan-700 hover:underline"
                >
                  View Registrations &rarr;
                </Link>
                <Link
                  href={`/events/${em.event.slug}`}
                  target="_blank"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
