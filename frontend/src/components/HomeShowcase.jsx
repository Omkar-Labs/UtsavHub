import React, { useState } from "react";
import { Bolt, ArrowRight, UserPlus, TrendingUp, CheckCircle, MapPin, Calendar, Users } from "lucide-react";

export default function HomeShowcase({ events = [], onSelectEvent, onNavigate }) {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const categories = ["All", "Hackathons", "Technical", "Cultural", "Sports", "Workshops", "Other"];

  // Normalize event fields so both backend models and mock models render seamlessly
  const normalizedEvents = events.map((e) => ({
    ...e,
    _id: e._id || e.id,
    id: e._id || e.id,
    title: e.eventName || e.title || "Campus Event",
    college: e.organizingInstitute || e.college || "Campus",
    fee: Number(e.registrationFee ?? e.fee ?? 0),
    isTeam: e.eventType ? e.eventType === "Team" : Boolean(e.isTeam),
    date: e.eventDate || e.date || "Upcoming",
    venue: e.venue || "Campus Venue",
    description: e.description || "No description provided.",
    seatLimit: Number(e.seatLimit || 100),
    registeredCount: Number(e.registeredCount || 0),
    image:
      e.bannerImage ||
      e.image ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    teamMin: Number(e.minTeamSize ?? e.teamMin ?? 2),
    teamMax: Number(e.maxTeamSize ?? e.teamMax ?? 4),
    category: e.category || "Technical",
  }));

  const filteredEvents =
    selectedFilter === "All"
      ? normalizedEvents
      : normalizedEvents.filter(
          (e) => e.category?.toLowerCase() === selectedFilter.toLowerCase()
        );

  return (
    <div className="flex flex-col w-full pb-16 sm:pb-20 bg-[#FAF9F6] text-[#18181B]">
      {/* Retro Warm Hero Banner */}
      <section className="relative w-full pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#E4E2DD]">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[200px] sm:h-[340px] bg-[#E11D48]/5 rounded-full blur-[70px] sm:blur-[90px] pointer-events-none"></div>
        <div className="absolute top-1/4 -right-20 w-48 sm:w-80 h-48 sm:h-80 bg-[#F43F5E]/5 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-[#E4E2DD] mb-4 sm:mb-6 shadow-sm max-w-full truncate">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E11D48] animate-ping shrink-0"></span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C2410C] font-mono truncate">
              Inter-College Circuit 2026-27
            </span>
            <span className="text-zinc-400 hidden sm:inline">•</span>
            <span className="text-[10px] sm:text-xs font-medium text-zinc-600 hidden sm:inline">
              UtsavHub Event Core
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#18181B] leading-tight sm:leading-tight">
            Discover, Compete &amp; Unite Across <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] to-[#F43F5E]">
              Every Campus Circuit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-5 text-xs sm:text-base md:text-lg text-zinc-600 max-w-3xl leading-relaxed px-1">
            The collegiate stage for hackathons, cultural fests, robotics, and sports tourneys. Form verified squads with algorithmic solo matchmaking or claim your retro digital QR pass.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate("explore")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-md shadow-[#E11D48]/20 transition-all hover:-translate-y-0.5"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate("teamsync")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3F1EC] text-zinc-800 border border-[#E4E2DD] font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4 text-[#E11D48]" />
              <span>Solo Team Maker</span>
            </button>
          </div>

          {/* Live Campus Telemetry Grid */}
          <div className="w-full mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#E4E2DD] shadow-sm flex flex-col items-center">
              <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">48+</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1 text-center">
                Colleges &amp; Clubs
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#E4E2DD] shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#C2410C] tracking-tight">
                  {normalizedEvents.reduce((acc, e) => acc + e.registeredCount, 0) || "1,240+"}
                </span>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2410C]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1 text-center">
                Registrations
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#E4E2DD] shadow-sm flex flex-col items-center">
              <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#E11D48] tracking-tight">
                {normalizedEvents.length} Active
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1 text-center">
                Campus Events
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#E4E2DD] shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#047857] tracking-tight">100%</span>
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#047857]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1 text-center">
                Gate QR Check-in
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-1">
              <Bolt className="w-4 h-4" />
              <span>Trending Across Campus Circuits</span>
            </div>
            <h2 className="font-headline text-xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
              Featured Events &amp; Tourneys
            </h2>
          </div>

          {/* Category Filter Pills (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  selectedFilter === cat
                    ? "bg-[#18181B] text-white shadow-sm"
                    : "bg-white text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-[#F3F1EC]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.slice(0, 6).map((event) => (
            <div
              key={event._id}
              className="group flex flex-col justify-between bg-white border border-[#E4E2DD] hover:border-[#E11D48]/40 rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-extrabold uppercase tracking-wide">
                    {event.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-zinc-900 border border-[#E4E2DD] text-[10px] font-bold shadow-sm">
                    {event.fee === 0 ? "Free Entry" : `₹${event.fee}`}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-zinc-700 text-[10px] font-semibold border border-[#E4E2DD] shadow-sm">
                    {event.college}
                  </span>
                </div>

                <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white text-xs drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-[#A7F3D0] shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[240px]">{event.venue}</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-[#18181B] group-hover:text-[#E11D48] transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E4E2DD] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#E11D48]" />
                      {event.isTeam ? `Squad: ${event.teamMin}-${event.teamMax}` : "Solo Entry"}
                    </span>
                    <span className="text-[#047857] font-semibold">
                      {event.registeredCount} / {event.seatLimit} Spots
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date}
                    </span>
                    <button
                      onClick={() => onSelectEvent(event)}
                      className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      View &amp; Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
