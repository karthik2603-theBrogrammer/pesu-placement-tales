"use client";

import { useMemo, useState } from "react";

const baseInput =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

export function FieldLabel({
  children,
  required = false,
  showOptional = true,
  className = "mb-2",
}) {
  return (
    <span className={`block text-sm font-semibold text-slate-700 ${className}`}>
      {children}
      {required ? (
        <span className="text-red-500" aria-hidden>
          {" "}
          *
        </span>
      ) : showOptional ? (
        <span className="font-normal text-slate-400"> (optional)</span>
      ) : null}
    </span>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  onEnter,
  placeholder,
  type = "text",
  autoFocus = false,
  disabled = false,
  required = false,
  showOptional = true,
}) {
  return (
    <label className="block">
      {label && (
        <FieldLabel required={required} showOptional={showOptional}>
          {label}
        </FieldLabel>
      )}
      <input
        type={type}
        value={value ?? ""}
        autoFocus={autoFocus}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className={`${baseInput} ${disabled ? "cursor-not-allowed bg-slate-50 opacity-70" : ""}`}
      />
      {hint && <span className="mt-2 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  showOptional = true,
}) {
  return (
    <label className="block">
      {label && (
        <FieldLabel required={required} showOptional={showOptional}>
          {label}
        </FieldLabel>
      )}
      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseInput} resize-none leading-relaxed`}
      />
      {hint && <span className="mt-2 block text-xs text-slate-500">{hint}</span>}
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
                ? "border-slate-400 bg-slate-100 text-slate-900 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

import { ROUND_OUTCOME_OPTIONS } from "../../../utils/verdict";

const selectClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

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
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">
              Round {index + 1}
              {index === 0 ? (
                <span className="text-red-500" aria-hidden>
                  {" "}
                  *
                </span>
              ) : (
                <span className="font-normal text-slate-400"> (optional)</span>
              )}
            </span>
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeRound(index)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid gap-3">
            <TextField
              label="Round type / description"
              required={index === 0}
              showOptional={false}
              placeholder="e.g. Online Assessment"
              value={round.description}
              onChange={(v) => updateRound(index, "description", v)}
            />
            <TextArea
              label="Key questions asked"
              rows={2}
              required={index === 0}
              showOptional={false}
              placeholder="What they asked — be specific"
              value={round.questions}
              onChange={(v) => updateRound(index, "questions", v)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Duration"
                required={index === 0}
                showOptional={false}
                placeholder="e.g. 45 min"
                value={round.duration}
                onChange={(v) => updateRound(index, "duration", v)}
              />
              <label className="block">
                <FieldLabel required={index === 0} showOptional={false} className="mb-1.5">
                  Outcome
                </FieldLabel>
                <select
                  value={round.outcome}
                  onChange={(e) => updateRound(index, "outcome", e.target.value)}
                  className={selectClass}
                >
                  <option value="">— Select —</option>
                  {ROUND_OUTCOME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRound}
        className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
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
        label="Company"
        required
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
                  ? "border-slate-400 bg-slate-100 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {company.company_name}
            </button>
          );
        })}
        {filtered.length === 0 && query.trim() && (
          <p className="text-sm text-slate-500">No matches — add it as a new company below.</p>
        )}
      </div>

      {query.trim() && !exactMatch && (
        <button
          type="button"
          onClick={selectNew}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
            value?.mode === "new"
              ? "border-slate-400 bg-slate-100 text-slate-900"
              : "border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          + Add “{query.trim()}” as a new company
        </button>
      )}

      {value?.mode === "new" && (
        <TextArea
          label="Short company description"
          rows={2}
          placeholder="One line about the company"
          value={value.new_company_description}
          onChange={(v) =>
            onChange({ ...value, new_company_description: v })
          }
        />
      )}

      {value?.mode && (
        <p className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
          Selected: {value.company_name}
          {value.mode === "new" ? " (new company)" : ""}
        </p>
      )}
    </div>
  );
}
