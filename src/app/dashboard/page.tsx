import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";
import { formatDate, getRegistrationStatusBadge, getSyncStatusBadge } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch real database records for this student
  const studentMetrics = await dataStore.getStudentMetrics(user.id);
  const myRegistrations = await dataStore.getRegistrations({ studentUserId: user.id });
  const publishedEvents = await dataStore.getEvents({ onlyPublished: true });
  const announcements = await dataStore.getAnnouncements({ activeOnly: true });

  const recentPublishedEvents = publishedEvents.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-iitg-navy-950 via-iitg-navy-900 to-iitg-navy-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              {user.email} &bull; {user.department || "Mehta Family School of Data Science & AI"}
              {user.roll_number && ` &bull; Roll: ${user.roll_number}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/events"
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Events</span>
            </Link>
            <Link
              href="/registrations"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>My Registrations ({myRegistrations.length})</span>
            </Link>
          </div>
        </div>
      </div>

      <DemoDataNotice />

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Events
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {studentMetrics.totalAvailableEvents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Open for registration across tracks</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Registrations
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {studentMetrics.totalRegistrations}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {studentMetrics.confirmedCount} confirmed &bull; {studentMetrics.awaitingReviewCount} awaiting review
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Confirmed Participation
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {studentMetrics.confirmedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Organizer approved</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deadlines Soon
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {studentMetrics.approachingDeadlines}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Closing within 4 days</div>
        </div>
      </div>

      {/* Main Grid: My Registrations & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Registered Events (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-cyan-600" />
              <span>My Event Registrations</span>
            </h2>
            <Link
              href="/registrations"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">No Registrations Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven&apos;t registered for any conference events yet. Explore upcoming hackathons, talks, and colloquiums.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <span>Browse All Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
              {myRegistrations.map((reg) => {
                const statusBadge = getRegistrationStatusBadge(reg.registration_status);
                const syncBadge = getSyncStatusBadge(reg.sync_status);
                return (
                  <div key={reg.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-700">
                          {reg.reference_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.badgeClass}`}>
                          {statusBadge.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${syncBadge.badgeClass}`}>
                          {syncBadge.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{reg.event_title}</h4>
                      <div className="text-xs text-slate-500">
                        Submitted: {formatDate(reg.submitted_at)} &bull; Synced: {formatDate(reg.synchronized_at)}
                      </div>
                    </div>

                    <Link
                      href={`/registrations/${reg.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors shrink-0 self-start sm:self-center"
                    >
                      <span>View Response</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Synchronization Note:</strong> When you complete an event registration in Microsoft Forms, our secure backend receives the response through Power Automate. Status changes to <em>Confirmed</em> or <em>Waitlisted</em> are updated by the event coordinators after review.
            </div>
          </div>
        </div>

        {/* Right Column: Announcements & Recently Published (1 col) */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Recent Announcements</h3>
              <Link href="/announcements" className="text-xs text-cyan-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {ann.priority}
                    </span>
                    <span className="text-slate-400 text-[10px]">{formatDate(ann.published_at)}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">{ann.title}</h4>
                  <p className="text-slate-500 line-clamp-2 leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Published Events */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Upcoming Events</h3>
              <Link href="/events" className="text-xs text-cyan-700 hover:underline">
                Explore All
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentPublishedEvents.map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.slug}`}
                  className="block p-3.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-400 text-xs space-y-1 shadow-xs transition-colors group"
                >
                  <div className="text-[10px] font-semibold text-cyan-700 uppercase">
                    {evt.category}
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="text-slate-500 text-[11px]">
                    Date: {formatDate(evt.event_start_at)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
