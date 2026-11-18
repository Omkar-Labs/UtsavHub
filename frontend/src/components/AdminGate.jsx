import React, { useState, useEffect, useCallback, useRef } from "react";
import { eventsApi } from "../api/events";
import { paymentsApi } from "../api/payments";
import { useToast } from "../context/ToastContext";
import {
  ShieldCheck,
  Download,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Camera,
  RefreshCw,
  Building,
} from "lucide-react";

export default function AdminGate({ events = [], viewMode = "dashboard", user }) {
  const { showToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState(events[0]?._id || events[0]?.id || "");
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalPaid: 0,
    totalCheckedIn: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);

  // Scanner State
  const [scanInput, setScanInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Camera Scanning State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Keep selectedEventId valid if events list loads later
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0]._id || events[0].id);
    }
  }, [events, selectedEventId]);

  // Fetch real attendees and statistics from backend for the selected event
  const fetchAttendeesData = useCallback(async () => {
    if (!selectedEventId) return;

    try {
      setIsLoading(true);
      const res = await eventsApi.getAttendees(selectedEventId);
      if (res.success) {
        setAttendees(res.attendees || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }

      // Also try fetching revenue breakdown
      try {
        const revRes = await paymentsApi.getRevenue(selectedEventId);
        if (revRes.success) {
          setRevenueData(revRes);
        }
      } catch (e) {
        setRevenueData(null);
      }
    } catch (err) {
      console.warn("Error fetching attendee data:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchAttendeesData();
  }, [fetchAttendeesData]);

  const currentEvent =
    events.find((e) => (e._id || e.id) === selectedEventId) || events[0] || {};

  // Handle Ticket QR Verification via Real Backend API
  const handleVerifyToken = async (tokenToVerify) => {
    const token = (tokenToVerify || scanInput).trim();
    if (!token) return;

    try {
      setIsVerifying(true);
      setScanResult(null);

      const res = await eventsApi.verifyTicketQr({
        token,
        eventId: selectedEventId || undefined,
      });

      setScanResult({
        status: res.status || "valid",
        title: res.title || "VALID TICKET: Check-In Approved",
        message: res.message,
        ticket: res.ticket,
      });

      showToast(res.message, "success", "Gate Verified");
      setScanInput("");
      fetchAttendeesData();
    } catch (err) {
      const errorData = err.response?.data;
      const status = errorData?.status || "error";
      const title = errorData?.title || "REJECTED: Verification Failed";
      const message =
        errorData?.message || err.message || "Invalid ticket or server communication error.";

      setScanResult({
        status,
        title,
        message,
      });

      if (status === "duplicate") {
        showToast(message, "warning", "Duplicate Scan");
      } else {
        showToast(message, "error", "Access Denied");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    handleVerifyToken(scanInput);
  };

  const simulateScan = (ticketToken) => {
    setScanInput(ticketToken);
    handleVerifyToken(ticketToken);
  };

  // Optional Camera QR Stream
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
      return;
    }

    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError("Camera access unavailable. You can type or paste the QR token manually.");
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Export Attendees to CSV
  const exportCSV = () => {
    if (attendees.length === 0) {
      showToast("No attendees registered yet to export.", "info", "Export Notice");
      return;
    }

    const headers = [
      "Ticket ID",
      "QR Token",
      "Attendee Name",
      "Email",
      "Roll No",
      "Branch",
      "College",
      "Team Name",
      "Fee Status",
      "Fee Amount (INR)",
      "Checked In",
      "Check-in Time",
      "Registration Date",
    ];

    const rows = attendees.map((a) => [
      `"${a.ticketId || ""}"`,
      `"${a.qrToken || ""}"`,
      `"${a.student?.name || "Participant"}"`,
      `"${a.student?.email || ""}"`,
      `"${a.student?.rollNo || ""}"`,
      `"${a.student?.branch || ""}"`,
      `"${a.student?.college || ""}"`,
      `"${a.teamName || "Individual"}"`,
      `"${a.feeStatus || "Free"}"`,
      a.feeAmount || 0,
      a.checkedIn ? "Yes" : "No",
      `"${a.checkedInAt || "Pending"}"`,
      `"${new Date(a.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const eventName = (currentEvent.eventName || currentEvent.title || "Event").replace(/\s+/g, "_");
    link.setAttribute("download", `${eventName}_Attendees_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Attendee roster exported successfully!", "success", "CSV Downloaded");
  };

  const seatCap = currentEvent.seatLimit || 100;

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 bg-[#FAF9F6] text-[#18181B]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#C2410C] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Organizer Console • {user?.college || "Campus Node"}</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
            {viewMode === "scanner" ? "Gate QR Scanner Terminal" : "Admin Operations & Analytics"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl">
            {viewMode === "scanner"
              ? "Scan attendee digital QR passes at the entrance checkpoint with automated duplicate access detection."
              : "Audit registrations, view live fee collections, monitor attendee rosters, and export accreditation lists."}
          </p>
        </div>

        {/* Event Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
            className="bg-white border border-[#E4E2DD] text-xs text-zinc-800 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 font-bold focus:outline-none focus:border-[#E11D48] flex-1 sm:flex-none truncate shadow-sm"
          >
            {events.map((ev) => (
              <option key={ev._id || ev.id} value={ev._id || ev.id} className="bg-white text-zinc-900">
                {ev.eventName || ev.title}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAttendeesData}
            title="Refresh Live Data"
            disabled={isLoading}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-[#F3F1EC] border border-[#E4E2DD] text-zinc-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F3F1EC] text-zinc-800 border border-[#E4E2DD] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-colors shrink-0 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#047857]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Telemetry Stats Bar (2 col on mobile, 4 col on md+) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              Total Registered
            </span>
            <div className="font-headline text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
              {stats.totalRegistered}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-500">Cap: {seatCap}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center font-bold">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              Paid Registrations
            </span>
            <div className="font-headline text-xl sm:text-3xl font-extrabold text-[#C2410C] mt-1">
              {stats.totalPaid}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-500">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              Gate Check-Ins
            </span>
            <div className="font-headline text-xl sm:text-3xl font-extrabold text-[#047857] mt-1">
              {stats.totalCheckedIn}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-500">
              {stats.totalRegistered > 0
                ? `${Math.round((stats.totalCheckedIn / stats.totalRegistered) * 100)}% Verified`
                : "0%"}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E4E2DD] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              Participation
            </span>
            <div className="font-headline text-sm sm:text-lg font-extrabold text-[#18181B] mt-1">
              {currentEvent.eventType === "Team"
                ? `Squad ${currentEvent.minTeamSize}-${currentEvent.maxTeamSize}`
                : "Solo Entry"}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-500 truncate block max-w-[100px] sm:max-w-[120px]">
              {currentEvent.category || "General"}
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Panel Layout (Stacks on mobile/tablet, 2-panel on lg+) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Scanner Terminal */}
        <div
          className={`${
            viewMode === "scanner" ? "lg:col-span-7" : "lg:col-span-5"
          } bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#047857] animate-ping"></div>
              <h2 className="font-headline text-lg sm:text-xl font-bold text-[#18181B]">Live Gate Scanner Terminal</h2>
            </div>
            <button
              onClick={toggleCamera}
              className={`p-1.5 sm:p-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
                cameraActive
                  ? "bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]"
                  : "bg-white hover:bg-[#F3F1EC] text-zinc-700 border-[#E4E2DD] shadow-sm"
              }`}
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{cameraActive ? "Stop Camera" : "Scan via Camera"}</span>
            </button>
          </div>

          <p className="text-xs text-zinc-600 mb-4">
            Decode QR passes or input ticket tokens to record admission attendance and block duplicate entry attempts.
          </p>

          {/* Camera Viewport */}
          {cameraActive && (
            <div className="relative mb-4 sm:mb-5 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#E11D48] bg-black h-48 sm:h-56 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-[#047857]/70 m-4 sm:m-6 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-[#047857] bg-black/70 px-2 py-0.5 rounded">
                  ALIGN QR PASS IN RETICLE
                </span>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="mb-4 p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <form onSubmit={handleScanSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Ticket Token / QR Payload *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="e.g. UTSV-QR-... or TKT-2026-..."
                  className="w-full bg-[#FAF9F6] border border-[#E4E2DD] rounded-xl sm:rounded-2xl pl-3.5 pr-20 sm:pr-24 py-2.5 sm:py-3 text-xs text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] font-mono"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify Gate"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick simulation pills from registered attendees */}
          {attendees.length > 0 && (
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#E4E2DD]">
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 block mb-2 font-mono">
                Click Attendee to Simulate Live Gate Scan:
              </span>
              <div className="flex flex-col gap-2 max-h-44 sm:max-h-48 overflow-y-auto">
                {attendees.slice(0, 3).map((a) => (
                  <button
                    key={a._id}
                    onClick={() => simulateScan(a.qrToken || a.ticketId)}
                    className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FAF9F6] hover:bg-zinc-100 border border-[#E4E2DD] text-left text-xs text-zinc-800 flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="truncate">
                      <span className="font-bold text-[#18181B]">{a.student?.name}</span>
                      <span className="text-[10px] sm:text-[11px] text-zinc-500 ml-1.5 font-mono">
                        ({a.ticketId})
                      </span>
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ml-2 px-2 py-0.5 rounded border ${
                        a.checkedIn
                          ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                          : "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
                      }`}
                    >
                      {a.checkedIn ? "Checked In" : "Scan Code"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scan Result Feedback Alert */}
          {scanResult && (
            <div
              className={`mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs animate-slide-in ${
                scanResult.status === "valid"
                  ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
                  : scanResult.status === "duplicate"
                  ? "bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]"
                  : "bg-[#FFE4E6] border-[#FECDD3] text-[#BE123C]"
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm mb-1">
                {scanResult.status === "valid" && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                {scanResult.status === "duplicate" && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                {scanResult.status !== "valid" && scanResult.status !== "duplicate" && (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                )}
                <span>{scanResult.title}</span>
              </div>
              <p className="leading-relaxed text-[11px]">{scanResult.message}</p>
              {scanResult.ticket && (
                <div className="mt-2 pt-2 border-t border-[#A7F3D0] flex items-center justify-between text-[10px] font-mono">
                  <span>Pass: {scanResult.ticket.id}</span>
                  <span>Time: {scanResult.ticket.checkedInAt}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attendee Roster Table */}
        <div
          className={`${
            viewMode === "scanner" ? "lg:col-span-5" : "lg:col-span-7"
          } bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm`}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-[#18181B]">Live Attendee Roster</h2>
            <span className="text-[11px] sm:text-xs text-zinc-500 font-mono">{attendees.length} Verified Records</span>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs text-zinc-700 min-w-[480px]">
              <thead className="sticky top-0 bg-[#F3F1EC] text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-600 border-b border-[#E4E2DD] font-mono z-10">
                <tr>
                  <th className="py-2.5 px-3">Attendee</th>
                  <th className="py-2.5 px-3">Roll &amp; Branch</th>
                  <th className="py-2.5 px-3">Squad</th>
                  <th className="py-2.5 px-3">Fee Status</th>
                  <th className="py-2.5 px-3">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DD]">
                {isLoading && attendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#E11D48]" />
                      Loading live attendee records...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No student registrations found for this event yet.
                    </td>
                  </tr>
                ) : (
                  attendees.map((a) => (
                    <tr key={a._id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#18181B]">{a.student?.name || "Participant"}</div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
                          {a.student?.email}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600">
                        {a.student?.rollNo || "N/A"}{" "}
                        <span className="text-zinc-500">({a.student?.branch || "General"})</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#C2410C] font-mono text-[10px] sm:text-[11px] font-bold">
                        {a.teamName || "Individual"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border ${
                            a.feeStatus === "Paid"
                              ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                              : "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]"
                          }`}
                        >
                          {a.feeStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {a.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#047857] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
                            <span>{a.checkedInAt || "Verified"}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-medium font-mono">
                            Pending Gate
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
