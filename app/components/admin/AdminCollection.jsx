"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const input =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-950 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50";

/**
 * Generic admin list with infinite scroll + inline edit/delete.
 *
 * Props:
 *  - endpoint: base admin API path (GET paginated, PUT edit, DELETE remove)
 *  - token: admin token for the x-admin-token header
 *  - fields: [{ key, label, type: text|number|url|textarea|select, options?, rows? }]
 *  - summary: (item) => ReactNode  — read-only display
 *  - pageSize: rows per page (default 5)
 */
export default function AdminCollection({
  title,
  endpoint,
  token,
  fields,
  summary,
  pageSize = 5,
}) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      if (!reset && !hasMore) return;
      loadingRef.current = true;
      setLoading(true);
      const off = reset ? 0 : offset;
      try {
        const res = await fetch(`${endpoint}?limit=${pageSize}&offset=${off}`, {
          headers: { "x-admin-token": token },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load.");
        setItems((prev) => (reset ? data.result : [...prev, ...data.result]));
        setOffset(off + data.result.length);
        setHasMore(!!data.hasMore);
      } catch (error) {
        console.error(`${title} load error:`, error);
        toast.error(error.message || "Failed to load.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [endpoint, offset, hasMore, pageSize, token, title]
  );

  const resetAndLoad = useCallback(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    loadMore(true);
  }, [loadMore]);

  useEffect(() => {
    resetAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, token]);

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

  const startEdit = (item) => {
    const form = {};
    fields.forEach((f) => {
      form[f.key] = item[f.key] ?? "";
    });
    setEditForm(form);
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const save = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...data.result } : it)));
      toast.success("Saved.");
      cancelEdit();
    } catch (error) {
      console.error(`${title} save error:`, error);
      toast.error(error.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("Deleted.");
    } catch (error) {
      console.error(`${title} delete error:`, error);
      toast.error(error.message || "Delete failed.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-amber-950">{title}</h2>
        <span className="text-xs text-slate-500">{items.length} loaded</span>
      </div>

      <div className="max-h-[460px] space-y-3 overflow-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-amber-100 bg-white/70 p-4">
            {editingId === item.id ? (
              <div className="space-y-3">
                {fields.map((f) => (
                  <label key={f.key} className="block text-xs font-semibold text-amber-700">
                    {f.label}
                    {f.type === "textarea" ? (
                      <>
                        <textarea
                          rows={f.rows || 3}
                          value={editForm[f.key] ?? ""}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, [f.key]: e.target.value }))
                          }
                          maxLength={f.maxLength}
                          className={`${input} mt-1 resize-y`}
                        />
                        {f.hint ? (
                          <span className="mt-1 block text-[11px] font-normal text-slate-400">
                            {f.hint}
                          </span>
                        ) : null}
                      </>
                    ) : f.type === "select" ? (
                      <select
                        value={editForm[f.key] ?? ""}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        className={`${input} mt-1`}
                      >
                        {(f.options || []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        value={editForm[f.key] ?? ""}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        className={`${input} mt-1`}
                      />
                    )}
                  </label>
                ))}
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save(item.id)}
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">{summary(item)}</div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-xs font-semibold text-amber-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && !loading && (
          <p className="py-6 text-center text-sm text-slate-500">Nothing here yet.</p>
        )}

        <div ref={sentinelRef} className="h-4" />
        {loading && <p className="py-2 text-center text-xs text-amber-600">Loading…</p>}
        {!hasMore && items.length > 0 && (
          <p className="py-2 text-center text-xs text-slate-400">End of list</p>
        )}
      </div>
    </div>
  );
}
