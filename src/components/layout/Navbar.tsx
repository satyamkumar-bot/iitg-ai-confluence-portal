"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  Calendar,
  ClipboardList,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (session?.user as any)?.role;
  const isOrganizer = role === "ORGANIZER";

  const navLinks = [
    { href: "/events", label: "Browse Events", icon: Calendar },
    { href: "/announcements", label: "Announcements", icon: Bell },
    ...(session
      ? [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/registrations", label: "My Registrations", icon: ClipboardList },
        ]
      : []),
    ...(isOrganizer
      ? [
          {
            href: "/admin",
            label: "Organizer Portal",
            icon: ShieldCheck,
            highlight: true,
          },
        ]
      : []),
  ];

  return (
    <header className="bg-iitg-navy-900 border-b border-iitg-navy-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-iitg-cyan-500 to-iitg-navy-700 flex items-center justify-center text-white shadow-inner border border-iitg-cyan-400/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold leading-tight">
                IIT GUWAHATI &bull; MFSDSAI
              </div>
              <div className="text-base font-bold tracking-tight text-white leading-tight">
                AI Confluence <span className="text-cyan-400 text-sm font-normal">Portal</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    link.highlight
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                      : isActive
                      ? "bg-iitg-navy-800 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-iitg-navy-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white leading-none">
                    {session.user.name}
                  </div>
                  <div className="text-[10px] text-cyan-300 font-medium uppercase mt-0.5">
                    {isOrganizer ? "Organizer / Admin" : "Student"}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center font-bold text-xs text-cyan-200">
                  {session.user.name?.charAt(0) || "U"}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-iitg-navy-800 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-iitg-cyan-600 hover:bg-iitg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                Microsoft Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-iitg-navy-800 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-iitg-navy-800 bg-iitg-navy-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-iitg-navy-800 text-white" : "text-slate-300 hover:bg-iitg-navy-850"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-iitg-navy-800">
            {session?.user ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-white">{session.user.name}</div>
                  <div className="text-xs text-cyan-400 uppercase font-semibold">
                    {(session.user as any).role}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-1.5 text-xs bg-rose-950/60 text-rose-300 border border-rose-800 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign in with Microsoft
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
