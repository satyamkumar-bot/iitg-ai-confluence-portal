import { dataStore } from "@/lib/db/store";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  ExternalLink,
  Edit3,
  Archive,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DemoDataNotice } from "@/components/common/DemoDataNotice";
import { AdminEventsTableClient } from "./AdminEventsTableClient";

export default async function AdminEventsPage() {
  const events = await dataStore.getEvents({ onlyPublished: false });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-cyan-700">
            Event Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Conference Events & Forms
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, publish, or archive conference events and configure Microsoft Forms registration questionnaires.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      <DemoDataNotice />

      <AdminEventsTableClient initialEvents={events} />
    </div>
  );
}
