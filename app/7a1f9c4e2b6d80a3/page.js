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
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50";

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

const featureSummary = (item) => (
  <>
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-amber-950">{item.title}</span>
      <StatusChip status={item.status} feedbackType="feature" />
    </div>
    <p className="mt-1 text-sm text-slate-600">{truncate(item.description)}</p>
    {item.admin_reply ? (
      <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/50 px-2.5 py-2 text-xs leading-relaxed text-slate-600">
        <span className="font-semibold text-amber-700">Reply: </span>
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
      <span className="font-semibold text-amber-950">{item.title}</span>
      <StatusChip status={item.status} feedbackType="bug" />
    </div>
    <p className="mt-1 text-sm text-slate-600">{truncate(item.description)}</p>
    {item.admin_reply ? (
      <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/50 px-2.5 py-2 text-xs leading-relaxed text-slate-600">
        <span className="font-semibold text-amber-700">Reply: </span>
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
      <span className="font-semibold text-amber-950">{item.full_name}</span>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
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
            <p className="mb-1 w-fit rounded-full border border-amber-200 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
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
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              Lock
            </button>
          )}
        </div>

        {!unlocked ? (
          <div className="max-w-sm rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="mb-3 text-sm text-slate-600">
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
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-sm font-bold text-white shadow-md"
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

            <AdminCollection
              title="Pass the torch requests"
              endpoint="/api/admin/maintainer-requests"
              token={token}
              fields={MAINTAINER_FIELDS}
              summary={maintainerSummary}
            />

            {/* company stats form */}
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <h2 className="mb-4 text-sm font-bold text-amber-950">
                {form.id ? "Update record" : "Add a record"}
              </h2>

              <div className="mb-4 flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-amber-700">
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
                  <label className="min-w-[220px] flex-1 text-xs font-semibold text-amber-700">
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
                    <label className="min-w-[180px] flex-1 text-xs font-semibold text-amber-700">
                      New company name
                      <input
                        value={form.new_company_name}
                        onChange={(e) => setField("new_company_name", e.target.value)}
                        className={`${input} mt-1`}
                      />
                    </label>
                    <label className="min-w-[180px] flex-1 text-xs font-semibold text-amber-700">
                      Description
                      <input
                        value={form.new_company_description}
                        onChange={(e) =>
                          setField("new_company_description", e.target.value)
                        }
                        className={`${input} mt-1`}
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs font-semibold text-amber-700">
                  Job title
                  <input
                    value={form.job_title}
                    onChange={(e) => setField("job_title", e.target.value)}
                    className={`${input} mt-1`}
                    placeholder="e.g. Software Engineer"
                  />
                </label>
                <label className="text-xs font-semibold text-amber-700">
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
                <div className="text-xs font-semibold text-amber-700">
                  Streams allowed
                  <div className="mt-1 flex flex-wrap gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2">
                    {STREAM_OPTIONS.map((s) => {
                      const active = form.streams_allowed.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleStream(s)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            active
                              ? "bg-amber-500 text-white"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {NUMERIC_FIELDS.map(([key, label]) => (
                  <label key={key} className="text-xs font-semibold text-amber-700">
                    {label}
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      className={`${input} mt-1`}
                    />
                  </label>
                ))}
              </div>

              <label className="mt-3 block text-xs font-semibold text-amber-700">
                Remarks
                <textarea
                  value={form.remarks}
                  onChange={(e) => setField("remarks", e.target.value)}
                  rows={2}
                  className={`${input} mt-1 resize-y`}
                  placeholder="Selection process, bonuses, eligibility notes…"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-4">
                {BOOLEAN_FIELDS.map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm font-medium text-amber-800"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setField(key, e.target.checked)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60"
                >
                  {saving ? "Saving…" : form.id ? "Update record" : "Add record"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(EMPTY_FORM)}
                  className="text-sm font-medium text-amber-600 hover:text-amber-800"
                >
                  Clear
                </button>
                <span className="text-xs text-slate-500">
                  Enter absolute ₹ values (shown as L / k on the public page).
                </span>
              </div>
            </div>

            {/* company stats table */}
            <div className="rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur sm:p-3">
              <div className="max-h-[560px] overflow-auto rounded-xl">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      {[
                        "Company",
                        "Role",
                        "Tier",
                        "Year",
                        "Streams",
                        "CGPA",
                        "Hired",
                        "Base",
                        "CTC",
                        "Stipend",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap border-b border-amber-200 bg-amber-100/95 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-amber-800"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={i % 2 === 0 ? "bg-white/60" : "bg-amber-50/40"}
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-amber-950">
                          {row.company_name}
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-2" title={row.job_title || ""}>
                          {row.job_title || "—"}
                        </td>
                        <td className="px-3 py-2">{row.tier ? `T${row.tier}` : "—"}</td>
                        <td className="px-3 py-2">{row.year}</td>
                        <td className="px-3 py-2">{row.streams_allowed || "—"}</td>
                        <td className="px-3 py-2">{row.cgpa_cutoff ?? "—"}</td>
                        <td className="px-3 py-2">{row.total_hired}</td>
                        <td className="px-3 py-2">{lakh(row.base_salary)}</td>
                        <td className="px-3 py-2">{lakh(row.ctc)}</td>
                        <td className="px-3 py-2">{thousand(row.internship_stipend)}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            className="mr-2 text-xs font-semibold text-amber-700 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            className="text-xs font-semibold text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-500">
                          No records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
