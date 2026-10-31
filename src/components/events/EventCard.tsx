import Link from "next/link";
import { Calendar, MapPin, Users, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { EventItem } from "@/types";
import { formatDate } from "@/lib/utils";

export function EventCard({ event }: { event: EventItem }) {
  const now = new Date();
  const deadline = new Date(event.registration_close_at);
  const isClosed = deadline <= now;
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isClosingSoon = !isClosed && diffHours <= 72; // within 3 days

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
      {/* Event Banner */}
      <div className="h-44 bg-slate-800 relative overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-iitg-navy-900 via-iitg-navy-800 to-cyan-900 flex items-center justify-center p-6 text-center text-slate-300">
            <span className="font-semibold text-sm">{event.title}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-900 shadow-sm backdrop-blur-xs">
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {isClosed ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-600 text-white shadow-sm">
              Registration Closed
            </span>
          ) : isClosingSoon ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Closing Soon
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-sm">
              Open for Registration
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            {event.short_description}
          </p>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>{formatDate(event.event_start_at || event.registration_open_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>
                {event.participation_type === "TEAM"
                  ? `Team (${event.minimum_team_size} - ${event.maximum_team_size} members)`
                  : event.participation_type === "INDIVIDUAL"
                  ? "Individual Participation"
                  : "Individual or Team"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Deadline: {formatDate(event.registration_close_at)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Mode: {event.participation_mode.replace("_", " ")}
          </span>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-iitg-navy-900 hover:bg-cyan-700 text-white text-xs font-medium transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
