"use client";

import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@nextui-org/react";
import { Toaster, toast } from "sonner";
import BarChart from "../components/stats/BarChart";
import StatCard from "../components/stats/StatCard";

const trimZeros = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

const fmtNum = (v) => (Number(v) || 0).toLocaleString("en-IN");
// Stipend shown in thousands, base salary & CTC in lakhs.
const fmtLakh = (v) => `₹${trimZeros((Number(v) || 0) / 100000)} L`;
const fmtThousand = (v) => `₹${trimZeros((Number(v) || 0) / 1000)}k`;

const moneyFormatter = (unit) =>
  unit === "lakh" ? fmtLakh : unit === "thousand" ? fmtThousand : fmtNum;

const METRICS = {
  total_hired: { key: "total_hired", label: "Total hired", agg: "sum", unit: "count" },
  internship_stipend: { key: "internship_stipend", label: "Internship stipend", agg: "avg", unit: "thousand" },
  ctc: { key: "ctc", label: "CTC", agg: "avg", unit: "lakh" },
  base_salary: { key: "base_salary", label: "Base salary", agg: "avg", unit: "lakh" },
};

const HIRING_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "internship_only", label: "Intern only" },
  { value: "fte_only", label: "FTE only" },
  { value: "internship_fte", label: "Intern+FTE" },
  { value: "summer_internship", label: "Summer Internship" },
];

const COLUMNS = [
  { key: "company_name", label: "Company", type: "text" },
  { key: "job_title", label: "Role", type: "text" },
  { key: "tier", label: "Tier", type: "tier" },
  { key: "year", label: "Year", type: "num" },
  { key: "streams_allowed", label: "Streams", type: "text" },
  { key: "cgpa_cutoff", label: "CGPA", type: "num" },
  { key: "total_hired", label: "Hired", type: "num" },
  { key: "base_salary", label: "Base (L)", type: "money", unit: "lakh" },
  { key: "ctc", label: "CTC (L)", type: "money", unit: "lakh" },
  { key: "internship_stipend", label: "Stipend (k)", type: "money", unit: "thousand" },
  { key: "girls_only", label: "Girls only", type: "bool" },
  { key: "internship_only", label: "Intern only", type: "bool" },
  { key: "fte_only", label: "FTE only", type: "bool" },
  { key: "internship_fte", label: "Intern+FTE", type: "bool" },
  { key: "summer_internship", label: "Summer Intern", type: "bool" },
  { key: "remarks", label: "Remarks", type: "note" },
];

const selectClass =
  "rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50";

function aggregate(items, keyFn, metric) {
  const map = new Map();
  for (const it of items) {
    const k = keyFn(it);
    const v = Number(it[metric.key]) || 0;
    const e = map.get(k) || { sum: 0, count: 0 };
    e.sum += v;
    e.count += 1;
    map.set(k, e);
  }
  return [...map.entries()].map(([label, e]) => ({
    label: String(label),
    value: metric.agg === "avg" ? (e.count ? e.sum / e.count : 0) : e.sum,
  }));
}

export default function StatsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState("all");
  const [year, setYear] = useState("all");
  const [tier, setTier] = useState("all");
  const [stream, setStream] = useState("all");
  const [hiringType, setHiringType] = useState("all");
  const [metricKey, setMetricKey] = useState("total_hired");
  const [sort, setSort] = useState({ key: "company_name", dir: "asc" });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/company-stats");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load stats.");
        setRows(data.result || []);
      } catch (error) {
        console.error("Error loading stats:", error);
        toast.error(error.message || "Could not load stats.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const companies = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => map.set(String(r.company_id), r.company_name));
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const years = useMemo(
    () => [...new Set(rows.map((r) => r.year))].sort((a, b) => b - a),
    [rows]
  );

  const tiers = useMemo(
    () =>
      [...new Set(rows.map((r) => r.tier).filter((t) => t != null))].sort(
        (a, b) => a - b
      ),
    [rows]
  );

  const rowStreams = (r) =>
    (r.streams_allowed || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const streams = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => rowStreams(r).forEach((s) => set.add(s)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (company === "all" || String(r.company_id) === company) &&
          (year === "all" || String(r.year) === String(year)) &&
          (tier === "all" || String(r.tier) === String(tier)) &&
          (stream === "all" || rowStreams(r).includes(stream)) &&
          (hiringType === "all" || !!r[hiringType])
      ),
    [rows, company, year, tier, stream, hiringType]
  );

  const kpis = useMemo(() => {
    const sum = (key) => filtered.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
    const avg = (key) =>
      filtered.length ? sum(key) / filtered.length : 0;
    return {
      records: filtered.length,
      companies: new Set(filtered.map((r) => r.company_id)).size,
      totalHired: sum("total_hired"),
      avgCtc: avg("ctc"),
      avgStipend: avg("internship_stipend"),
    };
  }, [filtered]);

  const metric = METRICS[metricKey];

  const chart = useMemo(() => {
    const companyName =
      companies.find((c) => c.id === company)?.name || "Company";
    if (company !== "all" && year === "all") {
      const data = aggregate(filtered, (r) => r.year, metric).sort(
        (a, b) => Number(a.label) - Number(b.label)
      );
      return { data, title: `${companyName} · ${metric.label} by year` };
    }
    if (year !== "all" && company === "all") {
      const data = aggregate(filtered, (r) => r.company_name, metric)
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
      return { data, title: `${metric.label} by company · ${year}` };
    }
    if (company !== "all" && year !== "all") {
      const data = filtered.map((r) => ({
        label: String(r.year),
        value: Number(r[metric.key]) || 0,
      }));
      return { data, title: `${companyName} · ${year}` };
    }
    const data = aggregate(filtered, (r) => r.company_name, metric)
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
    return { data, title: `${metric.label} by company (top 12)` };
  }, [filtered, company, year, metric, companies]);

  const sortedRows = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sort.key);
    const mul = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (col.type === "text" || col.type === "note") {
        return mul * String(a[col.key] || "").localeCompare(String(b[col.key] || ""));
      }
      if (col.type === "bool") {
        return mul * ((a[col.key] ? 1 : 0) - (b[col.key] ? 1 : 0));
      }
      return mul * ((Number(a[col.key]) || 0) - (Number(b[col.key]) || 0));
    });
  }, [filtered, sort]);

  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  const formatCell = (col, value) => {
    if (col.type === "money") return moneyFormatter(col.unit)(value);
    if (col.type === "num")
      return value == null || value === "" ? (
        <span className="text-slate-300">—</span>
      ) : (
        fmtNum(value)
      );
    if (col.type === "tier")
      return value ? (
        <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-white">
          T{value}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      );
    if (col.type === "note")
      return value ? (
        <span
          className="block max-w-[260px] truncate text-left text-slate-600"
          title={value}
        >
          {value}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      );
    if (col.type === "bool")
      return value ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          Yes
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      );
    return value || <span className="text-slate-300">—</span>;
  };

  const chartFormat = moneyFormatter(metric.unit);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(180,83,9,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(180,83,9,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_95%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0.35))]" />

      <section className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
            Placement stats
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Hiring & salary dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Explore how many students were placed at each company, across years —
            along with stipends, CTC and hiring splits. Filter by a company, a
            year, or view everything at once.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-amber-100 bg-white/70 p-16 shadow-sm">
            <Spinner color="warning" labelColor="warning">
              Loading stats...
            </Spinner>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-white/70 p-16 text-center text-sm text-amber-700 shadow-sm">
            No company data yet. Once contributions come in, stats will appear here.
          </div>
        ) : (
          <div className="space-y-6">
            {/* filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur">
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                Company
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                Year
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                Tier
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All tiers</option>
                  {tiers.map((t) => (
                    <option key={t} value={t}>
                      Tier {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                Stream
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All streams</option>
                  {streams.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                Hiring type
                <select
                  value={hiringType}
                  onChange={(e) => setHiringType(e.target.value)}
                  className={selectClass}
                >
                  {HIRING_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {(company !== "all" ||
                year !== "all" ||
                tier !== "all" ||
                stream !== "all" ||
                hiringType !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setCompany("all");
                    setYear("all");
                    setTier("all");
                    setStream("all");
                    setHiringType("all");
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-100"
                >
                  Reset
                </button>
              )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Records" value={fmtNum(kpis.records)} />
              <StatCard label="Companies" value={fmtNum(kpis.companies)} />
              <StatCard label="Total hired" value={fmtNum(kpis.totalHired)} />
              <StatCard label="Avg CTC" value={fmtLakh(kpis.avgCtc)} />
              <StatCard label="Avg stipend" value={fmtThousand(kpis.avgStipend)} />
            </div>

            {/* chart */}
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-amber-950">{chart.title}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(METRICS).map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMetricKey(m.key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        metricKey === m.key
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-amber-100/70 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <BarChart data={chart.data} format={chartFormat} />
            </div>

            {/* excel-like table */}
            <div className="rounded-3xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur sm:p-3">
              <div className="max-h-[520px] overflow-auto rounded-2xl">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          className={`cursor-pointer whitespace-nowrap border-b border-amber-200 bg-amber-100/95 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-amber-800 backdrop-blur transition hover:bg-amber-200/90 ${
                            col.type === "text" || col.type === "note"
                              ? "text-left"
                              : "text-right"
                          } ${col.key === "company_name" ? "sticky left-0 z-20" : ""}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {sort.key === col.key && (
                              <span>{sort.dir === "asc" ? "▲" : "▼"}</span>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`transition hover:bg-amber-50 ${
                          i % 2 === 0 ? "bg-white/60" : "bg-amber-50/40"
                        }`}
                      >
                        {COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={`${
                              col.type === "note" ? "" : "whitespace-nowrap"
                            } border-b border-amber-100/70 px-3 py-2 ${
                              col.type === "text" || col.type === "note"
                                ? "text-left font-medium text-amber-950"
                                : "text-right text-amber-900"
                            } ${
                              col.key === "company_name"
                                ? "sticky left-0 bg-inherit font-semibold"
                                : ""
                            }`}
                          >
                            {formatCell(col, row[col.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-3 py-2 text-xs text-slate-500">
                {sortedRows.length} row{sortedRows.length === 1 ? "" : "s"} · click a
                column header to sort
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
