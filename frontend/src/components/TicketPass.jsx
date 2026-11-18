import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { eventsApi } from "../api/events";
import { useToast } from "../context/ToastContext";
import {
  Ticket,
  Printer,
  RotateCw,
  Loader2,
} from "lucide-react";

export default function TicketPass({ tickets: propTickets = [], user }) {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState(propTickets);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);

  // Fetch real tickets from backend
  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await eventsApi.getMyTickets();
      if (res.success && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.warn("Could not fetch tickets from backend:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Keep local state in sync if parent passes updated propTickets
  useEffect(() => {
    if (propTickets.length > 0 && tickets.length === 0) {
      setTickets(propTickets);
    }
  }, [propTickets]);

  const activeTicket = tickets[selectedTicketIndex] || null;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && tickets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-24 text-center bg-[#131211] text-[#fcfaf6]">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff4d2e] animate-spin mx-auto mb-3" />
        <h2 className="font-headline text-lg sm:text-xl font-bold text-white">Loading Digital Passes...</h2>
        <p className="text-xs text-stone-400 mt-1">Retrieving official QR admission passes from campus registry.</p>
      </div>
    );
  }

  if (!activeTicket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center bg-[#131211] text-[#fcfaf6]">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-[#1e1b18] border-2 border-[#38332d] flex items-center justify-center text-stone-500 mx-auto mb-3 sm:mb-4">
          <Ticket className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="font-headline text-xl sm:text-2xl font-bold text-white">No Active Event Passes Found</h2>
        <p className="text-xs text-stone-400 mt-1.5 max-w-sm mx-auto">
          You haven't registered for any events yet. Explore events on the directory and register to claim your verified QR pass.
        </p>
        <button
          onClick={fetchTickets}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#23201c] hover:bg-[#2c2824] text-xs font-bold text-stone-300 border border-[#38332d] transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Passes</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 bg-[#FAF9F6] text-[#18181B]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C2410C]">
            Collegiate Ticket Stubs
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
            My Digital Passes &amp; QR Credentials
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Official collegiate admission credentials. Present the scannable QR code at the venue gate for instant check-in.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchTickets}
            title="Refresh passes"
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F3F1EC] text-zinc-700 border border-[#E4E2DD] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#18181B] hover:bg-zinc-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Ticket Selector Tabs (Horizontal Scrollable for mobile) */}
      {tickets.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
          {tickets.map((t, idx) => (
            <button
              key={t.id || idx}
              onClick={() => setSelectedTicketIndex(idx)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                selectedTicketIndex === idx
                  ? "bg-[#E11D48] text-white border-[#E11D48] shadow-sm"
                  : "bg-white text-zinc-600 border-[#E4E2DD] hover:bg-[#F3F1EC] shadow-sm"
              }`}
            >
              {t.eventTitle || "Event"} ({t.id})
            </button>
          ))}
        </div>
      )}

      {/* Retro Ticket Pass Card (Stack on mobile, 2-column on tablet/desktop) */}
      <div className="max-w-4xl mx-auto bg-white border border-[#E4E2DD] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 relative">
        {/* Left 8 Cols (Attendee & Event Details) */}
        <div className="md:col-span-8 p-4 sm:p-8 flex flex-col justify-between gap-4 sm:gap-6 border-b md:border-b-0 md:border-r border-[#E4E2DD] relative">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[10px] sm:text-[11px] font-bold font-mono">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#047857] animate-pulse"></span>
                <span>UTSAVHUB ADMIT ONE PASS</span>
              </div>
              <span className="text-[11px] sm:text-xs font-mono text-zinc-500 font-bold">{activeTicket.id}</span>
            </div>

            <h2 className="font-headline text-xl sm:text-3xl font-extrabold text-[#18181B] leading-tight">
              {activeTicket.eventTitle}
            </h2>
            <p className="text-xs text-[#E11D48] font-bold mt-1">
              Official Collegiate Admission Node • {activeTicket.college}
            </p>
          </div>

          {/* Details Grid (2 col on mobile, 3 col on sm+) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF9F6] border border-[#E4E2DD] text-xs">
            <div>
              <span className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block font-mono">
                Attendee
              </span>
              <span className="font-bold text-zinc-900 mt-0.5 block truncate">
                {activeTicket.attendeeName || user?.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono truncate block">
                {activeTicket.rollNo || user?.rollNo}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block font-mono">
                Department
              </span>
              <span className="font-bold text-zinc-900 mt-0.5 block truncate">
                {activeTicket.branch || user?.branch}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono truncate block">
                {activeTicket.college || user?.college}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block font-mono">
                Squad Info
              </span>
              <span className="font-bold text-[#C2410C] mt-0.5 block truncate">
                {activeTicket.teamName || "Individual Participant"}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block">
                {activeTicket.teamMembers?.length ? `${activeTicket.teamMembers.length} Members` : "Solo"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block font-mono">
                Date
              </span>
              <span className="font-bold text-zinc-900 mt-0.5 block">
                {activeTicket.date || "Upcoming"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block font-mono">
                Time
              </span>
              <span className="font-bold text-zinc-900 mt-0.5 block">
                {activeTicket.time || "See Schedule"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block font-mono">
                Venue
              </span>
              <span className="font-bold text-zinc-900 mt-0.5 block truncate">
                {activeTicket.venue || "Campus Venue"}
              </span>
            </div>
          </div>

          {/* Payment Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-[#E4E2DD] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px] sm:text-xs">Payment:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                {activeTicket.feeStatus} ({activeTicket.feeAmount === 0 ? "Free" : `₹${activeTicket.feeAmount}`})
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-500 truncate max-w-[150px] sm:max-w-none">
              Token: {activeTicket.qrToken ? `${activeTicket.qrToken.slice(0, 16)}...` : activeTicket.id}
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Real QR Code Stamp */}
        <div className="md:col-span-4 p-5 sm:p-8 bg-[#F3F1EC] flex flex-col items-center justify-between gap-4 text-center">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-extrabold text-zinc-500 block mb-1 font-mono">
              Venue Check-In QR
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold font-mono ${
                activeTicket.checkedIn
                  ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                  : "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
              }`}
            >
              {activeTicket.checkedIn
                ? `✓ Checked In (${activeTicket.checkedInAt || "Verified"})`
                : "Ready for Scan at Gate"}
            </span>
          </div>

          {/* Real QR Code via qrcode.react */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white shadow-sm border border-[#E4E2DD] flex items-center justify-center transition-transform hover:scale-105">
            <QRCodeSVG
              value={activeTicket.qrToken || activeTicket.id}
              size={135}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="w-full">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E4E2DD] text-center mb-1.5 shadow-sm">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-zinc-900 block truncate">
                {activeTicket.qrToken || activeTicket.id}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                Cryptographic Gate Signature
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 leading-tight">
              Present this pass at the gate. Organizer gate scanners decode this token to authenticate admission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
