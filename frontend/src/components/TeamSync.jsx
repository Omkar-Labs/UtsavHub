import React, { useState, useEffect, useCallback } from "react";
import { teamsApi } from "../api/teams";
import { useToast } from "../context/ToastContext";
import {
  Users,
  UserPlus,
  Mail,
  CheckCircle2,
  PlusCircle,
  Loader2,
  Handshake,
  Send,
} from "lucide-react";

export default function TeamSync({ events = [], user }) {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("matchmaker"); // "matchmaker", "requests", "squads", "create_manual"

  // Filter team events
  const teamEvents = events.filter(
    (e) => (e.eventType ? e.eventType === "Team" : e.isTeam)
  );

  const [selectedEventId, setSelectedEventId] = useState(
    teamEvents[0]?._id || teamEvents[0]?.id || ""
  );

  // Sync selectedEventId when events list updates
  useEffect(() => {
    if (!selectedEventId && teamEvents.length > 0) {
      setSelectedEventId(teamEvents[0]._id || teamEvents[0].id);
    }
  }, [teamEvents, selectedEventId]);

  // Tab 1: Candidates State
  const [candidates, setCandidates] = useState([]);
  const [genderFilter, setGenderFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState(null);

  // Tab 2: Requests State
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Tab 3: My Squads State
  const [myTeams, setMyTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Tab 4: Manual Code/Create State
  const [teamNameInput, setTeamNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  const currentEvent =
    events.find((e) => (e._id || e.id) === selectedEventId) || teamEvents[0] || {};

  // Fetch Candidates for Selected Event
  const fetchCandidates = useCallback(async () => {
    if (!selectedEventId) return;

    try {
      setIsLoadingCandidates(true);
      const res = await teamsApi.getCandidates(selectedEventId, {
        gender: genderFilter,
        branch: branchFilter,
      });
      if (res.success) {
        setCandidates(res.candidates || []);
      }
    } catch (err) {
      console.warn("Could not load candidates:", err.message);
      setCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [selectedEventId, genderFilter, branchFilter]);

  // Fetch Squad Requests (Incoming + Outgoing)
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoadingRequests(true);
      const res = await teamsApi.getRequests();
      if (res.success) {
        setIncomingRequests(res.incoming || []);
        setOutgoingRequests(res.outgoing || []);
      }
    } catch (err) {
      console.warn("Could not load team requests:", err.message);
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  // Fetch User's Teams
  const fetchMyTeams = useCallback(async () => {
    try {
      setIsLoadingTeams(true);
      const res = await teamsApi.getMyTeams();
      if (res.success) {
        setMyTeams(res.teams || []);
      }
    } catch (err) {
      console.warn("Could not load squads:", err.message);
    } finally {
      setIsLoadingTeams(false);
    }
  }, []);

  // Trigger loads based on active tab
  useEffect(() => {
    if (activeTab === "matchmaker") fetchCandidates();
    if (activeTab === "requests") fetchRequests();
    if (activeTab === "squads") fetchMyTeams();
  }, [activeTab, fetchCandidates, fetchRequests, fetchMyTeams]);

  // Handle Send Team Request
  const handleSendRequest = async (candidate) => {
    if (!selectedEventId) {
      showToast("Please choose an event first.", "warning");
      return;
    }

    try {
      setSendingInviteId(candidate._id);
      const res = await teamsApi.sendRequest({
        eventId: selectedEventId,
        receiverId: candidate._id,
        message: `Hey ${candidate.name}! Let's team up for ${currentEvent.eventName || currentEvent.title || "the event"}.`,
      });

      showToast(res.message || `Invite sent to ${candidate.name}!`, "success", "Squad Invite Sent");
      fetchCandidates();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to send squad request";
      showToast(msg, "error", "Invite Failed");
    } finally {
      setSendingInviteId(null);
    }
  };

  // Handle Respond to Request (Accept / Decline)
  const handleRespondRequest = async (requestId, action) => {
    try {
      setActionInProgressId(requestId);
      const res = await teamsApi.respondRequest(requestId, action);

      if (action === "Accept") {
        showToast(res.message || "Squad formed successfully!", "success", "Invite Accepted");
        fetchRequests();
        fetchMyTeams();
        setActiveTab("squads");
      } else {
        showToast("Request declined", "info", "Request Dismissed");
        fetchRequests();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error responding to request";
      showToast(msg, "error", "Action Failed");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Manual Team Creation
  const handleManualCreate = async (e) => {
    e.preventDefault();
    if (!teamNameInput.trim()) return;

    if (!selectedEventId) {
      showToast("Please select an event for your team.", "warning");
      return;
    }

    try {
      setIsSubmittingTeam(true);
      const res = await teamsApi.createTeam({
        eventId: selectedEventId,
        teamName: teamNameInput.trim(),
      });

      showToast(res.message || `Team created! Code: ${res.team.teamCode}`, "success", "Squad Created");
      setTeamNameInput("");
      fetchMyTeams();
      setActiveTab("squads");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create team";
      showToast(msg, "error", "Creation Failed");
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  // Handle Join by Code
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;

    try {
      setIsSubmittingTeam(true);
      const res = await teamsApi.joinByCode(code);
      showToast(res.message || `Joined team "${res.team.teamName}"!`, "success", "Squad Joined");
      setJoinCodeInput("");
      fetchMyTeams();
      setActiveTab("squads");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to join team";
      showToast(msg, "error", "Join Failed");
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const eventTitle = currentEvent.eventName || currentEvent.title || "Squad Event";
  const minTeam = currentEvent.minTeamSize || currentEvent.teamMin || 2;
  const maxTeam = currentEvent.maxTeamSize || currentEvent.teamMax || 4;

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 bg-[#FAF9F6] text-[#18181B]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-1 font-mono">
            <UserPlus className="w-4 h-4" />
            <span>Collegiate Squad Matchmaker</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
            TeamSync Squad Matchmaker
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl">
            Never miss an event due to a missing teammate. Browse verified students, pair by skill &amp; gender diversity mandates, or form a team instantly when both accept.
          </p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="bg-white border border-[#E4E2DD] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex items-center gap-2 w-full md:w-auto shadow-sm">
          <span className="text-xs font-bold text-zinc-500 pl-2 shrink-0">Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-[#FAF9F6] border border-[#E4E2DD] text-xs text-zinc-800 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 font-bold focus:outline-none focus:border-[#E11D48] w-full md:w-auto truncate"
          >
            {teamEvents.map((ev) => (
              <option key={ev._id || ev.id} value={ev._id || ev.id} className="bg-white text-zinc-900">
                {ev.eventName || ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diversity Mandate Alert Banner */}
      {currentEvent?.requiresFemaleTeammate && (
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start sm:items-center gap-2.5 sm:gap-3 shadow-sm">
          <span className="material-symbols-outlined text-[#C2410C] text-xl sm:text-2xl shrink-0 mt-0.5 sm:mt-0 font-bold">
            female
          </span>
          <div className="text-xs text-[#C2410C]">
            <span className="font-extrabold text-zinc-900">Gender Diversity Requirement Active:</span>{" "}
            {eventTitle} mandates at least <strong>1 female participant per team</strong> to qualify for registration. Connect with verified female participants in the pool below!
          </div>
        </div>
      )}

      {/* Horizontal Tabs Row (Scrollable on Mobile & Tablet) */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0 scrollbar-none">
        <button
          onClick={() => setActiveTab("matchmaker")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "matchmaker" ? "bg-[#18181B] text-white shadow-sm" : "bg-white text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-[#F3F1EC] shadow-sm"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Solo Matchmaker Pool</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 relative ${
            activeTab === "requests" ? "bg-[#18181B] text-white shadow-sm" : "bg-white text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-[#F3F1EC] shadow-sm"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Squad Requests</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] text-[10px] font-black">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("squads")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "squads" ? "bg-[#18181B] text-white shadow-sm" : "bg-white text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-[#F3F1EC] shadow-sm"
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>My Registered Squads ({myTeams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("create_manual")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "create_manual" ? "bg-[#18181B] text-white shadow-sm" : "bg-white text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-[#F3F1EC] shadow-sm"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Code / Create</span>
        </button>
      </div>

      {/* TAB 1: SOLO MATCHMAKER POOL */}
      {activeTab === "matchmaker" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#E4E2DD] shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs text-zinc-500 font-bold">Gender:</span>
              {["All", "Female", "Male"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    genderFilter === g
                      ? "bg-[#E11D48] text-white shadow-sm"
                      : "bg-[#FAF9F6] text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-zinc-100"
                  }`}
                >
                  {g === "Female" ? "👩 Female" : g === "Male" ? "👨 Male" : "All"}
                </button>
              ))}

              <span className="text-zinc-300 mx-1 hidden sm:inline">|</span>

              <span className="text-xs text-zinc-500 font-bold">Branch:</span>
              {["All", "CSE", "IT", "ECE"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBranchFilter(b)}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    branchFilter === b
                      ? "bg-[#18181B] text-white shadow-sm"
                      : "bg-[#FAF9F6] text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] hover:bg-zinc-100"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="text-xs text-zinc-500 font-mono">
              Target Squad Size:{" "}
              <span className="text-zinc-900 font-bold">
                {minTeam}-{maxTeam} Members
              </span>
            </div>
          </div>

          {/* Solos Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
          {isLoadingCandidates ? (
            <div className="p-12 sm:p-16 text-center rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Scanning campus directory for available students...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400 mx-auto mb-2" />
              <h3 className="font-headline text-base sm:text-lg font-bold text-[#18181B] mt-2">No Solo Candidates Found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                All eligible students for this event may already be in teams. Try relaxing filters or inviting fellow students to create an account!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {candidates.map((solo) => {
                const isInviting = sendingInviteId === solo._id;

                return (
                  <div
                    key={solo._id}
                    className="bg-white border border-[#E4E2DD] hover:border-[#E11D48]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 sm:gap-4 transition-all hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                              solo.gender === "Female"
                                ? "bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C]"
                                : "bg-[#FFE4E6] border border-[#FECDD3] text-[#E11D48]"
                            }`}
                          >
                            {solo.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <h3 className="font-headline text-sm sm:text-base font-bold text-[#18181B]">{solo.name}</h3>
                            <span className="text-[10px] sm:text-[11px] text-zinc-500">
                              {solo.college || "Campus"} • {solo.branch || "Student"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                            solo.gender === "Female"
                              ? "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          }`}
                        >
                          {solo.gender}
                        </span>
                      </div>

                      <div className="text-[10px] sm:text-[11px] font-mono text-zinc-500 mb-2">
                        Roll: {solo.rollNo || "Verified"}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(solo.skills) && solo.skills.length > 0 ? (
                          solo.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[9px] sm:text-[10px] font-medium border border-zinc-200"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">No specific skills listed</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E4E2DD] flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] text-[#047857] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                        Available
                      </span>
                      <button
                        onClick={() => handleSendRequest(solo)}
                        disabled={isInviting}
                        className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm disabled:opacity-50"
                      >
                        {isInviting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Inviting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Invite to Squad</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SQUAD REQUESTS */}
      {activeTab === "requests" && (
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#18181B]">Squad Teammate Invitations</h2>
            <p className="text-xs text-zinc-600 mt-1">
              When you accept an invite from another student, UtsavHub automatically forms your team and issues a join code!
            </p>
          </div>

          {/* Incoming Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C2410C] font-mono">
              Incoming Invites ({incomingRequests.length})
            </h3>

            {isLoadingRequests ? (
              <div className="p-8 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#E4E2DD] shadow-sm">
                <Loader2 className="w-6 h-6 animate-spin text-[#E11D48] mx-auto mb-2" />
                <span className="text-xs text-zinc-500">Loading invitations...</span>
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="p-8 sm:p-10 text-center rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm">
                <Mail className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <h3 className="font-headline text-sm sm:text-base font-bold text-[#18181B]">No Pending Invitations</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  You're all caught up. Check the Solo Matchmaker pool to invite students to team up with you!
                </p>
              </div>
            ) : (
              incomingRequests.map((req) => {
                const isActing = actionInProgressId === req._id;

                return (
                  <div
                    key={req._id}
                    className="bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] flex items-center justify-center font-extrabold text-base sm:text-lg shrink-0">
                        {req.sender?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-base sm:text-lg font-bold text-[#18181B]">{req.sender?.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                            {req.sender?.gender || "Student"}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 block mt-0.5">
                          {req.event?.eventName} • {req.sender?.branch} ({req.sender?.rollNo})
                        </span>
                        <p className="text-xs text-zinc-600 italic mt-1">"{req.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleRespondRequest(req._id, "Accept")}
                        disabled={isActing}
                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-[#047857] hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isActing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req._id, "Decline")}
                        disabled={isActing}
                        className="px-3 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-[#E4E2DD] text-xs font-semibold disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Outgoing Section */}
          {outgoingRequests.length > 0 && (
            <div className="space-y-3 sm:space-y-4 pt-4 border-t border-[#E4E2DD]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Outgoing Invites Sent ({outgoingRequests.length})
              </h3>
              <div className="space-y-2">
                {outgoingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-[#E4E2DD] shadow-sm flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#18181B]">{req.receiver?.name}</span>
                      <span className="text-zinc-500 ml-2">({req.event?.eventName})</span>
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        req.status === "Accepted"
                          ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                          : req.status === "Declined"
                          ? "bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]"
                          : "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGISTERED SQUADS */}
      {activeTab === "squads" && (
        <div>
          {isLoadingTeams ? (
            <div className="p-12 sm:p-16 text-center rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#E11D48] mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading your squad rosters...</p>
            </div>
          ) : myTeams.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm max-w-xl mx-auto">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400 mx-auto mb-2" />
              <h3 className="font-headline text-base sm:text-lg font-bold text-[#18181B]">No Squads Joined Yet</h3>
              <p className="text-xs text-zinc-500 mt-1">
                You can create a squad with a secret join code or accept an invite from fellow students to assemble your team.
              </p>
              <button
                onClick={() => setActiveTab("create_manual")}
                className="mt-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-xs font-bold text-white shadow-sm transition-colors"
              >
                Create or Join Squad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {myTeams.map((team) => {
                const hasFemale = team.members?.some((m) => m.gender?.toLowerCase() === "female");

                return (
                  <div
                    key={team._id}
                    className="bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-md flex flex-col justify-between gap-4 sm:gap-5 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">
                          {team.event?.eventName || "Event Squad"}
                        </span>
                        <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#18181B] mt-0.5 sm:mt-1">
                          {team.teamName}
                        </h2>
                      </div>
                      <div className="bg-[#FAF9F6] border border-[#E4E2DD] text-[#C2410C] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-mono font-extrabold tracking-wider self-start sm:self-auto shadow-sm">
                        CODE: {team.teamCode}
                      </div>
                    </div>

                    {/* Diversity status */}
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${hasFemale ? "bg-[#047857]" : "bg-[#C2410C]"}`}
                      ></span>
                      <span className={hasFemale ? "text-[#047857] font-bold" : "text-[#C2410C] font-bold"}>
                        {hasFemale
                          ? "Gender Diversity Mandate Satisfied ✓"
                          : "Notice: Minimum 1 female member recommended/required"}
                      </span>
                    </div>

                    {/* Members Roster */}
                    <div className="space-y-2">
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-zinc-500 block mb-1.5 font-mono">
                        Squad Roster ({team.members?.length || 0} Members) • Status:{" "}
                        <span className="text-zinc-900 font-bold">{team.status}</span>
                      </span>
                      {team.members?.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-[#E4E2DD] text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-zinc-400 font-mono text-[10px] sm:text-[11px] font-bold shrink-0">{idx + 1}.</span>
                            <span className="font-bold text-[#18181B] truncate">{m.name}</span>
                            <span className="text-[10px] sm:text-[11px] text-zinc-500 hidden sm:inline">
                              ({m.branch || "General"} • {m.gender || "Member"})
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-zinc-600 bg-white border border-[#E4E2DD] px-2 py-0.5 rounded font-mono shrink-0 ml-2 shadow-sm">
                            {m.role || "Member"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MANUAL SQUAD CODE OR CREATE */}
      {activeTab === "create_manual" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
          {/* Create Team Form */}
          <div className="bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#18181B] mb-1">Create Team as Leader</h2>
            <p className="text-xs text-zinc-600 mb-4 sm:mb-5">
              Enter your squad name and receive a secret team code to share with your friends.
            </p>
            <form onSubmit={handleManualCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. CodeWarriors, ByteMonks"
                  className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl sm:rounded-2xl px-4 py-2.5 text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingTeam}
                className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingTeam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Squad...</span>
                  </>
                ) : (
                  "Create Team & Generate Code"
                )}
              </button>
            </form>
          </div>

          {/* Join by Code Form */}
          <div className="bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm">
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#18181B] mb-1">Join via Team Code</h2>
            <p className="text-xs text-zinc-600 mb-4 sm:mb-5">
              Have a code from your squad leader? Enter it here to bind yourself to their roster.
            </p>
            <form onSubmit={handleJoinByCode} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1">Team Code *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. SQ4821"
                  className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl sm:rounded-2xl px-4 py-2.5 text-[#18181B] uppercase font-mono text-center tracking-widest font-extrabold focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingTeam}
                className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#18181B] hover:bg-zinc-800 text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingTeam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Joining Squad...</span>
                  </>
                ) : (
                  "Join Existing Squad"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
