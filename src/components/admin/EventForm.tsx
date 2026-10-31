"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventItem } from "@/types";
import {
  Save,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

interface EventFormProps {
  initialEvent?: EventItem;
  isEdit?: boolean;
}

export function EventForm({ initialEvent, isEdit = false }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [slug, setSlug] = useState(initialEvent?.slug || "");
  const [category, setCategory] = useState(initialEvent?.category || "Hackathon");
  const [shortDescription, setShortDescription] = useState(initialEvent?.short_description || "");
  const [fullDescription, setFullDescription] = useState(initialEvent?.full_description || "");
  const [bannerUrl, setBannerUrl] = useState(initialEvent?.banner_url || "");
  const [eventStartAt, setEventStartAt] = useState(
    initialEvent?.event_start_at ? new Date(initialEvent.event_start_at).toISOString().slice(0, 16) : "2026-11-14T09:00"
  );
  const [eventEndAt, setEventEndAt] = useState(
    initialEvent?.event_end_at ? new Date(initialEvent.event_end_at).toISOString().slice(0, 16) : "2026-11-15T21:00"
  );
  const [timezone, setTimezone] = useState(initialEvent?.timezone || "Asia/Kolkata");
  const [venue, setVenue] = useState(initialEvent?.venue || "Auditorium, IIT Guwahati");
  const [participationMode, setParticipationMode] = useState<any>(initialEvent?.participation_mode || "IN_PERSON");
  const [regOpenAt, setRegOpenAt] = useState(
    initialEvent?.registration_open_at ? new Date(initialEvent.registration_open_at).toISOString().slice(0, 16) : "2026-10-01T00:00"
  );
  const [regCloseAt, setRegCloseAt] = useState(
    initialEvent?.registration_close_at ? new Date(initialEvent.registration_close_at).toISOString().slice(0, 16) : "2026-11-08T23:59"
  );
  const [eligibility, setEligibility] = useState(initialEvent?.eligibility || "Open to all enrolled university students.");
  const [participationType, setParticipationType] = useState<any>(initialEvent?.participation_type || "INDIVIDUAL");
  const [minTeam, setMinTeam] = useState(initialEvent?.minimum_team_size || 1);
  const [maxTeam, setMaxTeam] = useState(initialEvent?.maximum_team_size || 1);
  const [prerequisites, setPrerequisites] = useState(initialEvent?.prerequisites || "");
  const [selectionCriteria, setSelectionCriteria] = useState(initialEvent?.selection_criteria || "");
  const [certificateInfo, setCertificateInfo] = useState(initialEvent?.certificate_information || "Certificate of Participation.");
  const [msFormsUrl, setMsFormsUrl] = useState(initialEvent?.microsoft_forms_url || "");
  const [publicationStatus, setPublicationStatus] = useState<any>(initialEvent?.publication_status || "DRAFT");

  // Dynamic lists
  const [rules, setRules] = useState<string[]>(initialEvent?.rules || ["All submissions must adhere to academic integrity guidelines."]);
  const [agenda, setAgenda] = useState(initialEvent?.agenda || [{ time: "09:00 AM", title: "Inauguration" }]);
  const [prizes, setPrizes] = useState(initialEvent?.prizes || [{ position: "1st Place", prize: "INR 50,000" }]);
  const [coordinators, setCoordinators] = useState(
    initialEvent?.coordinator_information || [{ name: "Coordinator Name", role: "Lead", email: "coord@iitg.ac.in", phone: "+91-0000000000" }]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      title,
      slug,
      category,
      short_description: shortDescription,
      full_description: fullDescription,
      banner_url: bannerUrl || undefined,
      event_start_at: new Date(eventStartAt).toISOString(),
      event_end_at: new Date(eventEndAt).toISOString(),
      timezone,
      venue,
      participation_mode: participationMode,
      registration_open_at: new Date(regOpenAt).toISOString(),
      registration_close_at: new Date(regCloseAt).toISOString(),
      eligibility,
      participation_type: participationType,
      minimum_team_size: Number(minTeam),
      maximum_team_size: Number(maxTeam),
      rules,
      agenda,
      prerequisites: prerequisites || null,
      selection_criteria: selectionCriteria || null,
      prizes,
      certificate_information: certificateInfo || null,
      coordinator_information: coordinators,
      faq: initialEvent?.faq || [],
      microsoft_forms_url: msFormsUrl || null,
      publication_status: publicationStatus,
    };

    try {
      const url = isEdit ? `/api/admin/events/${initialEvent!.id}` : "/api/admin/events";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save event");
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Event Management</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit Conference Event" : "Create New Conference Event"}
          </h1>
          <p className="text-xs text-slate-500">
            Configure event guidelines, schedule, registration deadlines, and Microsoft Forms links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/events")}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-iitg-navy-900 hover:bg-cyan-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : isEdit ? "Update Event" : "Save Event"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Warning if no Microsoft Forms link is provided */}
      {!msFormsUrl && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Missing Microsoft Forms Link:</strong> You can save or draft this event, but students will not be able to register until you provide a verified Microsoft Forms URL.
          </div>
        </div>
      )}

      {/* Basic Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          General Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Inventathon 2026 — 36-Hour AI Hackathon"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="inventathon-2026"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Track / Category *</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Hackathon, Keynote Talk, Research Colloquium..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Short Description (for cards) *</label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Concise 1-2 sentence overview shown in event directory cards..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Full Description *</label>
            <textarea
              required
              rows={5}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Comprehensive event details, objectives, background..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Dates, Venue & Registration Window */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Schedule & Registration Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Event Start Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={eventStartAt}
              onChange={(e) => setEventStartAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Event End Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={eventEndAt}
              onChange={(e) => setEventEndAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Registration Opens At *</label>
            <input
              type="datetime-local"
              required
              value={regOpenAt}
              onChange={(e) => setRegOpenAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Registration Closes At (Deadline) *</label>
            <input
              type="datetime-local"
              required
              value={regCloseAt}
              onChange={(e) => setRegCloseAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Venue *</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Dr. Bhupen Hazarika Auditorium, IIT Guwahati"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Participation Mode</label>
            <select
              value={participationMode}
              onChange={(e) => setParticipationMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="IN_PERSON">In-Person Only</option>
              <option value="HYBRID">Hybrid (In-Person + Online)</option>
              <option value="ONLINE">Online Virtual Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participation Rules & Microsoft Forms Link */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Microsoft Forms Link & Participation Mode
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-3 space-y-1">
            <label className="font-semibold text-slate-700">Microsoft Forms Registration URL</label>
            <input
              type="url"
              value={msFormsUrl}
              onChange={(e) => setMsFormsUrl(e.target.value)}
              placeholder="https://forms.office.com/pages/responsepage.aspx?id=..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              Students will submit their response here. Power Automate synchronizes the response back to our portal.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Format</label>
            <select
              value={participationType}
              onChange={(e) => setParticipationType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="INDIVIDUAL">Individual</option>
              <option value="TEAM">Team Participation</option>
              <option value="EITHER">Individual or Team</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Min Team Size</label>
            <input
              type="number"
              min={1}
              value={minTeam}
              onChange={(e) => setMinTeam(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Max Team Size</label>
            <input
              type="number"
              min={1}
              value={maxTeam}
              onChange={(e) => setMaxTeam(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="font-semibold text-slate-700">Eligibility Criteria *</label>
            <textarea
              required
              rows={2}
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="Who is eligible? (UG/PG/PhD students, branches, institutions)..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="font-semibold text-slate-700">Publication Status</label>
            <select
              value={publicationStatus}
              onChange={(e) => setPublicationStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-cyan-500 bg-slate-50"
            >
              <option value="DRAFT">DRAFT (Hidden from Students)</option>
              <option value="PUBLISHED">PUBLISHED (Visible in Student Directory)</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-iitg-navy-900 hover:bg-cyan-700 rounded-lg shadow-md transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving..." : isEdit ? "Update Event" : "Create & Save Event"}</span>
        </button>
      </div>
    </form>
  );
}
