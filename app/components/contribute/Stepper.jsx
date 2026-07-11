"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Vertical stepper shown to the left of the form. Only a window of 3 steps is
 * visible at a time (current + the one above and below). The current step is
 * fully visible; neighbours are dimmed. Ellipses hint at hidden steps.
 */
export default function Stepper({ steps, current, windowSize = 3 }) {
  const total = steps.length;
  const half = Math.floor(windowSize / 2);

  // Clamp the window so it never runs past either end.
  let start = current - half;
  start = Math.max(0, Math.min(start, total - windowSize));
  start = Math.max(0, start);
  const end = Math.min(total, start + windowSize);

  const hasAbove = start > 0;
  const hasBelow = end < total;

  return (
    <div>
      {hasAbove && <Ellipsis />}

      <ol className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          {steps.slice(start, end).map((step, i) => {
            const index = start + i;
            const state =
              index < current ? "done" : index === current ? "current" : "todo";
            const isLastVisible = i === end - start - 1;

            return (
              <motion.li
                key={step.key}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="relative flex gap-3 pb-7 last:pb-0"
              >
                {!isLastVisible && (
                  <span
                    className={`absolute left-[13px] top-7 h-[calc(100%-1rem)] w-0.5 rounded-full transition-colors duration-500 ${
                      index < current ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  />
                )}

                <StepNode state={state} />

                <div
                  className={`pt-0.5 transition-all duration-300 ${
                    state === "current" ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      state === "current"
                        ? "font-bold text-slate-900"
                        : "font-medium text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {hasBelow && <Ellipsis />}
    </div>
  );
}

function Ellipsis() {
  return (
    <div className="mb-2 flex h-4 flex-col items-center justify-center gap-[3px] pl-[10px]">
      <span className="h-1 w-1 rounded-full bg-slate-300" />
      <span className="h-1 w-1 rounded-full bg-slate-300" />
    </div>
  );
}

function StepNode({ state }) {
  if (state === "done") {
    return (
      <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (state === "current") {
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 bg-white ring-4 ring-indigo-50"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
      </motion.span>
    );
  }

  return (
    <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
      <span className="h-2 w-2 rounded-full bg-slate-300" />
    </span>
  );
}
