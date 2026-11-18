import React, { useState } from "react";
import { eventsApi } from "../api/events";
import { useToast } from "../context/ToastContext";
import { Loader2, Calendar, Clock, MapPin, Building, AlertCircle, X } from "lucide-react";

export default function CreateEventModal({ isOpen, onClose, onAddEvent, user }) {
  const { showToast } = useToast();

  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("Hackathons");
  const [collegeScope, setCollegeScope] = useState("All Colleges (Inter-College)");
  const [eventDate, setEventDate] = useState("Dec 20, 2026");
  const [eventTime, setEventTime] = useState("09:30 AM IST");
  const [venue, setVenue] = useState("Main Campus Auditorium");
  const [description, setDescription] = useState("");
  const [registrationFee, setRegistrationFee] = useState(0);
  const [seatLimit, setSeatLimit] = useState(150);
  const [bannerImage, setBannerImage] = useState("");

  // Squad / Team Settings
  const [isTeam, setIsTeam] = useState(true);
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [requiresFemaleTeammate, setRequiresFemaleTeammate] = useState(true);

  // Optional Payout Account (for paid events)
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!eventName.trim()) {
      setErrorMessage("Event name is required.");
      return;
    }

    if (isTeam) {
      if (Number(minTeamSize) < 2) {
        setErrorMessage("Team events must have a minimum team size of at least 2.");
        return;
      }
      if (Number(minTeamSize) > Number(maxTeamSize)) {
        setErrorMessage("Minimum team size cannot exceed maximum team size.");
        return;
      }
    }

    const isPaid = Number(registrationFee) > 0;

    const payload = {
      eventName: eventName.trim(),
      organizingInstitute: user?.college || "IET Lucknow",
      eventDate: eventDate.trim(),
      eventTime: eventTime.trim(),
      venue: venue.trim(),
      eventType: isTeam ? "Team" : "Solo",
      isPaid,
      registrationFee: isPaid ? Number(registrationFee) : 0,
      minTeamSize: isTeam ? Number(minTeamSize) : 1,
      maxTeamSize: isTeam ? Number(maxTeamSize) : 1,
      requiresFemaleTeammate: isTeam && Boolean(requiresFemaleTeammate),
      category,
      collegeScope,
      description: description.trim(),
      seatLimit: Number(seatLimit) || 100,
      bannerImage:
        bannerImage.trim() ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    };

    if (isPaid && (upiId || bankName)) {
      payload.payoutAccount = {
        upiId: upiId.trim(),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim() || user?.name || "Campus Treasury",
      };
    }

    try {
      setIsSubmitting(true);
      const res = await eventsApi.create(payload);
      showToast(`Event "${res.event.eventName}" published successfully!`, "success", "Event Live");
      if (onAddEvent) onAddEvent(res.event);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to publish event";
      setErrorMessage(msg);
      showToast(msg, "error", "Publish Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1a1815] border-2 border-[#38332d] rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Retro Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff4d2e] via-[#f59e0b] to-[#10b981]"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pt-1 sm:pt-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#f59e0b] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span>Organizer Console • {user?.college || "IET Lucknow"}</span>
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-white mt-1">Publish New Campus Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#2c2824] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-300 mb-1">Event Name *</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. HackIET 2026, RoboWars"
              className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
              >
                <option value="Hackathons" className="bg-[#1a1815]">Hackathons</option>
                <option value="Technical" className="bg-[#1a1815]">Technical</option>
                <option value="Cultural" className="bg-[#1a1815]">Cultural</option>
                <option value="Sports" className="bg-[#1a1815]">Sports</option>
                <option value="Workshops" className="bg-[#1a1815]">Workshops</option>
                <option value="Other" className="bg-[#1a1815]">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Campus Scope</label>
              <select
                value={collegeScope}
                onChange={(e) => setCollegeScope(e.target.value)}
                className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
              >
                <option value="All Colleges (Inter-College)" className="bg-[#1a1815]">All Colleges (Open Inter-College)</option>
                <option value={`My College Only (${user?.college || "IET Lucknow"})`} className="bg-[#1a1815]">
                  My College Only ({user?.college || "IET Lucknow"})
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Registration Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
                placeholder="0 for Free Event"
                className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1">Seat Limit / Capacity *</label>
              <input
                type="number"
                min="5"
                required
                value={seatLimit}
                onChange={(e) => setSeatLimit(e.target.value)}
                className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-semibold text-stone-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Event Date *</span>
              </label>
              <input
                type="text"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="e.g. Dec 20, 2026"
                className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Event Time *</span>
              </label>
              <input
                type="text"
                required
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 09:30 AM IST"
                className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Venue Location *</span>
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. APJ Abdul Kalam Auditorium, CSE Block"
              className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Banner Image URL (Optional)</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Description &amp; Guidelines</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, schedule, rounds, and eligibility criteria..."
              className="w-full bg-[#23201c] border border-[#38332d] rounded-xl sm:rounded-2xl p-3 text-white focus:outline-none focus:border-[#ff4d2e]"
            />
          </div>

          {/* Squad / Team Settings */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#23201c] border border-[#38332d] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Group / Squad Registration</span>
                <span className="text-[10px] sm:text-[11px] text-stone-400">Allows solo matchmaking and team code join</span>
              </div>
              <input
                type="checkbox"
                checked={isTeam}
                onChange={(e) => setIsTeam(e.target.checked)}
                className="w-4 h-4 accent-[#ff4d2e] rounded cursor-pointer"
              />
            </div>

            {isTeam && (
              <div className="pt-3 border-t border-[#38332d] space-y-3">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-semibold text-stone-300 mb-1">Min Team Size (≥2)</label>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(e.target.value)}
                      className="w-full bg-[#1a1815] border border-[#38332d] rounded-lg sm:rounded-xl p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-semibold text-stone-300 mb-1">Max Team Size</label>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(e.target.value)}
                      className="w-full bg-[#1a1815] border border-[#38332d] rounded-lg sm:rounded-xl p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f59e0b] text-base font-bold">female</span>
                    <div>
                      <span className="font-bold text-white text-[11px] sm:text-xs block">Gender Diversity Mandate</span>
                      <span className="text-[9px] sm:text-[10px] text-amber-200">Mandate at least 1 female teammate</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresFemaleTeammate}
                    onChange={(e) => setRequiresFemaleTeammate(e.target.checked)}
                    className="w-4 h-4 accent-[#f59e0b] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Paid Event: Payout Info */}
          {Number(registrationFee) > 0 && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#14231b] border border-emerald-800/40 space-y-2.5 sm:space-y-3">
              <span className="font-bold text-emerald-300 block text-xs">
                College Treasury Payout Details (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-200 mb-1">College UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="treasury@okaxis"
                    className="w-full bg-[#0d1611] border border-emerald-800/60 rounded-lg sm:rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-200 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full bg-[#0d1611] border border-emerald-800/60 rounded-lg sm:rounded-xl p-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white font-extrabold text-xs transition-colors shadow-lg shadow-[#ff4d2e]/25 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Event...</span>
              </>
            ) : (
              "Publish Event & Open Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
