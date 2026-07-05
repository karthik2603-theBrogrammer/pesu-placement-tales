"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import VerdictChip from "../VerdictChip";
import { VERDICT_OPTIONS } from "../../../utils/verdict";
import {
  PLACEMENT_TYPE_OPTIONS,
  activePlacementKey,
  formatPlacementTypes,
  placementFlagsFromKey,
} from "../../../utils/placementType";
import { DEGREE_OPTIONS, DEFAULT_DEGREE } from "../../../utils/degree";

const MarkdownReviewRenderer = dynamic(
  () => import("../MarkdownReviewRenderer"),
  {
    ssr: false,
    loading: () => (
      <p className="py-4 text-center text-sm text-amber-600">Loading story…</p>
    ),
  }
);

const ENDPOINT = "/api/admin/contributions";
const PAGE_SIZE = 5;

const input =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50";

const fullName = (item) =>
  [item.first_name, item.middle_name, item.last_name].filter(Boolean).join(" ");

const fmtAdded = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function PlacementStoryLogs({ token, companies }) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const companyOptions = companies.map((c) => ({
    value: String(c.id),
    label: c.company_name,
  }));

  const loadMore = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      if (!reset && !hasMore) return;
      loadingRef.current = true;
      setLoading(true);
      const off = reset ? 0 : offset;
      try {
        const res = await fetch(
          `${ENDPOINT}?limit=${PAGE_SIZE}&offset=${off}`,
          { headers: { "x-admin-token": token } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load.");
        setItems((prev) => (reset ? data.result : [...prev, ...data.result]));
        setOffset(off + data.result.length);
        setHasMore(!!data.hasMore);
      } catch (error) {
        console.error("Placement stories load error:", error);
        toast.error(error.message || "Failed to load stories.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [offset, hasMore, token]
  );

  const resetAndLoad = useCallback(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setExpandedId(null);
    setEditingId(null);
    loadMore(true);
  }, [loadMore]);

  useEffect(() => {
    if (token) resetAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(false),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const toggleExpand = (id) => {
    setEditingId(null);
    setEditForm({});
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setExpandedId(item.id);
    setEditingId(item.id);
    setEditForm({
      first_name: item.first_name ?? "",
      middle_name: item.middle_name ?? "",
      last_name: item.last_name ?? "",
      job_title: item.job_title ?? "",
      year_placed: item.year_placed ?? "",
      verdict: item.verdict ?? "selected",
      placement_type: activePlacementKey(item),
      degree: item.degree ?? DEFAULT_DEGREE,
      company_placed_id: String(item.company_placed_id ?? ""),
      linkedin_url: item.linkedin_url ?? "",
      phone_number: item.phone_number ?? "",
      remarks_markdown: item.remarks_markdown ?? "",
    });
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditForm({});
  };

  const save = async (id, e) => {
    e?.stopPropagation();
    if (!editForm.placement_type) {
      toast.error("Select a placement type.");
      return;
    }
    const placementFlags = placementFlagsFromKey(editForm.placement_type);
    setSaving(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id, ...editForm, ...placementFlags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...data.result } : it))
      );
      toast.success("Story updated.");
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Placement story save error:", error);
      toast.error(error.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, e) => {
    e?.stopPropagation();
    if (!confirm("Delete this placement story? This cannot be undone.")) return;
    try {
      const res = await fetch(ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (expandedId === id) setExpandedId(null);
      if (editingId === id) setEditingId(null);
      toast.success("Story deleted.");
    } catch (error) {
      console.error("Placement story delete error:", error);
      toast.error(error.message || "Delete failed.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-amber-950">Placement stories</h2>
        <span className="text-xs text-slate-500">{items.length} loaded</span>
      </div>

      <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
        {items.map((item) => {
          const open = expandedId === item.id;
          const editing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-lg border transition-colors ${
                open
                  ? "border-amber-300 bg-amber-50/40 shadow-sm"
                  : "border-amber-100 bg-white hover:border-amber-200 hover:bg-amber-50/30"
              }`}
            >
              {/* collapsed log row */}
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-amber-950">
                  {fullName(item)}
                  {item.job_title && (
                    <>
                      <span className="mx-1.5 text-amber-300">·</span>
                      <span className="text-amber-700">{item.job_title}</span>
                    </>
                  )}
                  <span className="mx-1.5 text-amber-300">·</span>
                  <span className="font-semibold text-amber-700">
                    {item.company_name}
                  </span>
                  <span className="mx-1.5 text-amber-300">·</span>
                  <span className="text-slate-500">{item.year_placed}</span>
                  <span className="mx-1.5 text-amber-300">·</span>
                  <span className="text-xs text-amber-700">
                    {formatPlacementTypes(item)}
                  </span>
                  <span className="mx-1.5 text-amber-300">·</span>
                  <VerdictChip verdict={item.verdict} className="!text-[10px]" />
                </span>
                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                  {fmtAdded(item.created_at)}
                </span>
                <span
                  className={`shrink-0 text-amber-500 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden
                >
                  ▾
                </span>
              </button>

              {/* expanded body */}
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-t border-amber-100 px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editing ? (
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-xs font-semibold text-amber-700">
                              First name
                              <input
                                value={editForm.first_name}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    first_name: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              />
                            </label>
                            <label className="text-xs font-semibold text-amber-700">
                              Middle name
                              <input
                                value={editForm.middle_name}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    middle_name: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              />
                            </label>
                            <label className="text-xs font-semibold text-amber-700">
                              Last name
                              <input
                                value={editForm.last_name}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    last_name: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              />
                            </label>
                          </div>
                          <label className="block text-xs font-semibold text-amber-700">
                            Job title
                            <input
                              value={editForm.job_title}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  job_title: e.target.value,
                                }))
                              }
                              className={`${input} mt-1`}
                            />
                          </label>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-xs font-semibold text-amber-700">
                              Year of interview
                              <input
                                type="number"
                                value={editForm.year_placed}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    year_placed: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              />
                            </label>
                            <label className="text-xs font-semibold text-amber-700">
                              Verdict
                              <select
                                value={editForm.verdict}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    verdict: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              >
                                {VERDICT_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-semibold text-amber-700">
                                Placement type
                              </p>
                              <div className="grid gap-2">
                                {PLACEMENT_TYPE_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.key}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                                      editForm.placement_type === opt.key
                                        ? "border-amber-400 bg-amber-50 text-amber-900"
                                        : "border-amber-100 bg-white text-slate-700 hover:border-amber-200"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editForm.placement_type === opt.key}
                                      onChange={() =>
                                        setEditForm((p) => ({
                                          ...p,
                                          placement_type: opt.key,
                                        }))
                                      }
                                      className="h-3.5 w-3.5 accent-amber-500"
                                    />
                                    {opt.label}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <label className="text-xs font-semibold text-amber-700">
                              Degree
                              <select
                                value={editForm.degree}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    degree: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              >
                                {DEGREE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <label className="text-xs font-semibold text-amber-700">
                            Company
                            <select
                              value={editForm.company_placed_id}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  company_placed_id: e.target.value,
                                }))
                              }
                              className={`${input} mt-1`}
                            >
                              {companyOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-xs font-semibold text-amber-700">
                              LinkedIn URL
                              <input
                                value={editForm.linkedin_url}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    linkedin_url: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              />
                            </label>
                            <label className="text-xs font-semibold text-amber-700">
                              Phone number
                              <input
                                value={editForm.phone_number}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    phone_number: e.target.value,
                                  }))
                                }
                                className={`${input} mt-1`}
                              />
                            </label>
                          </div>
                          <label className="block text-xs font-semibold text-amber-700">
                            Story (markdown)
                            <textarea
                              rows={8}
                              value={editForm.remarks_markdown}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  remarks_markdown: e.target.value,
                                }))
                              }
                              className={`${input} mt-1 resize-y font-mono text-xs`}
                            />
                          </label>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={(e) => save(item.id, e)}
                              className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-60"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-xs font-medium text-amber-600 hover:text-amber-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>▲ {item.upvote ?? 0}</span>
                            <span>▼ {item.downvote ?? 0}</span>
                            {item.linkedin_url && (
                              <a
                                href={item.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-amber-700 hover:underline"
                              >
                                LinkedIn
                              </a>
                            )}
                          </div>
                          <div className="rounded-lg border border-amber-100 bg-white p-3">
                            <MarkdownReviewRenderer
                              remarks_markdown={item.remarks_markdown}
                              theme="light"
                            />
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button
                              type="button"
                              onClick={(e) => startEdit(item, e)}
                              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => remove(item.id, e)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <p className="py-6 text-center text-sm text-slate-500">
            No placement stories yet.
          </p>
        )}

        <div ref={sentinelRef} className="h-4" />
        {loading && (
          <p className="py-2 text-center text-xs text-amber-600">Loading…</p>
        )}
        {!hasMore && items.length > 0 && (
          <p className="py-2 text-center text-xs text-slate-400">End of list</p>
        )}
      </div>
    </div>
  );
}
