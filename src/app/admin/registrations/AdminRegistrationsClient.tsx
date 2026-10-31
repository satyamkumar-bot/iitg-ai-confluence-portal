"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Registration, EventItem, User, RegistrationStatus } from "@/types";
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit2,
  FileText,
  UserCheck,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatDate, formatDateTime, getRegistrationStatusBadge, getSyncStatusBadge } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export function AdminRegistrationsClient({
  initialRegistrations,
  events,
  users,
}: {
  initialRegistrations: Registration[];
  events: EventItem[];
  users: User[];
}) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNMATCHED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSyncStatus, setSelectedSyncStatus] = useState("ALL");

  // Modals state
  const [inspectReg, setInspectReg] = useState<Registration | null>(null);
  const [statusModalReg, setStatusModalReg] = useState<Registration | null>(null);
  const [newStatus, setNewStatus] = useState<RegistrationStatus>("CONFIRMED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Unmatched Assign state
  const [assignModalReg, setAssignModalReg] = useState<Registration | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(users[0]?.id || "");
  const [assigning, setAssigning] = useState(false);

  // Unmatched count
  const unmatchedCount = useMemo(() => {
    return registrations.filter((r) => r.review_required || r.student_user_id === null).length;
  }, [registrations]);

  // Filtered registrations
  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (activeTab === "UNMATCHED" && !r.review_required && r.student_user_id !== null) {
        return false;
      }

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.reference_number.toLowerCase().includes(q) ||
        r.respondent_email.toLowerCase().includes(q) ||
        (r.student_name && r.student_name.toLowerCase().includes(q)) ||
        (r.event_title && r.event_title.toLowerCase().includes(q));

      const matchesEvent = selectedEventId === "ALL" || r.event_id === selectedEventId;
      const matchesStatus = selectedStatus === "ALL" || r.registration_status === selectedStatus;
      const matchesSync = selectedSyncStatus === "ALL" || r.sync_status === selectedSyncStatus;

      return matchesSearch && matchesEvent && matchesStatus && matchesSync;
    });
  }, [registrations, activeTab, search, selectedEventId, selectedStatus, selectedSyncStatus]);

  // Handle status update
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalReg) return;

    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/registrations/${statusModalReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_status: newStatus,
          review_notes: reviewNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === statusModalReg.id ? data.registration : r))
        );
        setStatusModalReg(null);
        router.refresh();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("Error submitting status update");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle resolve unmatched registration
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalReg) return;

    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/registrations/${assignModalReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_STUDENT",
          studentUserId: selectedStudentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === assignModalReg.id ? data.registration : r))
        );
        setAssignModalReg(null);
        router.refresh();
      } else {
        alert(data.error || "Failed to assign student");
      }
    } catch {
      alert("Error resolving unmatched registration");
    } finally {
      setAssigning(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (selectedEventId !== "ALL") params.set("eventId", selectedEventId);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);

    window.open(`/api/admin/registrations/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
            Registration Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Centralized Conference Registrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consolidated responses from all event Microsoft Forms. Review applications, approve participants, and resolve unmatched identities.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Authorized CSV</span>
        </button>
      </div>

      <DemoDataNotice />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "ALL"
              ? "border-cyan-600 text-cyan-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>All Registrations</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {registrations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("UNMATCHED")}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "UNMATCHED"
              ? "border-amber-600 text-amber-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Unmatched Responses (Review Required)</span>
          {unmatchedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold animate-pulse">
              {unmatchedCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, email, or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 bg-slate-50/50"
            />
          </div>

          {/* Event Filter */}
          <div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Conference Events</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title.length > 32 ? evt.title.slice(0, 30) + "..." : evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="AWAITING_REVIEW">Awaiting Review</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consolidated Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-3">Student / Respondent</th>
                <th className="py-3 px-3">Event Title</th>
                <th className="py-3 px-3">Registration Status</th>
                <th className="py-3 px-3">Sync Status</th>
                <th className="py-3 px-3">Submission Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No registrations match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => {
                  const statusBadge = getRegistrationStatusBadge(reg.registration_status);
                  const syncBadge = getSyncStatusBadge(reg.sync_status);
                  const isUnresolved = !reg.student_user_id || reg.review_required;

                  return (
                    <tr
                      key={reg.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isUnresolved ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {reg.reference_number}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {reg.student_name ? (
                            reg.student_name
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Unmatched Student
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {reg.respondent_email}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px] truncate" title={reg.event_title}>
                        <div className="font-medium text-slate-800 truncate">{reg.event_title}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1 ${statusBadge.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${syncBadge.badgeClass}`}>
                          {syncBadge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {formatDateTime(reg.submitted_at)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setInspectReg(reg)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                          title="Inspect Responses"
                        >
                          View Answers
                        </button>

                        <button
                          onClick={() => {
                            setStatusModalReg(reg);
                            setNewStatus(reg.registration_status);
                            setReviewNotes(reg.review_notes || "");
                          }}
                          className="px-2.5 py-1 rounded bg-iitg-navy-900 hover:bg-cyan-700 text-white font-medium text-[11px] transition-colors"
                        >
                          Update Status
                        </button>

                        {isUnresolved && (
                          <button
                            onClick={() => {
                              setAssignModalReg(reg);
                              setSelectedStudentId(users[0]?.id || "");
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-medium text-[11px] transition-colors"
                          >
                            Resolve Student
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Inspect Registration Answers */}
      {inspectReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="text-xs font-mono font-bold text-cyan-700">
                  {inspectReg.reference_number}
                </div>
                <h3 className="text-base font-bold text-slate-900">{inspectReg.event_title}</h3>
              </div>
              <button
                onClick={() => setInspectReg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Respondent</span>
                  <div className="font-bold text-slate-900">{inspectReg.student_name || "Unmatched"}</div>
                  <div className="text-slate-500 text-[11px] font-mono">{inspectReg.respondent_email}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Source Response ID</span>
                  <div className="font-mono text-slate-800 break-all">{inspectReg.source_response_id || "N/A"}</div>
                </div>
              </div>

              {inspectReg.team_data && (
                <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl space-y-1">
                  <span className="text-cyan-900 font-bold uppercase text-[10px]">Team Details</span>
                  <div className="font-semibold text-slate-800">Team: {inspectReg.team_data.team_name}</div>
                  {inspectReg.team_data.members && (
                    <ul className="space-y-0.5 text-slate-600 pt-1">
                      {inspectReg.team_data.members.map((m, idx) => (
                        <li key={idx}>&bull; {m.name} ({m.email})</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Questionnaire Answers
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/40">
                  {Object.entries(inspectReg.response_data).map(([q, a], idx) => (
                    <div key={idx} className="p-3 space-y-1">
                      <div className="font-semibold text-slate-700">{q}</div>
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-900 font-mono text-[11px]">
                        {typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInspectReg(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Update Registration Status */}
      {statusModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleUpdateStatusSubmit}
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Update Registration Status</h3>
              <button
                type="button"
                onClick={() => setStatusModalReg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold text-[11px] block">Reference & Respondent:</span>
                <div className="font-bold text-slate-900 mt-0.5">
                  {statusModalReg.reference_number} &bull; {statusModalReg.respondent_email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">New Registration Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="AWAITING_REVIEW">Awaiting Review</option>
                  <option value="CONFIRMED">Confirmed (Officially Approved)</option>
                  <option value="WAITLISTED">Waitlisted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Organizer Review Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Lab seat assigned: Bench B-04. Please bring your student ID card."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-[11px] text-slate-500">
                  These instructions will be visible to the student on their registration details view.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalReg(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusUpdating}
                className="px-4 py-2 bg-iitg-navy-900 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {statusUpdating ? "Saving..." : "Update Status"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Assign / Match Unmatched Student */}
      {assignModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleAssignSubmit}
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Resolve & Match Student Identity</h3>
              <button
                type="button"
                onClick={() => setAssignModalReg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <strong>Unresolved Email:</strong> {assignModalReg.respondent_email}
                <div className="text-[11px] text-slate-600">
                  Select a registered student from the portal to link this submitted questionnaire response.
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Link to Student Account *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-cyan-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModalReg(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {assigning ? "Resolving..." : "Confirm & Link Account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
