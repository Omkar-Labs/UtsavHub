import React, { useState, useEffect, useCallback } from "react";
import { teamsApi } from "../api/teams";
import { useToast } from "../context/ToastContext";
import {
  Users,
  UserPlus,
  Mail,
  CheckCircle2,
  XCircle,
  PlusCircle,
  KeyRound,
  Loader2,
  ShieldAlert,
  Handshake,
  AlertCircle,
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-[#131211] text-[#fcfaf6]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f59e0b] mb-1 font-mono">
            <UserPlus className="w-4 h-4" />
            <span>Retro-Collegiate Squad Matchmaker</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">
            TeamSync Squad Matchmaker
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            Never miss an event due to a missing teammate. Browse verified students, pair by skill &amp; gender diversity mandates, or form a team instantly when both accept.
          </p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="bg-[#1a1815] border-2 border-[#2c2824] p-2 rounded-2xl flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-stone-400 pl-2">Event:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-[#23201c] border border-[#38332d] text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-[#ff4d2e]"
          >
            {teamEvents.map((ev) => (
              <option key={ev._id || ev.id} value={ev._id || ev.id}>
                {ev.eventName || ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diversity Mandate Alert Banner */}
      {currentEvent?.requiresFemaleTeammate && (
        <div className="mb-6 p-4 rounded-2xl bg-[#f59e0b]/15 border-2 border-[#f59e0b]/30 flex items-start sm:items-center gap-3">
          <span className="material-symbols-outlined text-[#f59e0b] text-2xl shrink-0 mt-0.5 sm:mt-0 font-bold">
            female
          </span>
          <div className="text-xs text-amber-200">
            <span className="font-extrabold text-white">Gender Diversity Requirement Active:</span>{" "}
            {eventTitle} mandates at least <strong>1 female participant per team</strong> to qualify for registration. Connect with verified female participants in the pool below!
          </div>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#1a1815] p-1.5 rounded-2xl border-2 border-[#2c2824] w-fit">
        <button
          onClick={() => setActiveTab("matchmaker")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "matchmaker" ? "bg-[#ff4d2e] text-white shadow-sm" : "text-stone-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Solo Matchmaker Pool</span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "requests" ? "bg-[#ff4d2e] text-white shadow-sm" : "text-stone-400 hover:text-white"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Squad Requests</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#f59e0b] text-stone-950 text-[10px] font-black">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("squads")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "squads" ? "bg-[#ff4d2e] text-white shadow-sm" : "text-stone-400 hover:text-white"
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>My Registered Squads ({myTeams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("create_manual")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "create_manual" ? "bg-[#ff4d2e] text-white shadow-sm" : "text-stone-400 hover:text-white"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Code / Create</span>
        </button>
      </div>

      {/* TAB 1: SOLO MATCHMAKER POOL */}
      {activeTab === "matchmaker" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1a1815] p-4 rounded-3xl border-2 border-[#2c2824]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400 font-bold">Gender Filter:</span>
              {["All", "Female", "Male"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    genderFilter === g
                      ? "bg-[#ff4d2e] text-white"
                      : "bg-[#23201c] text-stone-400 hover:text-white border border-[#38332d]"
                  }`}
                >
                  {g === "Female" ? "👩 Female Students" : g === "Male" ? "👨 Male Students" : "All Solos"}
                </button>
              ))}

              <span className="text-stone-600 mx-2 hidden sm:inline">|</span>

              <span className="text-xs text-stone-400 font-bold">Branch:</span>
              {["All", "CSE", "IT", "ECE"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBranchFilter(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    branchFilter === b
                      ? "bg-[#f59e0b] text-stone-950 font-extrabold"
                      : "bg-[#23201c] text-stone-400 hover:text-white border border-[#38332d]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="text-xs text-stone-400 font-mono">
              Target Squad Size:{" "}
              <span className="text-white font-bold">
                {minTeam}-{maxTeam} Members
              </span>
            </div>
          </div>

          {/* Solos Grid */}
          {isLoadingCandidates ? (
            <div className="p-16 text-center rounded-3xl bg-[#1a1815] border-2 border-[#2c2824]">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff4d2e] mx-auto mb-2" />
              <p className="text-xs text-stone-400">Scanning campus directory for available students...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#1a1815] border-2 border-[#2c2824]">
              <Users className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="font-headline text-lg font-bold text-white mt-2">No Solo Candidates Found</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                All eligible students for this event may already be in teams. Try relaxing filters or inviting fellow students to create an account!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((solo) => {
                const isInviting = sendingInviteId === solo._id;

                return (
                  <div
                    key={solo._id}
                    className="bg-[#1a1815] border-2 border-[#2c2824] hover:border-[#ff4d2e]/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4 transition-all hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                              solo.gender === "Female"
                                ? "bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b]"
                                : "bg-[#ff4d2e]/20 border border-[#ff4d2e]/40 text-[#ff4d2e]"
                            }`}
                          >
                            {solo.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <h3 className="font-headline text-base font-bold text-white">{solo.name}</h3>
                            <span className="text-[11px] text-stone-400">
                              {solo.college || "Campus"} • {solo.branch || "Student"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            solo.gender === "Female"
                              ? "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30"
                              : "bg-[#23201c] text-stone-400"
                          }`}
                        >
                          {solo.gender}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-stone-400 mb-2">
                        Roll: {solo.rollNo || "Verified"}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(solo.skills) && solo.skills.length > 0 ? (
                          solo.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-md bg-[#23201c] text-stone-300 text-[10px] font-medium border border-[#38332d]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-stone-500 italic">No specific skills listed</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#2b2723] flex items-center justify-between">
                      <span className="text-[11px] text-[#10b981] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                        Available
                      </span>
                      <button
                        onClick={() => handleSendRequest(solo)}
                        disabled={isInviting}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-[#ff4d2e] hover:bg-[#e63d1e] text-white shadow-sm disabled:opacity-50"
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
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-white">Squad Teammate Invitations</h2>
            <p className="text-xs text-stone-400 mt-1">
              When you accept an invite from another student, UtsavHub automatically forms your team and issues a join code!
            </p>
          </div>

          {/* Incoming Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#f59e0b] font-mono">
              Incoming Invites ({incomingRequests.length})
            </h3>

            {isLoadingRequests ? (
              <div className="p-8 text-center bg-[#1a1815] rounded-3xl border-2 border-[#2c2824]">
                <Loader2 className="w-6 h-6 animate-spin text-[#f59e0b] mx-auto mb-2" />
                <span className="text-xs text-stone-400">Loading invitations...</span>
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-[#1a1815] border-2 border-[#2c2824]">
                <Mail className="w-8 h-8 text-stone-500 mx-auto mb-2" />
                <h3 className="font-headline text-base font-bold text-white">No Pending Invitations</h3>
                <p className="text-xs text-stone-400 mt-1">
                  You're all caught up. Check the Solo Matchmaker pool to invite students to team up with you!
                </p>
              </div>
            ) : (
              incomingRequests.map((req) => {
                const isActing = actionInProgressId === req._id;

                return (
                  <div
                    key={req._id}
                    className="bg-[#1a1815] border-2 border-[#2c2824] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] flex items-center justify-center font-extrabold text-lg">
                        {req.sender?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-lg font-bold text-white">{req.sender?.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b]">
                            {req.sender?.gender || "Student"}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 block mt-0.5">
                          {req.event?.eventName} • {req.sender?.branch} ({req.sender?.rollNo})
                        </span>
                        <p className="text-xs text-stone-300 italic mt-1">"{req.message}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleRespondRequest(req._id, "Accept")}
                        disabled={isActing}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                      >
                        {isActing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept &amp; Form Squad</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req._id, "Decline")}
                        disabled={isActing}
                        className="px-3 py-2.5 rounded-xl bg-[#23201c] hover:bg-[#2c2824] text-stone-400 hover:text-white text-xs font-semibold disabled:opacity-50"
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
            <div className="space-y-4 pt-4 border-t border-[#2c2824]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
                Outgoing Invites Sent ({outgoingRequests.length})
              </h3>
              <div className="space-y-2">
                {outgoingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-2xl bg-[#1a1815] border border-[#2c2824] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{req.receiver?.name}</span>
                      <span className="text-stone-400 ml-2">({req.event?.eventName})</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        req.status === "Accepted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : req.status === "Declined"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
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
            <div className="p-16 text-center rounded-3xl bg-[#1a1815] border-2 border-[#2c2824]">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff4d2e] mx-auto mb-2" />
              <p className="text-xs text-stone-400">Loading your squad rosters...</p>
            </div>
          ) : myTeams.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#1a1815] border-2 border-[#2c2824] max-w-xl mx-auto">
              <Users className="w-10 h-10 text-stone-500 mx-auto mb-2" />
              <h3 className="font-headline text-lg font-bold text-white">No Squads Joined Yet</h3>
              <p className="text-xs text-stone-400 mt-1">
                You can create a squad with a secret join code or accept an invite from fellow students to assemble your team.
              </p>
              <button
                onClick={() => setActiveTab("create_manual")}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-xs font-bold text-white transition-colors"
              >
                Create or Join Squad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myTeams.map((team) => {
                const hasFemale = team.members?.some((m) => m.gender?.toLowerCase() === "female");

                return (
                  <div
                    key={team._id}
                    className="bg-[#1a1815] border-2 border-[#2c2824] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block font-mono">
                          {team.event?.eventName || "Event Squad"}
                        </span>
                        <h2 className="font-headline text-2xl font-bold text-white mt-1">
                          {team.teamName}
                        </h2>
                      </div>
                      <div className="bg-[#23201c] border-2 border-[#38332d] text-[#f59e0b] px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold tracking-wider">
                        CODE: {team.teamCode}
                      </div>
                    </div>

                    {/* Diversity status */}
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${hasFemale ? "bg-[#10b981]" : "bg-[#f59e0b]"}`}
                      ></span>
                      <span className={hasFemale ? "text-[#10b981] font-bold" : "text-[#f59e0b] font-bold"}>
                        {hasFemale
                          ? "Gender Diversity Mandate Satisfied ✓"
                          : "Notice: Minimum 1 female member recommended/required"}
                      </span>
                    </div>

                    {/* Members Roster */}
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block mb-2 font-mono">
                        Squad Roster ({team.members?.length || 0} Members) • Status:{" "}
                        <span className="text-white font-bold">{team.status}</span>
                      </span>
                      {team.members?.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#23201c] border border-[#38332d] text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-stone-500 font-mono text-[11px] font-bold">{idx + 1}.</span>
                            <span className="font-bold text-white">{m.name}</span>
                            <span className="text-[11px] text-stone-400">
                              ({m.branch || "General"} • {m.gender || "Member"})
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-300 bg-[#1a1815] px-2 py-0.5 rounded font-mono">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Team Form */}
          <div className="bg-[#1a1815] border-2 border-[#2c2824] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="font-headline text-2xl font-bold text-white mb-1">Create Team as Leader</h2>
            <p className="text-xs text-stone-400 mb-5">
              Enter your squad name and receive a secret team code to share with your friends.
            </p>
            <form onSubmit={handleManualCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. CodeWarriors, ByteMonks"
                  className="w-full bg-[#23201c] border border-[#38332d] rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff4d2e]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingTeam}
                className="w-full py-3.5 rounded-2xl bg-[#ff4d2e] hover:bg-[#e63d1e] text-white font-extrabold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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
          <div className="bg-[#1a1815] border-2 border-[#2c2824] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="font-headline text-2xl font-bold text-white mb-1">Join via Team Code</h2>
            <p className="text-xs text-stone-400 mb-5">
              Have a code from your squad leader? Enter it here to bind yourself to their roster.
            </p>
            <form onSubmit={handleJoinCode} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Team Code *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. SQ4821"
                  className="w-full bg-[#23201c] border-2 border-[#38332d] rounded-2xl px-4 py-2.5 text-white uppercase font-mono text-center tracking-widest font-extrabold focus:outline-none focus:border-[#f59e0b]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingTeam}
                className="w-full py-3.5 rounded-2xl bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 font-extrabold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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
