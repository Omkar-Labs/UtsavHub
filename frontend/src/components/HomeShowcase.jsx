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
    <div className="flex flex-col w-full pb-20 bg-[#131211] text-[#fcfaf6]">
      {/* Retro Warm Hero Banner */}
      <section className="relative w-full pt-14 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-2 border-[#2c2824]">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-[#ff4d2e]/15 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#f59e0b]/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1b18] border-2 border-[#38332d] mb-6 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d2e] animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] font-mono">
              Inter-College Circuit 2026-27
            </span>
            <span className="text-stone-600">•</span>
            <span className="text-xs font-medium text-stone-300">
              UtsavHub Event Core
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#fcfaf6] leading-tight">
            Discover, Compete &amp; Unite Across <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2e] via-[#f59e0b] to-[#10b981]">
              Every Campus Circuit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-stone-400 max-w-3xl leading-relaxed">
            The collegiate stage for hackathons, cultural fests, autonomous robotics, and sports tourneys. Form verified squads with algorithmic solo matchmaking or claim your retro digital QR pass.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate("explore")}
              className="inline-flex items-center gap-2 bg-[#ff4d2e] hover:bg-[#e63d1e] text-white font-extrabold text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-[#ff4d2e]/25 transition-all hover:-translate-y-0.5"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate("teamsync")}
              className="inline-flex items-center gap-2 bg-[#23201c] hover:bg-[#2c2824] text-[#f59e0b] border-2 border-[#38332d] font-bold text-sm px-7 py-3.5 rounded-2xl transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Solo Team Maker</span>
            </button>
          </div>

          {/* Live Campus Telemetry Grid */}
          <div className="w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#1a1815] border-2 border-[#2b2723] flex flex-col items-center">
              <span className="font-headline text-3xl font-extrabold text-white tracking-tight">48+</span>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                Colleges &amp; Clubs
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1a1815] border-2 border-[#2b2723] flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="font-headline text-3xl font-extrabold text-[#f59e0b] tracking-tight">
                  {normalizedEvents.reduce((acc, e) => acc + e.registeredCount, 0) || "1,240+"}
                </span>
                <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                Live Registrations
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1a1815] border-2 border-[#2b2723] flex flex-col items-center">
              <span className="font-headline text-3xl font-extrabold text-[#ff4d2e] tracking-tight">
                {normalizedEvents.length} Active
              </span>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                Campus Events
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1a1815] border-2 border-[#2b2723] flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="font-headline text-3xl font-extrabold text-[#10b981] tracking-tight">100%</span>
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                Verified Gate Check-in
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f59e0b] mb-1">
              <Bolt className="w-4 h-4" />
              <span>Trending Across Campus Circuits</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Events &amp; Tourneys
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFilter === cat
                    ? "bg-[#ff4d2e] text-white shadow-sm"
                    : "bg-[#23201c] text-stone-400 hover:text-white border border-[#38332d]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.slice(0, 6).map((event) => (
            <div
              key={event._id}
              className="group flex flex-col justify-between bg-[#1a1815] border-2 border-[#2c2824] hover:border-[#ff4d2e]/60 rounded-3xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-sm"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1815] via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ff4d2e] text-white text-[10px] font-extrabold uppercase tracking-wide">
                    {event.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#131211]/90 text-[#f59e0b] border border-[#f59e0b]/40 text-[10px] font-bold">
                    {event.fee === 0 ? "Free Entry" : `₹${event.fee}`}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#131211]/90 text-stone-300 text-[10px] font-semibold border border-[#38332d]">
                    {event.college}
                  </span>
                </div>

                <div className="absolute bottom-2 left-3 flex items-center gap-1 text-stone-300 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="truncate max-w-[240px]">{event.venue}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="font-headline text-lg font-bold text-white group-hover:text-[#ff4d2e] transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2b2723] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.isTeam ? `Squad: ${event.teamMin}-${event.teamMax} Members` : "Solo Entry"}
                    </span>
                    <span className="text-[#10b981] font-semibold">
                      {event.registeredCount} / {event.seatLimit} Spots
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date}
                    </span>
                    <button
                      onClick={() => onSelectEvent(event)}
                      className="px-4 py-1.5 rounded-xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white text-xs font-bold shadow-sm transition-colors"
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
