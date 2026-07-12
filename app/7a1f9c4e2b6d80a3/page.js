"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import AdminCollection from "../components/admin/AdminCollection";
import AdminKpiGrid from "../components/admin/AdminKpiGrid";
import PlacementStoryLogs from "../components/admin/PlacementStoryLogs";
import {
  ADMIN_REPLY_LIMIT,
  BUG_STATUSES,
  FEATURE_STATUSES,
  formatStatusLabel,
  statusBadgeClass,
} from "../../utils/feedbackStatus";

const STREAM_OPTIONS = ["CSE", "ECE", "EEE", "Mech", "AIML"];
const TIER_OPTIONS = [1, 2, 3];

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
const truncate = (text, n = 160) =>
  text && text.length > n ? `${text.slice(0, n)}…` : text || "";

const StatusChip = ({ status, feedbackType = "feature" }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusBadgeClass(status, feedbackType)}`}
  >
    {formatStatusLabel(status, feedbackType)}
  </span>
);

const EMPTY_FORM = {
  id: "",
  mode: "existing",
  company_id: "",
  new_company_name: "",
  new_company_description: "",
  year: "",
  tier: "",
  job_title: "",
  cgpa_cutoff: "",
  remarks: "",
  streams_allowed: [],
  base_salary: "",
  ctc: "",
  internship_stipend: "",
  total_hired: "",
  males_hired: "",
  females_hired: "",
  girls_only: false,
  internship_only: false,
  fte_only: false,
  internship_fte: false,
  summer_internship: false,
};

const input =
  "w-full rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const NUMERIC_FIELDS = [
  ["year", "Year"],
  ["cgpa_cutoff", "CGPA cut-off"],
  ["total_hired", "Total hired"],
  ["males_hired", "Males hired"],
  ["females_hired", "Females hired"],
  ["base_salary", "Base salary (₹)"],
  ["ctc", "CTC (₹)"],
  ["internship_stipend", "Internship stipend (₹)"],
];

const BOOLEAN_FIELDS = [
  ["girls_only", "Girls only"],
  ["internship_only", "Internship only"],
  ["fte_only", "FTE only"],
  ["internship_fte", "Internship + FTE"],
  ["summer_internship", "Summer Internship"],
];

const lakh = (v) => (v ? `${(Number(v) / 100000).toFixed(2)}L` : "—");
const thousand = (v) => (v ? `${Math.round(Number(v) / 1000)}k` : "—");

const parseStreams = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const featureStatusOptions = FEATURE_STATUSES.map((s) => ({
  value: s.value,
  label: s.label,
}));
const bugStatusOptions = BUG_STATUSES.map((s) => ({ value: s.value, label: s.label }));

const FEATURE_FIELDS = [
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "textarea", rows: 4 },
  { key: "requester_name", label: "Requester name", type: "text" },
  { key: "status", label: "Status", type: "select", options: featureStatusOptions },
  {
    key: "admin_reply",
    label: "Admin reply (shown publicly)",
    type: "textarea",
    rows: 3,
    maxLength: ADMIN_REPLY_LIMIT,
    hint: "Short update for users — leave blank to hide.",
  },
];

const BUG_FIELDS = [
  { key: "title", label: "Title", type: "text" },
  { key: "description", label: "Description", type: "textarea", rows: 4 },
  { key: "reproduction_steps", label: "Reproduction steps", type: "textarea", rows: 3 },
  { key: "page_url", label: "Page URL", type: "text" },
  { key: "reporter_name", label: "Reporter name", type: "text" },
  { key: "status", label: "Status", type: "select", options: bugStatusOptions },
  {
    key: "admin_reply",
    label: "Admin reply (shown publicly)",
    type: "textarea",
    rows: 3,
    maxLength: ADMIN_REPLY_LIMIT,
    hint: "Short update for users — leave blank to hide.",
  },
];

const MAINTAINER_FIELDS = [
  { key: "full_name", label: "Full name", type: "text" },
  { key: "batch", label: "Batch", type: "text" },
  { key: "department", label: "Department", type: "text" },
  { key: "degree", label: "Degree", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
  { key: "reason", label: "Reason", type: "textarea", rows: 3 },
];

const COMPANY_FIELDS = [
  { key: "company_name", label: "Company name", type: "text" },
  { key: "company_description", label: "Description", type: "textarea", rows: 2 },
];

const featureSummary = (item) => (
  <>
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-slate-900">{item.title}</span>
      <StatusChip status={item.status} feedbackType="feature" />
    </div>
    <p className="mt-1 text-sm text-slate-600">{truncate(item.description)}</p>
    {item.admin_reply ? (
      <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-800">Reply: </span>
        {truncate(item.admin_reply, 120)}
      </p>
    ) : null}
    <p className="mt-1 text-xs text-slate-400">
      {item.requester_name || "Anonymous"} · {fmtDate(item.created_at)}
    </p>
  </>
);

const bugSummary = (item) => (
  <>
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-slate-900">{item.title}</span>
      <StatusChip status={item.status} feedbackType="bug" />
    </div>
    <p className="mt-1 text-sm text-slate-600">{truncate(item.description)}</p>
    {item.admin_reply ? (
      <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-800">Reply: </span>
        {truncate(item.admin_reply, 120)}
      </p>
    ) : null}
    <p className="mt-1 text-xs text-slate-400">
      {item.reporter_name || "Anonymous"} · {fmtDate(item.created_at)}
      {item.page_url ? ` · ${item.page_url}` : ""}
    </p>
  </>
);

const maintainerSummary = (item) => (
  <>
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-slate-900">{item.full_name}</span>
      <span className="rounded-full bg-amber-100/85 border border-amber-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800">
        Batch {item.batch}
      </span>
    </div>
    <p className="mt-1 text-sm text-slate-600">
      {item.degree} · {item.department}
    </p>
    {item.reason ? (
      <p className="mt-1 text-sm text-slate-600">{truncate(item.reason)}</p>
    ) : null}
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
      <a href={`mailto:${item.email}`} className="text-amber-700 hover:underline">
        {item.email}
      </a>
      <a
        href={item.linkedin_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-700 hover:underline"
      >
        LinkedIn
      </a>
      <span>{fmtDate(item.created_at)}</span>
    </p>
  </>
);

const companySummary = (item) => (
  <>
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-slate-900">{item.company_name}</span>
    </div>
    <p className="mt-1 text-sm text-slate-600">{truncate(item.company_description)}</p>
  </>
);

export default function AdminStatsPage() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleStream = (stream) =>
    setForm((p) => ({
      ...p,
      streams_allowed: p.streams_allowed.includes(stream)
        ? p.streams_allowed.filter((s) => s !== stream)
        : [...p.streams_allowed, stream],
    }));

  const loadData = useCallback(async (tk) => {
    try {
      const [companiesRes, rowsRes] = await Promise.all([
        fetch("/api/get-companies"),
        fetch("/api/admin/company-visited", { headers: { "x-admin-token": tk } }),
      ]);
      const rowsData = await rowsRes.json();
      if (!rowsRes.ok) throw new Error(rowsData.error || "Unauthorized.");
      const companiesData = await companiesRes.json();

      setCompanies(companiesData.result || []);
      setRows(rowsData.result || []);
      setUnlocked(true);
      setToken(tk);
      localStorage.setItem("pt_admin_token", tk);
    } catch (error) {
      console.error("Admin load error:", error);
      toast.error(error.message || "Could not unlock.");
      setUnlocked(false);
      localStorage.removeItem("pt_admin_token");
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("pt_admin_token");
    if (stored) loadData(stored);
  }, [loadData]);

  const refreshRows = useCallback(async (tk) => {
    const res = await fetch("/api/admin/company-visited", {
      headers: { "x-admin-token": tk },
    });
    const data = await res.json();
    if (res.ok) setRows(data.result || []);
  }, []);

  const handleSave = async () => {
    if (!form.year) {
      toast.error("Year is required.");
      return;
    }
    if (form.mode === "existing" && !form.company_id) {
      toast.error("Select a company.");
      return;
    }
    if (form.mode === "new" && !form.new_company_name.trim()) {
      toast.error("Enter a new company name.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(form.id ? { id: form.id } : {}),
        year: form.year,
        tier: form.tier || null,
        job_title: form.job_title,
        cgpa_cutoff: form.cgpa_cutoff,
        remarks: form.remarks,
        streams_allowed: form.streams_allowed,
        base_salary: form.base_salary,
        ctc: form.ctc,
        internship_stipend: form.internship_stipend,
        total_hired: form.total_hired,
        males_hired: form.males_hired,
        females_hired: form.females_hired,
        girls_only: form.girls_only,
        internship_only: form.internship_only,
        fte_only: form.fte_only,
        internship_fte: form.internship_fte,
        summer_internship: form.summer_internship,
        ...(form.mode === "existing"
          ? { company_id: form.company_id }
          : {
              new_company_name: form.new_company_name,
              new_company_description: form.new_company_description,
            }),
      };

      const res = await fetch("/api/admin/company-visited", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");

      toast.success(`Saved ${data.companyName}`);
      setForm(EMPTY_FORM);
      await refreshRows(token);
      const companiesRes = await fetch("/api/get-companies");
      const companiesData = await companiesRes.json();
      setCompanies(companiesData.result || []);
    } catch (error) {
      console.error("Admin save error:", error);
      toast.error(error.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setForm({
      ...EMPTY_FORM,
      id: String(row.id),
      mode: "existing",
      company_id: String(row.company_id),
      year: String(row.year),
      tier: row.tier ? String(row.tier) : "",
      job_title: row.job_title ?? "",
      cgpa_cutoff: row.cgpa_cutoff != null ? String(row.cgpa_cutoff) : "",
      remarks: row.remarks ?? "",
      streams_allowed: parseStreams(row.streams_allowed),
      base_salary: String(row.base_salary ?? ""),
      ctc: String(row.ctc ?? ""),
      internship_stipend: String(row.internship_stipend ?? ""),
      total_hired: String(row.total_hired ?? ""),
      males_hired: String(row.males_hired ?? ""),
      females_hired: String(row.females_hired ?? ""),
      girls_only: !!row.girls_only,
      internship_only: !!row.internship_only,
      fte_only: !!row.fte_only,
      internship_fte: !!row.internship_fte,
      summer_internship: !!row.summer_internship,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete ${row.company_name} · ${row.job_title || row.year}?`)) return;
    try {
      const res = await fetch("/api/admin/company-visited", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id: row.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      toast.success("Deleted.");
      await refreshRows(token);
    } catch (error) {
      console.error("Admin delete error:", error);
      toast.error(error.message || "Delete failed.");
    }
  };

  const logout = () => {
    localStorage.removeItem("pt_admin_token");
    setToken("");
    setUnlocked(false);
    setRows([]);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 w-fit rounded-full border border-amber-200 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm backdrop-blur">
              Admin
            </p>
            <h1 className="text-3xl font-black tracking-tight text-amber-950">
              Admin console
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Company stats, placement stories, feedback &amp; maintainer requests
            </p>
          </div>
          {unlocked && (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-slate-50 shadow-sm transition"
            >
              Lock
            </button>
          )}
        </div>

        {!unlocked ? (
          <div className="max-w-sm rounded-[2rem] border border-amber-100 bg-white/75 p-6 shadow-sm backdrop-blur">
            <p className="mb-4 text-sm text-slate-600">
              Enter the admin token to manage stats, stories, and feedback.
            </p>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Admin token"
              className={input}
              onKeyDown={(e) => e.key === "Enter" && loadData(tokenInput)}
            />
            <button
              type="button"
              onClick={() => loadData(tokenInput)}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
            >
              Unlock
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AdminKpiGrid token={token} />

            {/* moderation — placement stories first */}
            <PlacementStoryLogs token={token} companies={companies} />

            <div className="grid gap-6 lg:grid-cols-2">
              <AdminCollection
                title="Feature requests"
                endpoint="/api/admin/feature-requests"
                token={token}
                fields={FEATURE_FIELDS}
                summary={featureSummary}
              />
              <AdminCollection
                title="Bug reports"
                endpoint="/api/admin/bug-reports"
                token={token}
                fields={BUG_FIELDS}
                summary={bugSummary}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AdminCollection
                title="Company Directory"
                endpoint="/api/admin/companies"
                token={token}
                fields={COMPANY_FIELDS}
                summary={companySummary}
              />
              <AdminCollection
                title="Pass the torch requests"
                endpoint="/api/admin/maintainer-requests"
                token={token}
                fields={MAINTAINER_FIELDS}
                summary={maintainerSummary}
              />
            </div>

            {/* company stats form */}
            <div className="rounded-[2rem] border border-amber-100 bg-white/75 p-5 shadow-sm backdrop-blur">
              <h2 className="mb-4 text-sm font-bold text-amber-950">
                {form.id ? "Update record" : "Add a record"}
              </h2>

              <div className="mb-4 flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-slate-700">
                  Company source
                  <select
                    value={form.mode}
                    onChange={(e) => setField("mode", e.target.value)}
                    className={`${input} mt-1`}
                  >
                    <option value="existing">Existing company</option>
                    <option value="new">New company</option>
                  </select>
                </label>

                {form.mode === "existing" ? (
                  <label className="min-w-[220px] flex-1 text-xs font-semibold text-slate-700">
                    Company
                    <select
                      value={form.company_id}
                      onChange={(e) => setField("company_id", e.target.value)}
                      className={`${input} mt-1`}
                    >
                      <option value="">Select…</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <>
                    <label className="min-w-[220px] flex-1 text-xs font-semibold text-slate-700">
                      New company name
                      <input
                        value={form.new_company_name}
                        onChange={(e) => setField("new_company_name", e.target.value)}
                        className={`${input} mt-1`}
                      />
                    </label>
                    <label className="min-w-[220px] flex-1 text-xs font-semibold text-slate-700">
                      Company description
                      <input
                        value={form.new_company_description}
                        onChange={(e) => setField("new_company_description", e.target.value)}
                        className={`${input} mt-1`}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">
                  Job title
                  <input
                    value={form.job_title}
                    onChange={(e) => setField("job_title", e.target.value)}
                    className={`${input} mt-1`}
                    placeholder="e.g. Software Engineer"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Tier
                  <select
                    value={form.tier}
                    onChange={(e) => setField("tier", e.target.value)}
                    className={`${input} mt-1`}
                  >
                    <option value="">—</option>
                    {TIER_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        Tier {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-4">
                {NUMERIC_FIELDS.map(([k, label]) => (
                  <label key={k} className="text-xs font-semibold text-slate-700">
                    {label}
                    <input
                      type="number"
                      value={form[k]}
                      onChange={(e) => setField(k, e.target.value)}
                      className={`${input} mt-1`}
                    />
                  </label>
                ))}
              </div>

              <label className="mb-6 block text-xs font-semibold text-slate-700">
                Remarks
                <textarea
                  value={form.remarks}
                  onChange={(e) => setField("remarks", e.target.value)}
                  rows={2}
                  className={`${input} mt-1 resize-y`}
                  placeholder="Selection process, bonuses, eligibility notes…"
                />
              </label>

              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold text-slate-700">Streams allowed</p>
                <div className="flex flex-wrap gap-2">
                  {STREAM_OPTIONS.map((str) => (
                    <label
                      key={str}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
                        form.streams_allowed.includes(str)
                          ? "border-amber-400 bg-amber-100 text-amber-900"
                          : "border-amber-200 bg-white/70 text-amber-700 hover:border-amber-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.streams_allowed.includes(str)}
                        onChange={() => toggleStream(str)}
                        className="h-3.5 w-3.5 accent-amber-500"
                      />
                      {str}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold text-slate-700">Flags</p>
                <div className="flex flex-wrap gap-4">
                  {BOOLEAN_FIELDS.map(([k, label]) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={(e) => setField(k, e.target.checked)}
                        className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600 disabled:opacity-60"
                >
                  {saving ? "Saving…" : form.id ? "Update record" : "Add record"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(EMPTY_FORM)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-800"
                  >
                    Cancel update
                  </button>
                )}
              </div>
            </div>

            {/* company stats table */}
            <div className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white/75 shadow-sm backdrop-blur">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-amber-100/80 bg-amber-50/50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Cutoff</th>
                      <th className="px-4 py-3">Base</th>
                      <th className="px-4 py-3">CTC</th>
                      <th className="px-4 py-3">Stipend</th>
                      <th className="px-4 py-3">Hires</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`border-b border-amber-50/80 ${
                          i % 2 === 0 ? "bg-white/40" : "bg-amber-50/20"
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {r.company_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.year}</td>
                        <td className="px-4 py-3">{r.job_title || "—"}</td>
                        <td className="px-4 py-3">{r.tier ? `T${r.tier}` : "—"}</td>
                        <td className="px-4 py-3">{r.cgpa_cutoff ?? "—"}</td>
                        <td className="px-4 py-3">{lakh(r.base_salary)}</td>
                        <td className="px-4 py-3">{lakh(r.ctc)}</td>
                        <td className="px-4 py-3">{thousand(r.internship_stipend)}</td>
                        <td className="px-4 py-3">{r.total_hired}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                               type="button"
                               onClick={() => handleEdit(r)}
                               className="text-xs font-semibold text-amber-700 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r)}
                              className="text-xs font-semibold text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-500">
                  No company stats yet.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
