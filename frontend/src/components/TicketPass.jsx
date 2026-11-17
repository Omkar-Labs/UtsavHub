import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { eventsApi } from "../api/events";
import { useToast } from "../context/ToastContext";
import {
  Ticket,
  Printer,
  RotateCw,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  Users,
  ShieldCheck,
  AlertCircle,
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
      <div className="max-w-4xl mx-auto px-4 py-24 text-center bg-[#131211] text-[#fcfaf6]">
        <Loader2 className="w-10 h-10 text-[#ff4d2e] animate-spin mx-auto mb-3" />
        <h2 className="font-headline text-xl font-bold text-white">Loading Digital Passes...</h2>
        <p className="text-xs text-stone-400 mt-1">Retrieving official QR admission passes from campus registry.</p>
      </div>
    );
  }

  if (!activeTicket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center bg-[#131211] text-[#fcfaf6]">
        <div className="w-16 h-16 rounded-3xl bg-[#1e1b18] border-2 border-[#38332d] flex items-center justify-center text-stone-500 mx-auto mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-white">No Active Event Passes Found</h2>
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
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-[#131211] text-[#fcfaf6]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#f59e0b]">
            Collegiate Ticket Stubs
          </span>
          <h1 className="font-headline text-3xl font-extrabold text-white mt-1">
            My Digital Passes &amp; QR Credentials
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Official collegiate admission credentials. Present the scannable QR code at the venue gate for instant check-in.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTickets}
            title="Refresh passes"
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-[#23201c] hover:bg-[#2c2824] text-stone-300 border-2 border-[#38332d] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#ff4d2e] hover:bg-[#e63d1e] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors shadow-md shadow-[#ff4d2e]/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Pass</span>
          </button>
        </div>
      </div>

      {/* Ticket Selector Tabs (if multiple tickets) */}
      {tickets.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {tickets.map((t, idx) => (
            <button
              key={t.id || idx}
              onClick={() => setSelectedTicketIndex(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border-2 ${
                selectedTicketIndex === idx
                  ? "bg-[#ff4d2e] text-white border-[#ff4d2e] shadow-md"
                  : "bg-[#1a1815] text-stone-400 border-[#2c2824] hover:text-white"
              }`}
            >
              {t.eventTitle || "Event"} ({t.id})
            </button>
          ))}
        </div>
      )}

      {/* Retro Ticket Pass Card */}
      <div className="max-w-4xl mx-auto bg-[#1a1815] border-2 border-[#38332d] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative">
        {/* Left 8 Cols */}
        <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6 border-b-2 md:border-b-0 md:border-r-2 border-[#2b2723] relative">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] text-[11px] font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></span>
                <span>UTSAVHUB ADMIT ONE PASS</span>
              </div>
              <span className="text-xs font-mono text-stone-400 font-bold">{activeTicket.id}</span>
            </div>

            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {activeTicket.eventTitle}
            </h2>
            <p className="text-xs text-[#ff4d2e] font-bold mt-1">
              Official Collegiate Admission Node • {activeTicket.college}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#131211] border border-[#2b2723] text-xs">
            <div>
              <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                Attendee
              </span>
              <span className="font-bold text-white mt-0.5 block truncate">
                {activeTicket.attendeeName || user?.name}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {activeTicket.rollNo || user?.rollNo}
              </span>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                Department
              </span>
              <span className="font-bold text-white mt-0.5 block">
                {activeTicket.branch || user?.branch}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {activeTicket.college || user?.college}
              </span>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                Squad Info
              </span>
              <span className="font-bold text-[#f59e0b] mt-0.5 block truncate">
                {activeTicket.teamName || "Individual Participant"}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {activeTicket.teamMembers?.length ? `${activeTicket.teamMembers.length} Members` : "Solo"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                Date
              </span>
              <span className="font-bold text-white mt-0.5 block">
                {activeTicket.date || "Upcoming"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                Time
              </span>
              <span className="font-bold text-white mt-0.5 block">
                {activeTicket.time || "See Schedule"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block font-mono">
                Venue
              </span>
              <span className="font-bold text-white mt-0.5 block truncate">
                {activeTicket.venue || "Campus Main Venue"}
              </span>
            </div>
          </div>

          {/* Payment Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2b2723] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Payment Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {activeTicket.feeStatus} ({activeTicket.feeAmount === 0 ? "Free" : `₹${activeTicket.feeAmount}`})
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-400">
              Token: {activeTicket.qrToken ? `${activeTicket.qrToken.slice(0, 16)}...` : activeTicket.id}
            </span>
          </div>
        </div>

        {/* Right 4 Cols: REAL SCANNABLE QR CODE */}
        <div className="md:col-span-4 p-6 sm:p-8 bg-[#161412] flex flex-col items-center justify-between gap-5 text-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-stone-400 block mb-1 font-mono">
              Venue Check-In QR
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                activeTicket.checkedIn
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-[#ff4d2e]/20 text-[#ff4d2e] border border-[#ff4d2e]/40"
              }`}
            >
              {activeTicket.checkedIn
                ? `✓ Checked In (${activeTicket.checkedInAt || "Verified"})`
                : "Ready for Scan at Gate"}
            </span>
          </div>

          {/* REAL QR CODE VIA qrcode.react */}
          <div className="p-3.5 rounded-2xl bg-white shadow-xl flex items-center justify-center transition-transform hover:scale-105">
            <QRCodeSVG
              value={activeTicket.qrToken || activeTicket.id}
              size={154}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="w-full">
            <div className="p-2.5 rounded-xl bg-[#23201c] border border-[#38332d] text-center mb-2">
              <span className="font-mono text-[11px] font-bold text-stone-200 block truncate">
                {activeTicket.qrToken || activeTicket.id}
              </span>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">
                Cryptographic Gate Signature
              </span>
            </div>
            <p className="text-[10px] text-stone-500 leading-tight">
              Present this pass at the gate. Organizer gate scanners decode this token to authenticate admission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
