"use client";

import { useState, useEffect, useMemo } from "react";
import { EventItem } from "@/types";
import { EventCard } from "@/components/events/EventCard";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";
import { Search, Filter, Calendar, Sparkles, Loader2 } from "lucide-react";

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, OPEN, CLOSING_SOON, CLOSED
  const [sortBy, setSortBy] = useState<"date" | "deadline" | "title">("date");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.category));
    return ["ALL", ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((evt) => {
        // Search query
        const q = search.toLowerCase().trim();
        const matchesSearch =
          !q ||
          evt.title.toLowerCase().includes(q) ||
          evt.short_description.toLowerCase().includes(q) ||
          evt.venue.toLowerCase().includes(q);

        // Category filter
        const matchesCategory =
          selectedCategory === "ALL" ||
          evt.category.toLowerCase() === selectedCategory.toLowerCase();

        // Status filter
        const deadline = new Date(evt.registration_close_at);
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        let matchesStatus = true;

        if (statusFilter === "OPEN") {
          matchesStatus = deadline > now;
        } else if (statusFilter === "CLOSING_SOON") {
          matchesStatus = deadline > now && diffHours <= 72;
        } else if (statusFilter === "CLOSED") {
          matchesStatus = deadline <= now;
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return (
            new Date(a.event_start_at || a.registration_open_at).getTime() -
            new Date(b.event_start_at || b.registration_open_at).getTime()
          );
        } else if (sortBy === "deadline") {
          return new Date(a.registration_close_at).getTime() - new Date(b.registration_close_at).getTime();
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [events, search, selectedCategory, statusFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          Conference Directory
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Conference Events
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Explore all official tracks, keynotes, workshops, and challenges for AI Confluence. Select an event to review eligibility and access the synchronized registration form.
        </p>
      </div>

      <DemoDataNotice />

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, description, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 bg-slate-50/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open for Registration</option>
              <option value="CLOSING_SOON">Closing Soon (≤ 72h)</option>
              <option value="CLOSED">Registration Closed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="date">Event Date (Earliest)</option>
              <option value="deadline">Registration Deadline</option>
              <option value="title">Event Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Track:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-iitg-navy-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading conference events from database...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Matching Events Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, status filter, or track category.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
}
