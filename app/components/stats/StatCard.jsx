"use client";

import { motion } from "framer-motion";

export default function StatCard({ label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tracking-tight text-amber-950">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}
