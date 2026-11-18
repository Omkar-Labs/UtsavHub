import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  Music,
  Trophy,
  Cpu,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Users,
  QrCode,
} from "lucide-react";

const EVENT_CATEGORIES = [
  {
    label: "Hackathons",
    icon: Code2,
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    glow: "bg-blue-50 border-blue-200 text-blue-600",
  },
  {
    label: "Cultural Fests",
    icon: Music,
    gradient: "from-[#E11D48] via-rose-500 to-red-600",
    glow: "bg-rose-50 border-rose-200 text-[#E11D48]",
  },
  {
    label: "Sports Meets",
    icon: Trophy,
    gradient: "from-amber-600 via-orange-500 to-red-600",
    glow: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    label: "Tech Workshops",
    icon: Cpu,
    gradient: "from-purple-600 via-violet-600 to-indigo-600",
    glow: "bg-purple-50 border-purple-200 text-purple-600",
  },
];

const VERIFIED_DOMAINS = [
  "@ietlucknow.ac.in",
  "@iitk.ac.in",
  "@du.ac.in",
  "@nitk.edu.in",
  "@bits-pilani.ac.in",
];

export default function LandingHero({ onStudentAuth, onAdminAuth, onExploreGuest }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % EVENT_CATEGORIES.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const current = EVENT_CATEGORIES[index];
  const ActiveIcon = current.icon;

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#18181B] overflow-hidden selection:bg-[#FFE4E6] selection:text-[#E11D48]">
      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[350px] sm:h-[500px] w-[95vw] sm:w-[800px] rounded-full bg-[#E11D48]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[250px] sm:h-[400px] w-[300px] sm:w-[500px] rounded-full bg-[#F43F5E]/5 blur-[100px]" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#18181B 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#E4E2DD] bg-[#FAF9F6]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img
              src="/favicon.svg"
              alt="UtsavHub Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm"
            />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#18181B]">
              Utsav<span className="text-[#E11D48]">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onAdminAuth}
              className="rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 border border-transparent"
            >
              Organiser
            </button>
            <button
              onClick={onStudentAuth}
              className="rounded-lg bg-[#18181B] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-95 shadow-sm"
            >
              Student Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center md:pt-28">
        {/* Top Live Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-[#E4E2DD] bg-white px-3 sm:px-4 py-1 text-[11px] sm:text-xs font-medium text-[#18181B] shadow-sm max-w-full truncate"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="truncate">Verified Campus Network • Domain-Protected Access</span>
        </motion.div>

        {/* Kinetic Typography Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight sm:leading-tight"
        >
          <span className="block text-[#18181B]">Discover &amp; Join Campus</span>

          {/* Dynamic Cycling Row with Morphing Icon */}
          <span className="my-1.5 sm:my-2 flex h-[1.35em] items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.label}
                initial={{ y: 32, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -32, opacity: 0, filter: "blur(8px)" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                }}
                className="inline-flex items-center gap-2 sm:gap-3 md:gap-4"
              >
                <span
                  className={`flex h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl sm:rounded-2xl border ${current.glow} shadow-sm`}
                >
                  <ActiveIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </span>
                <span
                  className={`bg-gradient-to-r ${current.gradient} bg-clip-text text-transparent`}
                >
                  {current.label}
                </span>
              </motion.span>
            </AnimatePresence>
          </span>

          <span className="block text-[#18181B]">&amp; Build Your Dream Squad.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-zinc-600 px-2"
        >
          Explore intra- and inter-college events, match automatically with solo
          teammates via <span className="text-[#18181B] font-semibold">Team Maker</span>,
          and unlock instant QR gate passes—all verified with your college credentials.
        </motion.p>

        {/* Primary & Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <button
            onClick={onStudentAuth}
            className="w-full sm:w-auto group flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] px-6 sm:px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md shadow-[#E11D48]/20 transition hover:opacity-95 active:scale-95"
          >
            <span>Explore Campus Events</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onAdminAuth}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-semibold text-zinc-800 transition active:scale-95 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-[#E11D48]" />
            <span>Host a College Event</span>
          </button>
        </motion.div>

        {/* Guest Explore link */}
        {onExploreGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <button
              onClick={onExploreGuest}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 transition-colors"
            >
              Or preview event directory as guest
            </button>
          </motion.div>
        )}

        {/* Feature Highlights Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 sm:mt-16 grid w-full max-w-3xl grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left sm:text-center"
        >
          <div className="flex items-center sm:justify-center gap-2.5 rounded-xl border border-[#E4E2DD] bg-white px-4 py-3 text-xs sm:text-sm text-zinc-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#047857] shrink-0" />
            <span>College Domain Verified</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2.5 rounded-xl border border-[#E4E2DD] bg-white px-4 py-3 text-xs sm:text-sm text-zinc-700 shadow-sm">
            <Users className="h-4 w-4 text-[#E11D48] shrink-0" />
            <span>Auto Solo-to-Team Match</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2.5 rounded-xl border border-[#E4E2DD] bg-white px-4 py-3 text-xs sm:text-sm text-zinc-700 shadow-sm">
            <QrCode className="h-4 w-4 text-zinc-900 shrink-0" />
            <span>Instant QR Gate Entry</span>
          </div>
        </motion.div>

        {/* Verified College Domains Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 sm:mt-14 flex flex-col items-center gap-3 w-full"
        >
          <span className="text-[11px] sm:text-xs uppercase tracking-widest text-zinc-500 font-mono">
            Built for verified campus communities
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-lg">
            {VERIFIED_DOMAINS.map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-[#E4E2DD] bg-white px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-xs text-zinc-700 shadow-sm"
              >
                {domain}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
