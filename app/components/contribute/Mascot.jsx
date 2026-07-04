"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * "Beacon" — a small animated guide character for the contribute flow.
 * Pure SVG + framer-motion (no image assets required). Supports flipping so it
 * can "face" the form from either side, and shows a contextual speech bubble.
 */
export default function Mascot({ message, flip = false, className = "" }) {
  return (
    <div
      className={`flex items-end gap-3 ${flip ? "flex-row-reverse" : ""} ${className}`}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="shrink-0"
        style={{ transform: flip ? "scaleX(-1)" : "none" }}
      >
        <svg width="76" height="90" viewBox="0 0 76 90" fill="none" aria-hidden="true">
          <line x1="38" y1="16" x2="38" y2="6" stroke="#b45309" strokeWidth="2" />
          <motion.circle
            cx="38"
            cy="5"
            r="4"
            fill="#f59e0b"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <rect x="14" y="16" width="48" height="40" rx="14" fill="#fde68a" stroke="#b45309" strokeWidth="2" />

          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.85, 0.9, 1] }}
            style={{ transformOrigin: "center 34px" }}
          >
            <circle cx="30" cy="34" r="4.5" fill="#78350f" />
            <circle cx="46" cy="34" r="4.5" fill="#78350f" />
          </motion.g>

          <path d="M30 44 Q38 50 46 44" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          <rect x="20" y="58" width="36" height="26" rx="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />

          <motion.g
            style={{ transformOrigin: "56px 64px" }}
            animate={{ rotate: [0, 18, 0, 18, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="56" y1="64" x2="68" y2="58" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
            <circle cx="69" cy="57" r="3.5" fill="#f59e0b" />
          </motion.g>

          <line x1="20" y1="64" x2="10" y2="70" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          <circle cx="9" cy="71" r="3.5" fill="#f59e0b" />
        </svg>
      </motion.div>

      <div className="relative mb-2 max-w-[240px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className={`relative border border-amber-200 bg-white/90 px-4 py-3 text-sm leading-snug text-amber-900 shadow-sm backdrop-blur ${
              flip
                ? "rounded-2xl rounded-br-sm"
                : "rounded-2xl rounded-bl-sm"
            }`}
          >
            {message}
            <span
              className={`absolute bottom-2 h-3 w-3 rotate-45 bg-white/90 ${
                flip
                  ? "-right-1.5 border-b border-r border-amber-200"
                  : "-left-1.5 border-b border-l border-amber-200"
              }`}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
