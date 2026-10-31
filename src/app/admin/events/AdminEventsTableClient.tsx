"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventItem } from "@/types";
import {
  Search,
  Filter,
  Edit3,
  ExternalLink,
  Archive,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function AdminEventsTableClient({
  initialEvents,
}: {
  initialEvents: EventItem[];
}) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || e.publication_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTogglePublish = async (event: EventItem) => {
    const nextStatus = event.publication_status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const confirmMsg =
      nextStatus === "PUBLISHED"
        ? `Are you sure you want to publish "${event.title}" to the student directory?`
        : `Are you sure you want to revert "${event.title}" to Draft? (It will be hidden from students)`;

    if (!confirm(confirmMsg)) return;

    setLoadingId(event.id);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publication_status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((item) => (item.id === event.id ? { ...item, publication_status: nextStatus } : item))
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Error updating status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleArchive = async (event: EventItem) => {
    if (!confirm(`Are you sure you want to archive "${event.title}"? This will soft-delete the event.`)) {
      return;
    }

    setLoadingId(event.id);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((item) => item.id !== event.id));
        router.refresh();
      } else {
        alert(data.error || "Failed to archive event");
      }
    } catch {
      alert("Error archiving event");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Publication States</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft Only</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Event Title & Track</th>
              <th className="py-3 px-3">Start Date</th>
              <th className="py-3 px-3">Deadline</th>
              <th className="py-3 px-3">Publication</th>
              <th className="py-3 px-3">MS Forms Link</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No conference events match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((evt) => {
                const isPublished = evt.publication_status === "PUBLISHED";
                const hasForm = Boolean(evt.microsoft_forms_url);

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{evt.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-100 px-1.5 py-0.5 rounded">
                          {evt.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">/{evt.slug}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(evt.event_start_at || evt.registration_open_at)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(evt.registration_close_at)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {evt.publication_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[140px] truncate">
                      {hasForm ? (
                        <a
                          href={evt.microsoft_forms_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-700 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Configured</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Not Linked</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/events/${evt.slug}`}
                        target="_blank"
                        className="p-1 text-slate-500 hover:text-cyan-700 inline-block"
                        title="Preview Student View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/events/${evt.id}/edit`}
                        className="p-1 text-slate-500 hover:text-slate-900 inline-block"
                        title="Edit Event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleTogglePublish(evt)}
                        disabled={loadingId === evt.id}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                          isPublished
                            ? "border-amber-300 text-amber-800 hover:bg-amber-50"
                            : "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        {isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleArchive(evt)}
                        disabled={loadingId === evt.id}
                        className="p-1 text-rose-500 hover:text-rose-700 inline-block"
                        title="Archive Event"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
