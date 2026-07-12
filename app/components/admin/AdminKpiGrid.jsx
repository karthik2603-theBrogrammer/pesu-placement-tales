"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CARDS = [
  { key: "stories", label: "Stories", accent: "from-amber-500 to-amber-400" },
  { key: "featureRequests", label: "Feature requests", accent: "from-yellow-500 to-yellow-400" },
  { key: "companies", label: "Companies", accent: "from-amber-400 to-yellow-400" },
  { key: "bugReports", label: "Bug reports", accent: "from-yellow-600 to-amber-500" },
];

export default function AdminKpiGrid({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const res = await fetch("/api/admin/stats-summary", {
          headers: { "x-admin-token": token },
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (error) {
        console.error("Admin KPI load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="h-28 animate-pulse rounded-[2rem] border border-amber-100 bg-amber-50/20"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative overflow-hidden rounded-[2rem] border border-amber-100 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md backdrop-blur"
        >
          <div
            className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-10 blur-2xl transition group-hover:opacity-20`}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            {card.label}
          </p>
          <p className="mt-2 text-4xl font-black tabular-nums tracking-tight text-slate-900">
            {stats[card.key] ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Total in database</p>
        </motion.div>
      ))}
    </div>
  );
}
