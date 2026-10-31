import { getCurrentUser } from "@/lib/auth/session";
import { dataStore } from "@/lib/db/store";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  ExternalLink,
  Info,
} from "lucide-react";
import { formatDateTime, getRegistrationStatusBadge, getSyncStatusBadge } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";

export default async function RegistrationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const registration = await dataStore.getRegistrationById(params.id);
  if (!registration) {
    notFound();
  }

  // Strict ownership check: Student can only view their own registration!
  const isOwner = registration.student_user_id === user.id;
  const isOrganizer = user.role === "ORGANIZER";

  if (!isOwner && !isOrganizer) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-md">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Access Forbidden</h1>
        <p className="text-xs text-slate-600">
          You are not authorized to view another student&apos;s private registration records.
        </p>
        <Link
          href="/registrations"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-iitg-navy-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to My Registrations
        </Link>
      </div>
    );
  }

  const event = await dataStore.getEventById(registration.event_id);
  const statusBadge = getRegistrationStatusBadge(registration.registration_status);
  const syncBadge = getSyncStatusBadge(registration.sync_status);

  // Status explanation
  const getStatusExplanation = () => {
    switch (registration.registration_status) {
      case "CONFIRMED":
        return "Your registration has been reviewed and officially approved by the conference organizers. You are confirmed to participate.";
      case "AWAITING_REVIEW":
        return "Your form responses have been successfully received and synchronized. The event committee is currently evaluating submissions.";
      case "WAITLISTED":
        return "You have been placed on the active waitlist. Should shortlisted slots become available, you will be notified via institutional email.";
      case "REJECTED":
        return "Unfortunately, your registration could not be accepted for this edition based on track eligibility criteria or quota constraints.";
      case "CANCELLED":
        return "This registration was cancelled upon request or by the administration.";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/registrations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Registrations</span>
        </Link>
        {isOrganizer && (
          <span className="text-[11px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Viewing As Organizer
          </span>
        )}
      </div>

      <DemoDataNotice />

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
              Registration Reference: {registration.reference_number}
            </div>
            <h1 className="text-xl font-bold text-white">{registration.event_title}</h1>
            <div className="text-xs text-slate-300">
              Respondent: {registration.student_name || "Student"} ({registration.respondent_email})
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.badgeClass}`}>
              {statusBadge.label}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${syncBadge.badgeClass}`}>
              {syncBadge.label}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Status Explanation Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-600" />
              <span>Current Status Meaning</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {getStatusExplanation()}
            </p>
          </div>

          {/* Organizer Notes */}
          {registration.review_notes && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Organizer Instructions / Review Feedback</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {registration.review_notes}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Submission Timestamp</span>
              <div className="font-bold text-slate-800">{formatDateTime(registration.submitted_at)}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Backend Synchronization</span>
              <div className="font-bold text-slate-800">{formatDateTime(registration.synchronized_at)}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Source Form Response ID</span>
              <div className="font-mono text-slate-700 truncate">{registration.source_response_id || "N/A"}</div>
            </div>
          </div>

          {/* Team Info (if present) */}
          {registration.team_data && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Team Information</span>
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                {registration.team_data.team_name && (
                  <div>
                    <span className="text-slate-500">Team Name: </span>
                    <strong className="text-slate-900">{registration.team_data.team_name}</strong>
                  </div>
                )}
                {registration.team_data.members && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-500 block font-semibold">Registered Team Members:</span>
                    <ul className="space-y-1">
                      {registration.team_data.members.map((m, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                          <span>
                            <strong>{m.name}</strong> ({m.email}) {m.roll_number && `- Roll: ${m.roll_number}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submitted Form Answers */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Submitted Questionnaire Responses</span>
            </h3>

            {Object.keys(registration.response_data).length === 0 ? (
              <p className="text-xs text-slate-500">No custom question responses recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {Object.entries(registration.response_data).map(([key, value], idx) => (
                  <div key={idx} className="p-3.5 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="font-semibold text-slate-700 sm:w-1/3">{key}</div>
                    <div className="text-slate-900 sm:w-2/3 break-words font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            {event ? (
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-1.5 text-cyan-700 font-semibold hover:underline"
              >
                <span>View Full Event Guidelines & Agenda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Synchronized via Microsoft Power Automate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
