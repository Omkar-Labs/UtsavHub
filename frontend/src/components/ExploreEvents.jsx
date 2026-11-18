import React, { useState } from "react";
import PaymentModal from "./PaymentModal";
import { collegesList } from "../data/mockData";
import { eventsApi } from "../api/events";
import { useToast } from "../context/ToastContext";
import {
  Search,
  Building,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Tag,
  X,
} from "lucide-react";

export default function ExploreEvents({ events = [], user, onRegisterSuccess, onNavigateToTeamSync }) {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCollegeScope, setSelectedCollegeScope] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");

  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [payingEvent, setPayingEvent] = useState(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const categories = ["All", "Technical", "Hackathons", "Cultural", "Sports", "Workshops", "Other"];

  // Normalize event fields for consistent UI rendering
  const normalizedEvents = events.map((e) => {
    const id = e._id || e.id;
    const title = e.eventName || e.title || "Campus Event";
    const college = e.organizingInstitute || e.college || "Campus";
    const fee = Number(e.registrationFee ?? e.fee ?? 0);
    const isTeam = e.eventType ? e.eventType === "Team" : Boolean(e.isTeam);
    const date = e.eventDate || e.date || "Upcoming";
    const time = e.eventTime || e.time || "TBA";
    const venue = e.venue || "Campus Venue";
    const description = e.description || "No description provided.";
    const seatLimit = Number(e.seatLimit || 100);
    const registeredCount = Number(e.registeredCount || 0);
    const image =
      e.bannerImage ||
      e.image ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";
    const teamMin = Number(e.minTeamSize ?? e.teamMin ?? (isTeam ? 2 : 1));
    const teamMax = Number(e.maxTeamSize ?? e.teamMax ?? (isTeam ? 4 : 1));
    const requiresFemale = Boolean(e.requiresFemaleTeammate);
    const category = e.category || "Technical";
    const scope = e.collegeScope || "All Colleges";

    return {
      ...e,
      _id: id,
      id,
      title,
      college,
      fee,
      isTeam,
      date,
      time,
      venue,
      description,
      seatLimit,
      registeredCount,
      image,
      teamMin,
      teamMax,
      requiresFemaleTeammate: requiresFemale,
      category,
      collegeScope: scope,
    };
  });

  const filtered = normalizedEvents.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || e.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesFee =
      feeFilter === "all" ||
      (feeFilter === "free" && e.fee === 0) ||
      (feeFilter === "paid" && e.fee > 0);

    let matchesCollege = true;
    if (selectedCollegeScope === "my_college") {
      matchesCollege = e.college === user?.college;
    } else if (selectedCollegeScope !== "all") {
      matchesCollege = e.college === selectedCollegeScope;
    }

    return matchesSearch && matchesCategory && matchesFee && matchesCollege;
  });

  // Handle Free Event Direct Registration
  const handleDirectRegistration = async (event) => {
    setRegistrationError("");

    if (user?.role === "Admin") {
      showToast("Admins cannot register as attendees for events.", "warning", "Admin Restricted");
      return;
    }

    if (event.isTeam && !teamNameInput.trim()) {
      setRegistrationError("Team name is required for squad events. Enter a name or use Team Maker.");
      return;
    }

    try {
      setIsRegistering(true);

      const payload = {
        eventType: event.isTeam ? "Team" : "Solo",
        teamName: event.isTeam ? teamNameInput.trim() : undefined,
        teamMembers: event.isTeam
          ? [
              {
                studentId: user?._id,
                name: user?.name,
                email: user?.email,
                rollNo: user?.rollNo,
                branch: user?.branch,
                gender: user?.gender,
              },
            ]
          : [],
      };

      const res = await eventsApi.register(event._id, payload);
      showToast(res.message || `Successfully registered for ${event.title}!`, "success", "Pass Issued");
      if (onRegisterSuccess) onRegisterSuccess(res.ticket);
      setSelectedEventModal(null);
      setTeamNameInput("");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      setRegistrationError(msg);
      showToast(msg, "error", "Registration Error");
    } finally {
      setIsRegistering(false);
    }
  };

  // Payment Success Callback
  const handlePaymentSuccess = (event, txnId, ticket) => {
    showToast(`Payment confirmed! QR pass ready for ${event.title}.`, "success", "Ticket Confirmed");
    if (onRegisterSuccess && ticket) onRegisterSuccess(ticket);
    setPayingEvent(null);
    setSelectedEventModal(null);
    setTeamNameInput("");
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 bg-[#131211] text-[#fcfaf6]">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d2e]"></span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#ff4d2e] font-mono">
              Inter-College Event Directory
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Explore Campus &amp; Circuit Events
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-3xl">
            Register for hackathons, cultural fests, tech symposiums, and sports tourneys across {user?.college || "your campus"} and partner institutes.
          </p>
        </div>

        {/* Filter Toolbar (Responsive stack on mobile, row on tablet/desktop) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-[#1a1815] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-[#2c2824]">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, robotics, coders..."
              className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl pl-10 pr-4 py-2 sm:py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#ff4d2e]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* College Filter Select */}
            <div className="flex items-center gap-2 bg-[#131211] px-3.5 py-2 rounded-xl sm:rounded-2xl border border-[#38332d]">
              <Building className="w-4 h-4 text-[#f59e0b] shrink-0" />
              <select
                value={selectedCollegeScope}
                onChange={(e) => setSelectedCollegeScope(e.target.value)}
                className="bg-transparent text-xs text-stone-200 font-bold focus:outline-none cursor-pointer w-full sm:w-auto truncate"
              >
                <option value="all" className="bg-[#1a1815]">All Colleges (Inter-College)</option>
                {user?.college && (
                  <option value="my_college" className="bg-[#1a1815]">
                    My College Only ({user.college})
                  </option>
                )}
                {collegesList.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#1a1815]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Filter */}
            <div className="flex items-center justify-center gap-1 bg-[#131211] p-1 rounded-xl sm:rounded-2xl border border-[#38332d]">
              {["all", "free", "paid"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFeeFilter(f)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold capitalize transition-colors text-center ${
                    feeFilter === f ? "bg-[#ff4d2e] text-white shadow-sm" : "text-stone-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Edge-to-edge scroll on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === c
                  ? "bg-[#ff4d2e] text-white shadow-sm"
                  : "bg-[#1a1815] text-stone-400 hover:text-white border border-[#2c2824]"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="text-xs text-stone-500 ml-auto hidden md:inline font-mono shrink-0">
            {filtered.length} Events Listed
          </span>
        </div>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-[#1a1815] border-2 border-[#2c2824]">
          <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-stone-500 mx-auto mb-2" />
          <h3 className="font-headline text-base sm:text-lg font-bold text-white mt-2">No matching events found</h3>
          <p className="text-xs text-stone-400 mt-1">Try relaxing your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((event) => {
            const spotsLeft = Math.max(0, event.seatLimit - event.registeredCount);
            const isSoldOut = spotsLeft === 0;

            return (
              <div
                key={event._id}
                className="bg-[#1a1815] border-2 border-[#2c2824] hover:border-[#ff4d2e]/60 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm"
              >
                <div className="relative h-40 sm:h-44 w-full overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1815] via-transparent to-transparent"></div>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#ff4d2e] text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                      {event.category}
                    </span>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#131211]/90 text-[#f59e0b] border border-[#f59e0b]/40 text-[9px] sm:text-[10px] font-bold">
                      {event.fee === 0 ? "Free" : `₹${event.fee}`}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#131211]/90 text-stone-300 border border-[#38332d] text-[9px] sm:text-[10px] font-semibold flex items-center gap-1">
                      <Building className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{event.college}</span>
                    </span>
                  </div>

                  {/* Diversity Requirement Tag */}
                  {event.requiresFemaleTeammate && (
                    <div className="absolute bottom-2 left-2.5 sm:left-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#f59e0b] text-stone-950 text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1">
                        <Users className="w-3 h-3 font-bold" />
                        <span>1+ Female Member Mandate</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
                  <div>
                    <h3 className="font-headline text-base sm:text-lg font-bold text-white leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-400">
                      <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2b2723] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.date}
                      </span>
                      <span className="text-[#10b981] font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {event.isTeam ? `Squad: ${event.teamMin}-${event.teamMax}` : "Solo Entry"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[11px] font-mono ${isSoldOut ? "text-rose-400 font-bold" : "text-stone-400"}`}>
                        {isSoldOut ? "Sold Out" : `${spotsLeft} spots open`}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedEventModal(event);
                          setRegistrationError("");
                          setTeamNameInput("");
                        }}
                        className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        View &amp; Register
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Registration Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#1a1815] border-2 border-[#38332d] rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#ff4d2e]/20 text-[#ff4d2e] text-[9px] sm:text-[10px] font-extrabold uppercase">
                  {selectedEventModal.category} • {selectedEventModal.college}
                </span>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-1.5">
                  {selectedEventModal.title}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">{selectedEventModal.collegeScope}</p>
              </div>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#2c2824] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              {selectedEventModal.description}
            </p>

            {selectedEventModal.requiresFemaleTeammate && (
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-amber-200 text-xs flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <span>
                  <strong>Diversity Mandate:</strong> Your squad must include at least 1 female teammate to register.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#131211] border border-[#2c2824] text-xs mb-4">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Venue</span>
                <span className="font-semibold text-white">{selectedEventModal.venue}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Schedule</span>
                <span className="font-semibold text-white">
                  {selectedEventModal.date} • {selectedEventModal.time}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Entry Fee</span>
                <span className="font-extrabold text-[#f59e0b]">
                  {selectedEventModal.fee === 0 ? "Free (Sponsored)" : `₹${selectedEventModal.fee}`}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Participation</span>
                <span className="font-semibold text-[#10b981]">
                  {selectedEventModal.isTeam
                    ? `Squad ${selectedEventModal.teamMin}-${selectedEventModal.teamMax} Members`
                    : "Individual Solo"}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {registrationError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{registrationError}</span>
              </div>
            )}

            {/* Team Name Input for Squad Events */}
            {selectedEventModal.isTeam && (
              <div className="mb-4 p-3 rounded-xl sm:rounded-2xl bg-[#23201c] border border-[#38332d]">
                <label className="block text-xs font-semibold text-stone-200 mb-1">
                  Squad Name *
                </label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. CyberKnights, CodeBlasters"
                  className="w-full bg-[#1a1815] border border-[#38332d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff4d2e]"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Need teammates? Use the{" "}
                  <button
                    onClick={() => {
                      setSelectedEventModal(null);
                      if (onNavigateToTeamSync) onNavigateToTeamSync();
                    }}
                    className="text-[#ff4d2e] underline font-bold"
                  >
                    Team Maker tab
                  </button>{" "}
                  to invite students or join by team code.
                </p>
              </div>
            )}

            {/* Registration Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              {selectedEventModal.fee > 0 ? (
                <button
                  onClick={() => setPayingEvent(selectedEventModal)}
                  className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Pay ₹{selectedEventModal.fee} &amp; Issue Pass</span>
                </button>
              ) : (
                <button
                  onClick={() => handleDirectRegistration(selectedEventModal)}
                  disabled={isRegistering}
                  className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Registration...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Free Registration &amp; Get Pass</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={!!payingEvent}
        onClose={() => setPayingEvent(null)}
        event={payingEvent}
        user={user}
        teamName={teamNameInput}
        teamMembers={
          payingEvent?.isTeam
            ? [
                {
                  studentId: user?._id,
                  name: user?.name,
                  email: user?.email,
                  rollNo: user?.rollNo,
                  branch: user?.branch,
                  gender: user?.gender,
                },
              ]
            : []
        }
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
