"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  Activity,
  Workflow,
  BellRing,
  ScrollText,
  ExternalLink,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/admin/events", label: "Event Management", icon: CalendarDays },
    { href: "/admin/registrations", label: "Centralized Registrations", icon: UserCheck },
    { href: "/admin/monitoring", label: "Participation Monitor", icon: Activity },
    { href: "/admin/integrations", label: "MS Forms & Power Automate", icon: Workflow },
    { href: "/admin/announcements", label: "Announcements", icon: BellRing },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
          Organizer Portal
        </div>
        <div className="text-sm font-semibold text-white">AI Confluence Admin</div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border-l-4 border-cyan-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <Link
          href="/events"
          target="_blank"
          className="flex items-center justify-between p-2 rounded hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <span>Preview Student View</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
