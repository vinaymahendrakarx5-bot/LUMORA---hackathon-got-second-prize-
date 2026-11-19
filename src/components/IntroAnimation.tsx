import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SkipForward } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const PHASES = [
  { at: 0, text: 'Initializing Knowledge Graphs...' },
  { at: 1000, text: 'Calculating Prerequisite Paths...' },
  { at: 2000, text: 'Calibrating Classes 5th–10th Curricula...' },
  { at: 2700, text: 'Welcome to LUMORA!' },
];

const CONSTELLATION_NODES = [
  { id: 'n1', x: 18, y: 28, delay: 0.15, label: 'Foundations' },
  { id: 'n2', x: 34, y: 18, delay: 0.35, label: 'Algebra' },
  { id: 'n3', x: 66, y: 22, delay: 0.55, label: 'Geometry' },
  { id: 'n4', x: 82, y: 34, delay: 0.75, label: 'Mastery' },
  { id: 'n5', x: 24, y: 74, delay: 0.45, label: 'Matter' },
  { id: 'n6', x: 76, y: 72, delay: 0.65, label: 'Optics' },
];

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(PHASES[0].text);
  const [isExiting, setIsExiting] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const startTime = performance.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= 2700) {
        setStatusText(PHASES[3].text);
      } else if (elapsed >= 2000) {
        setStatusText(PHASES[2].text);
      } else if (elapsed >= 1000) {
        setStatusText(PHASES[1].text);
      } else {
        setStatusText(PHASES[0].text);
      }

      if (elapsed >= duration && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          onCompleteRef.current();
        }, 380);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      onCompleteRef.current();
    }, 200);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="lumora-intro-overlay"
          data-testid="intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-zinc-950 text-zinc-100 select-none"
        >
          {/* Cosmic Ambient Background Lighting */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{
                scale: [1, 1.24, 1.1],
                opacity: [0.24, 0.44, 0.3],
              }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-orange-600/25 via-amber-500/20 to-yellow-300/15 blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.08, 0.22, 0.14] }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="absolute right-[12%] top-[14%] h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl"
            />
          </div>

          {/* Constellation Pathways SVG */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 12 30 Q 25 14 40 20 T 66 20 T 86 34"
              fill="none"
              stroke="url(#lumora-intro-grad)"
              strokeWidth="0.18"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 2.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M 18 76 Q 36 88 52 80 T 82 72"
              fill="none"
              stroke="url(#lumora-intro-cyan)"
              strokeWidth="0.16"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 2.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="lumora-intro-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="lumora-intro-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Knowledge Network Nodes Lighting Up */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            {CONSTELLATION_NODES.map((node) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.9, 0.65], scale: [0.6, 1.05, 1] }}
                transition={{ duration: 0.9, delay: node.delay, ease: 'easeOut' }}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                <span className="font-mono text-[11px] tracking-wide text-zinc-400">
                  {node.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Skip Intro Button */}
          <div className="absolute right-6 top-6 z-20">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-amber-500/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
            >
              <span>Skip Intro</span>
              <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Central Choreographed Emblem + Wordmark */}
          <div className="relative z-10 flex max-w-xl flex-col items-center px-6 text-center">
            {/* Expanding Radial Shockwaves + Golden Crystal Emblem (0.0s - 1.0s) */}
            <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.3, opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut', repeat: 1 }}
                className="absolute inset-0 rounded-full border border-amber-400/50"
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0.7 }}
                animate={{ scale: 1.85, opacity: 0 }}
                transition={{ duration: 1.4, delay: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-cyan-400/40"
              />

              <motion.div
                initial={{ scale: 0.4, opacity: 0, rotate: -18 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 shadow-[0_0_48px_rgba(245,158,11,0.28)]"
              >
                <svg
                  viewBox="0 0 64 64"
                  className="h-14 w-14"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="crystal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde68a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="32,6 54,24 44,56 20,56 10,24"
                    fill="url(#crystal-gold)"
                    fillOpacity="0.22"
                    stroke="#fbbf24"
                    strokeWidth="2.2"
                  />
                  <polyline
                    points="32,6 32,34 54,24"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="1.6"
                    strokeOpacity="0.85"
                  />
                  <polyline
                    points="10,24 32,34 44,56"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.6"
                    strokeOpacity="0.85"
                  />
                  <line
                    x1="32"
                    y1="34"
                    x2="20"
                    y2="56"
                    stroke="#fbbf24"
                    strokeWidth="1.6"
                    strokeOpacity="0.7"
                  />
                </svg>
              </motion.div>
            </div>

            {/* 1.0s - 2.0s: Wordmark, Subtitle & Curriculum Markers */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-5xl font-extrabold tracking-[0.18em] text-transparent sm:text-6xl"
            >
              LUMORA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 text-base font-medium text-zinc-200 sm:text-lg"
            >
              Prerequisite-Aware Learning Maps
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.35 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide text-amber-300/90 sm:text-sm"
            >
              <span>Classes 5th to 10th</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>CBSE &amp; SSC</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Shortest-Path Mastery</span>
            </motion.div>

            {/* 2.0s - 3.0s: Progress Bar & 4-Stage Status */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 w-full max-w-sm"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                <span>{statusText}</span>
                <span className="font-mono tabular-nums text-amber-300">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/90">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 transition-[width] duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
