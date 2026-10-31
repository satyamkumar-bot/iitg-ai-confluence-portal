import { dataStore } from "@/lib/db/store";
import { Bell, Sparkles, ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export const revalidate = 60; // Cache on edge/CDN for 60 seconds

export default async function AnnouncementsPage() {
  const announcements = await dataStore.getAnnouncements({ activeOnly: true });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-cyan-600" />
          Official Broadcasts
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Conference Announcements & Circulars
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Centralized notifications for schedule changes, problem statements, deadline extensions, and review decisions without searching through multiple email threads.
        </p>
      </div>

      <DemoDataNotice />

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            No active announcements posted at this time.
          </div>
        ) : (
          announcements.map((ann) => {
            const isUrgent = ann.priority === "URGENT";
            const isImportant = ann.priority === "IMPORTANT";

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 transition-all ${
                  isUrgent
                    ? "border-rose-300 ring-1 ring-rose-200"
                    : isImportant
                    ? "border-amber-300 ring-1 ring-amber-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isUrgent
                          ? "bg-rose-100 text-rose-800"
                          : isImportant
                          ? "bg-amber-100 text-amber-800"
                          : "bg-cyan-100 text-cyan-800"
                      }`}
                    >
                      {ann.priority}
                    </span>
                    {ann.event_title && (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {ann.event_title}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Published: {formatDate(ann.published_at)}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {ann.body}
                </p>

                {ann.external_link && (
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={ann.external_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                    >
                      <span>Related Resource / Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
