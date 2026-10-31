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
  Clock,
  Sparkles,
  Upload,
  Image as ImageIcon,
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
  const [timezone, setTimezone] = useState(initialEvent?.timezone || "Asia/Kolkata");
  const [venue, setVenue] = useState(initialEvent?.venue || "Auditorium, IIT Guwahati");
  const [participationMode, setParticipationMode] = useState<any>(initialEvent?.participation_mode || "IN_PERSON");
  const [regOpenAt, setRegOpenAt] = useState(
    initialEvent?.registration_open_at
      ? new Date(initialEvent.registration_open_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [regCloseAt, setRegCloseAt] = useState(
    initialEvent?.registration_close_at
      ? new Date(initialEvent.registration_close_at).toISOString().slice(0, 16)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [eligibility, setEligibility] = useState(initialEvent?.eligibility || "Open to all enrolled university students.");
  const [participationType, setParticipationType] = useState<any>(initialEvent?.participation_type || "INDIVIDUAL");
  const [prerequisites, setPrerequisites] = useState(initialEvent?.prerequisites || "");
  const [selectionCriteria, setSelectionCriteria] = useState(initialEvent?.selection_criteria || "");
  const [certificateInfo, setCertificateInfo] = useState(initialEvent?.certificate_information || "Certificate of Participation.");
  const [msFormsUrl, setMsFormsUrl] = useState(initialEvent?.microsoft_forms_url || "");
  const [publicationStatus, setPublicationStatus] = useState<any>(initialEvent?.publication_status || "PUBLISHED");

  // Dynamic lists
  const [rules, setRules] = useState<string[]>(initialEvent?.rules || ["All submissions must adhere to academic integrity guidelines."]);
  const [agenda, setAgenda] = useState(initialEvent?.agenda || [{ time: "09:00 AM", title: "Inauguration" }]);
  const [prizes, setPrizes] = useState(initialEvent?.prizes || [{ position: "1st Place", prize: "INR 50,000" }]);
  const [coordinators, setCoordinators] = useState(
    initialEvent?.coordinator_information || [{ name: "Satyam Kumar", role: "Lead Organizer", email: "k.satyam@op.iitg.ac.in", phone: "+91-9876543210" }]
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

  const resizeImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 630;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          resolve(compressed);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 15MB. Please choose a smaller image.");
      return;
    }

    try {
      setErrorMsg(null);
      const optimized = await resizeImageToDataUrl(file);
      setBannerUrl(optimized);
    } catch {
      setErrorMsg("Failed to process image. Please try another image file.");
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
      event_start_at: new Date(regOpenAt).toISOString(),
      event_end_at: new Date(regCloseAt).toISOString(),
      timezone,
      venue,
      participation_mode: participationMode,
      registration_open_at: new Date(regOpenAt).toISOString(),
      registration_close_at: new Date(regCloseAt).toISOString(),
      eligibility,
      participation_type: participationType,
      minimum_team_size: 1,
      maximum_team_size: 1,
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

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Payload or banner image exceeds maximum allowed size. Please upload a smaller image.");
        }
        let serverError = `Error (${res.status})`;
        try {
          const errData = await res.json();
          serverError = errData.error || serverError;
        } catch {
          const text = await res.text();
          if (text) serverError = text.slice(0, 120);
        }
        throw new Error(serverError);
      }

      const data = await res.json();
      if (!data.success) {
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

          {/* Banner Upload (Replacing image URL) */}
          <div className="sm:col-span-2 space-y-2">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-600" />
              <span>Event Banner Image Upload</span>
            </label>
            {bannerUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900 max-h-56">
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="w-full h-48 object-cover opacity-90 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Banner</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-cyan-50/40 transition-colors block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Click to upload banner image</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
              </label>
            )}
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

      {/* Registration Timeline & Venue */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Registration Timeline & Venue
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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

      {/* Microsoft Forms Link & Eligibility */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Microsoft Forms Link & Eligibility
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Microsoft Forms Registration URL</label>
            <input
              type="url"
              value={msFormsUrl}
              onChange={(e) => setMsFormsUrl(e.target.value)}
              placeholder="https://forms.office.com/pages/responsepage.aspx?id=..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-500">
              Students submit their responses in this Microsoft Form. Responses synchronize automatically to their accounts.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Participation Format</label>
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
            <label className="font-semibold text-slate-700">Publication Status</label>
            <select
              value={publicationStatus}
              onChange={(e) => setPublicationStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-cyan-500 bg-slate-50"
            >
              <option value="DRAFT">Draft (Organizers Only)</option>
              <option value="PUBLISHED">Published (Visible to All Students)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
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
        </div>
      </div>

      {/* Rules */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">Event Rules & Guidelines</h3>
          <button
            type="button"
            onClick={() => setRules([...rules, ""])}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
              <input
                type="text"
                value={rule}
                onChange={(e) => {
                  const copy = [...rules];
                  copy[idx] = e.target.value;
                  setRules(copy);
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coordinators */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">Student & Faculty Coordinators</h3>
          <button
            type="button"
            onClick={() =>
              setCoordinators([
                ...coordinators,
                { name: "", role: "Coordinator", email: "", phone: "" },
              ])
            }
            className="flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Coordinator</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {coordinators.map((c, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 relative">
              <input
                type="text"
                placeholder="Name"
                value={c.name}
                onChange={(e) => {
                  const copy = [...coordinators];
                  copy[idx].name = e.target.value;
                  setCoordinators(copy);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Role (e.g. Lead Coordinator)"
                value={c.role}
                onChange={(e) => {
                  const copy = [...coordinators];
                  copy[idx].role = e.target.value;
                  setCoordinators(copy);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              />
              <input
                type="email"
                placeholder="Email (@iitg.ac.in)"
                value={c.email}
                onChange={(e) => {
                  const copy = [...coordinators];
                  copy[idx].email = e.target.value;
                  setCoordinators(copy);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Phone"
                  value={c.phone || ""}
                  onChange={(e) => {
                    const copy = [...coordinators];
                    copy[idx].phone = e.target.value;
                    setCoordinators(copy);
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={() => setCoordinators(coordinators.filter((_, i) => i !== idx))}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
