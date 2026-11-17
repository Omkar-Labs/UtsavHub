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
    gradient: "from-cyan-400 via-sky-400 to-blue-500",
    glow: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
  },
  {
    label: "Cultural Fests",
    icon: Music,
    gradient: "from-pink-400 via-rose-400 to-red-500",
    glow: "bg-pink-500/20 border-pink-500/30 text-pink-300",
  },
  {
    label: "Sports Meets",
    icon: Trophy,
    gradient: "from-amber-300 via-orange-400 to-red-500",
    glow: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  },
  {
    label: "Tech Workshops",
    icon: Cpu,
    gradient: "from-violet-400 via-purple-400 to-indigo-500",
    glow: "bg-violet-500/20 border-violet-500/30 text-violet-300",
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
    <div className="relative min-h-screen bg-[#09090B] text-white overflow-hidden selection:bg-violet-500/30">
      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Sticky Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090B]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 font-bold text-white shadow-lg shadow-violet-500/25">
              U
            </div>
            <span className="text-xl font-bold tracking-tight">
              Utsav<span className="text-violet-400">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAdminAuth}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Organiser Portal
            </button>
            <button
              onClick={onStudentAuth}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
            >
              Student Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-20 pb-24 text-center md:pt-28">
        {/* Top Live Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Verified Campus Network • Domain-Protected Access
        </motion.div>

        {/* Kinetic Typography Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
        >
          <span className="block text-white">Discover &amp; Join Campus</span>

          {/* Dynamic Cycling Row with Morphing Icon */}
          <span className="my-2 flex h-[1.35em] items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.label}
                initial={{ y: 36, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -36, opacity: 0, filter: "blur(8px)" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                }}
                className="inline-flex items-center gap-3 md:gap-4"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border md:h-14 md:w-14 ${current.glow}`}
                >
                  <ActiveIcon className="h-6 w-6 md:h-8 md:w-8" />
                </span>
                <span
                  className={`bg-gradient-to-r ${current.gradient} bg-clip-text text-transparent`}
                >
                  {current.label}
                </span>
              </motion.span>
            </AnimatePresence>
          </span>

          <span className="block text-white">&amp; Build Your Dream Squad.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          Explore intra- and inter-college events, match automatically with solo
          teammates via <span className="text-zinc-200 font-medium">Team Maker</span>,
          and unlock instant QR gate passes—all verified with your college email.
        </motion.p>

        {/* Primary & Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            onClick={onStudentAuth}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95 active:scale-95"
          >
            Explore Campus Events
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onAdminAuth}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-zinc-200 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-violet-400" />
            Host a College Event
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
              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
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
          className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>College Domain Verified</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            <Users className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Auto Solo-to-Team Match</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            <QrCode className="h-4 w-4 text-violet-400 shrink-0" />
            <span>Instant QR Gate Entry</span>
          </div>
        </motion.div>

        {/* Verified College Domains Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Built for verified campus communities
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {VERIFIED_DOMAINS.map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-white/10 bg-zinc-900/80 px-3 py-1 font-mono text-xs text-zinc-400"
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
