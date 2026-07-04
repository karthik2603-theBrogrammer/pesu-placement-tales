"use client";

import { useMemo, useState } from "react";

const baseInput =
  "w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 text-base text-amber-950 shadow-sm outline-none transition placeholder:text-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/60";

export function TextField({
  label,
  hint,
  value,
  onChange,
  onEnter,
  placeholder,
  type = "text",
  autoFocus = false,
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-semibold text-amber-800">{label}</span>
      )}
      <input
        type={type}
        value={value ?? ""}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className={baseInput}
      />
      {hint && <span className="mt-2 block text-xs text-amber-600/80">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-semibold text-amber-800">{label}</span>
      )}
      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseInput} resize-none leading-relaxed`}
      />
      {hint && <span className="mt-2 block text-xs text-amber-600/80">{hint}</span>}
    </label>
  );
}

export function ChoiceCards({ options, value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-2xl border px-5 py-4 text-left text-base font-semibold transition ${
              active
                ? "border-amber-400 bg-amber-100 text-amber-900 shadow-sm"
                : "border-amber-200 bg-white/70 text-amber-700 hover:border-amber-300 hover:bg-amber-50"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

const emptyRound = { description: "", questions: "", duration: "", outcome: "" };

export function RoundsEditor({ rounds, onChange }) {
  const list = rounds.length > 0 ? rounds : [{ ...emptyRound }];

  const updateRound = (index, key, val) => {
    const next = list.map((round, i) =>
      i === index ? { ...round, [key]: val } : round
    );
    onChange(next);
  };

  const addRound = () => onChange([...list, { ...emptyRound }]);
  const removeRound = (index) =>
    onChange(list.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {list.map((round, index) => (
        <div
          key={index}
          className="rounded-2xl border border-amber-200 bg-white/70 p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-amber-800">
              Round {index + 1}
            </span>
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeRound(index)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-800"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid gap-3">
            <TextField
              placeholder="Round type / description (e.g. Online Assessment)"
              value={round.description}
              onChange={(v) => updateRound(index, "description", v)}
            />
            <TextArea
              rows={2}
              placeholder="Key questions asked"
              value={round.questions}
              onChange={(v) => updateRound(index, "questions", v)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                placeholder="Duration (e.g. 45 min)"
                value={round.duration}
                onChange={(v) => updateRound(index, "duration", v)}
              />
              <TextField
                placeholder="Outcome (e.g. Cleared)"
                value={round.outcome}
                onChange={(v) => updateRound(index, "outcome", v)}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRound}
        className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
      >
        + Add another round
      </button>
    </div>
  );
}

export function CompanyPicker({ companies, value, onChange }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies.slice(0, 12);
    return companies
      .filter((c) => c.company_name?.toLowerCase().includes(q))
      .slice(0, 12);
  }, [companies, query]);

  const exactMatch = useMemo(
    () =>
      companies.some(
        (c) => c.company_name?.trim().toLowerCase() === query.trim().toLowerCase()
      ),
    [companies, query]
  );

  const selectExisting = (company) =>
    onChange({
      mode: "existing",
      company_id: company.id,
      company_name: company.company_name,
      new_company_description: "",
    });

  const selectNew = () =>
    onChange({
      mode: "new",
      company_id: null,
      company_name: query.trim(),
      new_company_description: value?.new_company_description || "",
    });

  return (
    <div className="space-y-4">
      <TextField
        placeholder="Search a company or type a new one…"
        value={query}
        onChange={setQuery}
        autoFocus
      />

      <div className="flex flex-wrap gap-2">
        {filtered.map((company) => {
          const active =
            value?.mode === "existing" && value.company_id === company.id;
          return (
            <button
              key={company.id}
              type="button"
              onClick={() => selectExisting(company)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? "border-amber-400 bg-amber-100 text-amber-900"
                  : "border-amber-200 bg-white/70 text-amber-700 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              {company.company_name}
            </button>
          );
        })}
        {filtered.length === 0 && query.trim() && (
          <p className="text-sm text-amber-600">No matches — add it as a new company below.</p>
        )}
      </div>

      {query.trim() && !exactMatch && (
        <button
          type="button"
          onClick={selectNew}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
            value?.mode === "new"
              ? "border-amber-400 bg-amber-100 text-amber-900"
              : "border-dashed border-amber-300 bg-amber-50/60 text-amber-700 hover:bg-amber-100"
          }`}
        >
          + Add “{query.trim()}” as a new company
        </button>
      )}

      {value?.mode === "new" && (
        <TextArea
          label="Short company description"
          rows={2}
          placeholder="One line about the company (optional)"
          value={value.new_company_description}
          onChange={(v) =>
            onChange({ ...value, new_company_description: v })
          }
        />
      )}

      {value?.mode && (
        <p className="rounded-xl bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-800">
          Selected: {value.company_name}
          {value.mode === "new" ? " (new company)" : ""}
        </p>
      )}
    </div>
  );
}
