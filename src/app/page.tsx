import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  ExternalLink,
  Laptop,
  GraduationCap,
  Award,
  Video,
} from "lucide-react";
import { dataStore } from "@/lib/db/store";
import { EventCard } from "@/components/events/EventCard";
import { formatDate } from "@/lib/utils";

export const revalidate = 60; // Cache on edge/CDN for 60 seconds to support 1000+ student bursts

export default async function HomePage() {
  const publishedEvents = await dataStore.getEvents({ onlyPublished: true });
  const featuredEvents = publishedEvents.slice(0, 3);
  const announcements = await dataStore.getAnnouncements({ activeOnly: true });

  const categories = [
    { title: "Hackathons & Challenges", count: "36 Hours", icon: Laptop, desc: "Inventathon & GenAI problem tracks" },
    { title: "Keynote & Expert Talks", count: "Distinguished", icon: GraduationCap, desc: "Leading global AI researchers" },
    { title: "Research Colloquium", count: "Posters & Papers", icon: Award, desc: "Peer-reviewed student research" },
    { title: "Creative Media & CineAI", count: "Short Films", icon: Video, desc: "AI generated cinema & arts" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-iitg-navy-950 via-iitg-navy-900 to-iitg-navy-800 text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-iitg-navy-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Mehta Family School of Data Science and AI &bull; IIT Guwahati
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            IIT Guwahati <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">AI Confluence</span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300">
              Centralized Event Registration Portal
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            One unified destination for all conference tracks, keynote talks, hackathons, and research colloquiums.
            Log in with your authorized Microsoft account once, register across events via Microsoft Forms, and track your submission statuses seamlessly.
          </p>

          {/* Call to action buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl bg-iitg-cyan-500 hover:bg-iitg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Browse All Conference Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-white font-medium text-sm transition-all"
            >
              Go to Student Dashboard
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
              <div className="text-2xl font-bold text-cyan-400">{publishedEvents.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Published Events</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
              <div className="text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Microsoft Forms Sync</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
              <div className="text-2xl font-bold text-teal-300">Single</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Unified Sign-In</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
              <div className="text-2xl font-bold text-amber-400">Real-Time</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Status Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* How Registration Works Section */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">How Registration Works</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Replacing disconnected emails with an automated, synchronized conference portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Microsoft Login</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in once with your institutional Microsoft Entra ID account to verify your student identity.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Explore & Select Tracks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse detailed schedules, eligibility, rules, prizes, and coordinator contacts for every event.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center mb-3">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Submit via MS Forms</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click Register to open the verified Microsoft Form questionnaire and submit your answers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center mb-3">
                04
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Auto-Sync & Track</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Power Automate synchronizes your submission directly to your student dashboard in real time.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Conference Events */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Conference Events</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Keynotes, hackathons, and symposiums organized for the upcoming edition.
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              <span>View all {publishedEvents.length} events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-base font-bold text-slate-800">No events currently scheduled</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Organizers are currently finalizing the conference tracks and Microsoft Forms registration links. Please check back shortly!
              </p>
            </div>
          )}
        </section>

        {/* Categories Showcase */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Conference Categories</h2>
            <p className="text-xs text-slate-600">Diverse activities spanning theory, code, and creative media.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.title} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-cyan-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider">{cat.count}</div>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Latest Announcements */}
        {announcements.length > 0 && (
          <section className="space-y-4 bg-slate-100/70 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-700" />
                <h3 className="font-bold text-base text-slate-900">Latest Conference Announcements</h3>
              </div>
              <Link href="/announcements" className="text-xs font-medium text-cyan-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      {ann.priority}
                    </span>
                    <span className="text-slate-400 text-[10px]">{formatDate(ann.published_at)}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{ann.title}</h4>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About MFSDSAI & IIT Guwahati */}
        <section className="p-8 rounded-2xl bg-iitg-navy-900 text-white space-y-4">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              About The Host Department
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Mehta Family School of Data Science and Artificial Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Established with visionary support from the Mehta Family Foundation, MFSDSAI at IIT Guwahati fosters groundbreaking research, interdisciplinary learning, and societal innovation in AI, high-performance computing, and machine learning.
              AI Confluence brings together researchers, industry pioneers, and student innovators across the globe.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
            <a
              href="https://www.iitg.ac.in/dsai/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              <span>Visit MFSDSAI Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://oes.iitg.ac.in/ai-confluence/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>AI Confluence 2025 Archive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
