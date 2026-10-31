"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Announcement, EventItem, AnnouncementPriority } from "@/types";
import {
  BellRing,
  Plus,
  Send,
  Calendar,
  AlertTriangle,
  ExternalLink,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export function AdminAnnouncementsClient({
  initialAnnouncements,
  events,
}: {
  initialAnnouncements: Announcement[];
  events: EventItem[];
}) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [eventId, setEventId] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("NORMAL");
  const [externalLink, setExternalLink] = useState("");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      title,
      body,
      event_id: eventId || null,
      priority,
      external_link: externalLink || null,
      published_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish announcement");
      }

      setAnnouncements([data.announcement, ...announcements]);
      setIsCreateOpen(false);
      setTitle("");
      setBody("");
      setEventId("");
      setExternalLink("");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error creating announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
            Announcements & Circulars
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Broadcast Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish official updates globally or targeted to specific conference events.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Announcement</span>
        </button>
      </div>

      <DemoDataNotice />

      {/* Announcements List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {announcements.map((ann) => {
          const isUrgent = ann.priority === "URGENT";
          const isImportant = ann.priority === "IMPORTANT";

          return (
            <div key={ann.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isUrgent
                        ? "bg-rose-100 text-rose-800"
                        : isImportant
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {ann.priority}
                  </span>
                  {ann.event_title ? (
                    <span className="text-xs font-semibold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                      Event: {ann.event_title}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Global Broadcast
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  Published: {formatDate(ann.published_at)}
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>

              {ann.external_link && (
                <div className="pt-1">
                  <a
                    href={ann.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-700 hover:underline"
                  >
                    <span>Attached Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Publish Announcement Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Publish Conference Announcement</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inventathon Shortlisted Teams Announcement"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Event (Optional)</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Global (All Conference Participants)</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent (Highlighted Alert)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Announcement Message *</label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type circular text or schedule update..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">External Document or Drive Link</label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-iitg-navy-900 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Publishing..." : "Broadcast Announcement"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
