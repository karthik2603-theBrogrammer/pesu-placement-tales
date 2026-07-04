"use client";

import { motion } from "framer-motion";

/**
 * Horizontal animated bar chart. Horizontal bars read well with long company
 * names and keep the dashboard clean. Values animate in on data change.
 */
export default function BarChart({ data, format = (v) => v, emptyLabel = "No data" }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 text-sm text-amber-600">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const value = Number(item.value) || 0;
        const pct = Math.max(2, (value / max) * 100);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-28 shrink-0 truncate text-right text-xs font-semibold text-amber-900 sm:w-40" title={item.label}>
              {item.label}
            </div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-amber-100/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}
                className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 pr-2"
              >
                <span className="whitespace-nowrap text-[11px] font-bold text-white drop-shadow-sm">
                  {format(value)}
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
