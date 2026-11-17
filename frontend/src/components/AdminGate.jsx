import React, { useState, useEffect, useCallback, useRef } from "react";
import { eventsApi } from "../api/events";
import { paymentsApi } from "../api/payments";
import { useToast } from "../context/ToastContext";
import {
  ShieldCheck,
  QrCode,
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
  Calendar,
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
        // Event might be free or no payments recorded yet
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

      // API returned 200 with valid status
      setScanResult({
        status: res.status || "valid",
        title: res.title || "VALID TICKET: Check-In Approved",
        message: res.message,
        ticket: res.ticket,
      });

      showToast(res.message, "success", "Gate Verified");
      setScanInput("");

      // Refresh attendee list to update check-in badges
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
      setCameraError("Camera access denied or unavailable. You can enter or paste the QR token manually.");
      setCameraActive(false);
    }
  };

  // Clean up camera on unmount
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

  const eventName = currentEvent.eventName || currentEvent.title || "Campus Event";
  const seatCap = currentEvent.seatLimit || 100;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-[#131211] text-[#fcfaf6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Organizer Console • {user?.college || "Campus Node"}</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight">
            {viewMode === "scanner" ? "Gate QR Scanner Terminal" : "Admin Operations & Analytics"}
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            {viewMode === "scanner"
              ? "Scan attendee digital QR passes at the entrance checkpoint with automated duplicate access detection."
              : "Audit registrations, view live fee collections, monitor attendee rosters, and export accreditation lists."}
          </p>
        </div>

        {/* Event Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
            className="bg-[#1a1815] border-2 border-[#2c2824] text-xs text-white rounded-2xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#f59e0b]"
          >
            {events.map((ev) => (
              <option key={ev._id || ev.id} value={ev._id || ev.id}>
                {ev.eventName || ev.title}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAttendeesData}
            title="Refresh Live Data"
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-[#23201c] hover:bg-[#2c2824] border-2 border-[#38332d] text-stone-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-[#23201c] hover:bg-[#2c2824] text-stone-200 border-2 border-[#38332d] px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-[#10b981]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-[#1a1815] border-2 border-[#2c2824] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono">
              Total Registered
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {stats.totalRegistered}
            </div>
            <span className="text-[11px] text-stone-400">Cap: {seatCap}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#ff4d2e]/15 text-[#ff4d2e] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1a1815] border-2 border-[#2c2824] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono">
              Paid Registrations
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-extrabold text-[#f59e0b] mt-1">
              {stats.totalPaid}
            </div>
            <span className="text-[11px] text-stone-400">
              ₹{stats.totalRevenue.toLocaleString("en-IN")} Revenue
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1a1815] border-2 border-[#2c2824] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono">
              Gate Check-Ins
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-extrabold text-[#10b981] mt-1">
              {stats.totalCheckedIn}
            </div>
            <span className="text-[11px] text-stone-400">
              {stats.totalRegistered > 0
                ? `${Math.round((stats.totalCheckedIn / stats.totalRegistered) * 100)}% Verified`
                : "0%"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1a1815] border-2 border-[#2c2824] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono">
              Participation
            </span>
            <div className="font-headline text-lg font-extrabold text-white mt-1">
              {currentEvent.eventType === "Team"
                ? `Squad ${currentEvent.minTeamSize}-${currentEvent.maxTeamSize}`
                : "Solo Entry"}
            </div>
            <span className="text-[11px] text-stone-400 truncate block max-w-[120px]">
              {currentEvent.category || "General"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#23201c] text-stone-300 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scanner Terminal */}
        <div
          className={`${
            viewMode === "scanner" ? "lg:col-span-7" : "lg:col-span-5"
          } bg-[#1a1815] border-2 border-[#2c2824] rounded-3xl p-6 sm:p-7 shadow-xl`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981] animate-ping"></div>
              <h2 className="font-headline text-xl font-bold text-white">Live Gate Scanner Terminal</h2>
            </div>
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                cameraActive
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-[#23201c] hover:bg-[#2c2824] text-stone-300 border-[#38332d]"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? "Stop Camera" : "Scan via Camera"}</span>
            </button>
          </div>

          <p className="text-xs text-stone-400 mb-4">
            Decode QR codes or input ticket tokens to record admission attendance and block duplicate entry attempts.
          </p>

          {/* Camera Viewport (Optional) */}
          {cameraActive && (
            <div className="relative mb-5 rounded-2xl overflow-hidden border-2 border-[#ff4d2e] bg-black h-56 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-[#10b981]/70 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-[#10b981] bg-black/70 px-2 py-0.5 rounded">
                  ALIGN QR PASS IN RETICLE
                </span>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <form onSubmit={handleScanSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Ticket Token / QR Payload *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="e.g. UTSV-QR-... or TKT-2026-..."
                  className="w-full bg-[#23201c] border border-[#38332d] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#f59e0b] font-mono"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-stone-950 text-xs font-extrabold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify Gate Entry"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick simulation pills from registered attendees */}
          {attendees.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#2b2723]">
              <span className="text-[11px] font-bold text-stone-400 block mb-2 font-mono">
                Click Attendee to Simulate Live Gate Scan:
              </span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {attendees.slice(0, 3).map((a) => (
                  <button
                    key={a._id}
                    onClick={() => simulateScan(a.qrToken || a.ticketId)}
                    className="p-3 rounded-2xl bg-[#23201c] hover:bg-[#2c2824] border border-[#38332d] text-left text-xs text-stone-300 flex items-center justify-between transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-bold text-white">{a.student?.name}</span>
                      <span className="text-[11px] text-stone-400 ml-2 font-mono">
                        ({a.ticketId})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold shrink-0 ml-2 px-2 py-0.5 rounded ${
                        a.checkedIn ? "bg-emerald-500/20 text-emerald-300" : "bg-[#f59e0b]/20 text-[#f59e0b]"
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
              className={`mt-6 p-4 rounded-2xl border-2 text-xs animate-slide-in ${
                scanResult.status === "valid"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : scanResult.status === "duplicate"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-red-500/15 border-red-500/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                {scanResult.status === "valid" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {scanResult.status === "duplicate" && <AlertTriangle className="w-5 h-5 shrink-0" />}
                {scanResult.status !== "valid" && scanResult.status !== "duplicate" && (
                  <XCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{scanResult.title}</span>
              </div>
              <p className="leading-relaxed text-[11px]">{scanResult.message}</p>
              {scanResult.ticket && (
                <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[10px] font-mono">
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
          } bg-[#1a1815] border-2 border-[#2c2824] rounded-3xl p-6 sm:p-7 shadow-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-xl font-bold text-white">Live Attendee Roster</h2>
            <span className="text-xs text-stone-400 font-mono">{attendees.length} Verified Records</span>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="sticky top-0 bg-[#23201c] text-[10px] uppercase tracking-wider text-stone-400 border-b border-[#38332d] font-mono z-10">
                <tr>
                  <th className="py-3 px-3">Attendee</th>
                  <th className="py-3 px-3">Roll &amp; Branch</th>
                  <th className="py-3 px-3">Squad</th>
                  <th className="py-3 px-3">Fee Status</th>
                  <th className="py-3 px-3">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2723]">
                {isLoading && attendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#f59e0b]" />
                      Loading live attendee records...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      No student registrations found for this event yet.
                    </td>
                  </tr>
                ) : (
                  attendees.map((a) => (
                    <tr key={a._id} className="hover:bg-[#23201c]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{a.student?.name || "Participant"}</div>
                        <div className="text-[10px] text-stone-500 font-mono truncate max-w-[120px]">
                          {a.student?.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-stone-400">
                        {a.student?.rollNo || "N/A"}{" "}
                        <span className="text-stone-500">({a.student?.branch || "General"})</span>
                      </td>
                      <td className="py-3 px-3 text-[#f59e0b] font-mono text-[11px] font-bold">
                        {a.teamName || "Individual"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            a.feeStatus === "Paid"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {a.feeStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {a.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                            <span>{a.checkedInAt || "Verified"}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-medium font-mono">
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
