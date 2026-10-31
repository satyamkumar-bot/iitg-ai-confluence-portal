import Link from "next/link";
import { ExternalLink, Shield, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-iitg-navy-950 text-slate-400 border-t border-iitg-navy-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-white font-bold text-sm tracking-wide uppercase">
              IIT Guwahati AI Confluence
            </div>
            <p className="text-slate-400 leading-relaxed">
              Centralized Event Registration & Participation Portal for the flagship AI Confluence organized by the{" "}
              <strong className="text-slate-200">
                Mehta Family School of Data Science and Artificial Intelligence (MFSDSAI)
              </strong>
              , Indian Institute of Technology Guwahati.
            </p>
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>IIT Guwahati, Amingaon, Guwahati, Assam 781039</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">Navigation</div>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="hover:text-cyan-400 transition-colors">
                  Browse All Events
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-cyan-400 transition-colors">
                  Announcements & Circulars
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/registrations" className="hover:text-cyan-400 transition-colors">
                  My Registrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Links */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">Institutional Links</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://oes.iitg.ac.in/ai-confluence/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  AI Confluence 2025 Archive <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://event.iitg.ac.in/ai_confluence2024/AI_Confluence2024_brochure.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  AI Confluence 2024 Brochure <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.iitg.ac.in/dsai/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  MFSDSAI IIT Guwahati <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.iitg.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  IIT Guwahati Main Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Privacy & Support */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Privacy & Inquiries
            </div>
            <p className="text-slate-400 leading-relaxed">
              Student identities and response records are protected under institutional data privacy
              guidelines. Form synchronization is authenticated via secure Microsoft Webhooks.
            </p>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>aiconfluence@iitg.ac.in</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Shield className="w-3 h-3" />
              <span>Microsoft Entra ID Protected</span>
            </div>
          </div>
        </div>

        <div className="border-t border-iitg-navy-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
          <div>
            &copy; {new Date().getFullYear()} Mehta Family School of Data Science and Artificial
            Intelligence, IIT Guwahati. All rights reserved.
          </div>
          <div className="text-slate-400">
            Intended for AI Confluence conferences &bull; Not an endorsement of unofficial materials.
          </div>
        </div>
      </div>
    </footer>
  );
}
