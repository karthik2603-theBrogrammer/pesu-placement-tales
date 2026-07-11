"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Input, Select, SelectItem } from "@nextui-org/react";
import BrowseToaster from "./components/BrowseToaster";
import { CiSearch } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import H from "../components/Heading";
import P from "../components/Paragraph";
import BrowseShell from "./components/BrowseShell";
import {
  companyBrowsePath,
  markDirectoryCompanyNavigation,
} from "../../utils/browseRoutes";
import { DEGREE_OPTIONS } from "../../utils/degree";

export default function BrowseDirectoryPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [filterMeta, setFilterMeta] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingCompanies(true);
        const [companiesRes, filtersRes] = await Promise.all([
          fetch("/api/browse-companies"),
          fetch("/api/browse-companies/filters"),
        ]);
        const companiesData = await companiesRes.json();
        const filtersData = await filtersRes.json();
        setCompanies(companiesData.result || []);
        setFilterMeta(filtersData.result || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    }
    fetchData();
  }, []);

  // Build a lookup: companyId → filter metadata
  const filterLookup = useMemo(() => {
    const map = {};
    for (const row of filterMeta) {
      map[row.company_id] = row;
    }
    return map;
  }, [filterMeta]);

  // Compute distinct batch years across all companies for the batch dropdown
  const allBatches = useMemo(() => {
    const set = new Set();
    for (const row of filterMeta) {
      (row.batches || []).forEach((b) => set.add(String(b)));
    }
    return Array.from(set)
      .sort()
      .reverse();
  }, [filterMeta]);

  const hasActiveFilters =
    jobFilter !== "all" ||
    degreeFilter !== "all" ||
    batchFilter !== "all" ||
    verdictFilter !== "all";

  const clearAllFilters = () => {
    setJobFilter("all");
    setDegreeFilter("all");
    setBatchFilter("all");
    setVerdictFilter("all");
  };

  const filterCompanies = (list, query, job, degree, batch, verdict) =>
    list.filter((company) => {
      // Name search
      if (
        query &&
        !company.company_name.toLowerCase().includes(query.toLowerCase())
      )
        return false;

      // Job type filter (uses the original browse-companies aggregates)
      if (job === "intern" && !company.has_intern_stories) return false;
      if (job === "fte" && !company.has_fte_stories) return false;
      if (job === "intern_fte" && !company.has_intern_fte_stories) return false;

      // Filters using the per-company metadata
      const meta = filterLookup[company.id];
      if (!meta) return job === "all" && degree === "all" && batch === "all" && verdict === "all";

      if (degree !== "all" && !(meta.degrees || []).includes(degree))
        return false;
      if (batch !== "all" && !(meta.batches || []).map(String).includes(String(batch)))
        return false;
      if (verdict !== "all" && !(meta.verdicts || []).includes(verdict))
        return false;

      return true;
    });

  const companiesWithStories = useMemo(
    () => companies.filter((c) => c.story_count > 0),
    [companies]
  );

  const trimmedSearch = searchQuery.trim();
  const visibleCompanies = filterCompanies(
    companiesWithStories,
    trimmedSearch,
    jobFilter,
    degreeFilter,
    batchFilter,
    verdictFilter
  );

  const companyGridClass =
    visibleCompanies.length <= 6
      ? "grid max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[430px] overflow-y-auto pr-1";

  const openCompany = (company) => {
    markDirectoryCompanyNavigation();
    router.push(companyBrowsePath(company.id));
  };

  return (
    <BrowseShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrowseToaster />
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Company directory
          </div>
          <H text="Browse Companies" styles="text-gray-900" />
          <P
            styles="mx-auto max-w-xl"
            text="Choose a company to read placement stories from seniors."
          />
          <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-center sm:px-5">
            <p className="text-sm leading-relaxed text-slate-600">
              After reading a story, rate how helpful it was.{" "}
              <span className="inline-flex items-center gap-1 align-middle">
                <span
                  aria-hidden
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700 shadow-sm"
                >
                  ▲ <span className="tabular-nums">12</span>
                </span>
              </span>{" "}
              when an experience felt credible — it helps juniors find the good
              ones.{" "}
              <span className="inline-flex items-center gap-1 align-middle">
                <span
                  aria-hidden
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm"
                >
                  ▼ <span className="tabular-nums">2</span>
                </span>
              </span>{" "}
              if it wasn&apos;t useful, so others know to look at a different
              experience.
            </p>
          </div>
        </div>

        {loadingCompanies ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10 shadow-sm">
            <Spinner color="default" labelColor="foreground" className="text-xs">
              Loading companies...
            </Spinner>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Companies with stories
                </h2>
                <p className="text-xs text-gray-500">
                  {hasActiveFilters
                    ? `${visibleCompanies.length} of ${companiesWithStories.length} companies`
                    : `${visibleCompanies.length} ${visibleCompanies.length === 1 ? "company" : "companies"}`}
                </p>
              </div>
              <Input
                aria-label="Search companies"
                className="w-full md:max-w-xs"
                placeholder="Search company..."
                startContent={<CiSearch className="text-gray-400" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                color="default"
                variant="bordered"
                size="sm"
              />
            </div>

            {/* Filter bar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Select
                aria-label="Filter by Job Type"
                className="w-full sm:w-[150px]"
                placeholder="Job Type"
                selectedKeys={[jobFilter]}
                onChange={(e) => setJobFilter(e.target.value)}
                color="default"
                variant="bordered"
                size="sm"
              >
                <SelectItem key="all" value="all">All Roles</SelectItem>
                <SelectItem key="intern" value="intern">Internship</SelectItem>
                <SelectItem key="fte" value="fte">FTE</SelectItem>
                <SelectItem key="intern_fte" value="intern_fte">Intern + FTE</SelectItem>
              </Select>
              <Select
                aria-label="Filter by Degree"
                className="w-full sm:w-[150px]"
                placeholder="Degree"
                selectedKeys={[degreeFilter]}
                onChange={(e) => setDegreeFilter(e.target.value)}
                color="default"
                variant="bordered"
                size="sm"
              >
                <SelectItem key="all" value="all">All Degrees</SelectItem>
                {DEGREE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                aria-label="Filter by Batch"
                className="w-full sm:w-[140px]"
                placeholder="Batch"
                selectedKeys={[batchFilter]}
                onChange={(e) => setBatchFilter(e.target.value)}
                color="default"
                variant="bordered"
                size="sm"
              >
                <SelectItem key="all" value="all">All Batches</SelectItem>
                {allBatches.map((b) => (
                  <SelectItem key={b} value={b}>
                    Batch {b}
                  </SelectItem>
                ))}
              </Select>
              <Select
                aria-label="Filter by Verdict"
                className="w-full sm:w-[140px]"
                placeholder="Verdict"
                selectedKeys={[verdictFilter]}
                onChange={(e) => setVerdictFilter(e.target.value)}
                color="default"
                variant="bordered"
                size="sm"
              >
                <SelectItem key="all" value="all">All Verdicts</SelectItem>
                <SelectItem key="selected" value="selected">Selected</SelectItem>
                <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
              </Select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <FiX size={12} />
                  Clear
                </button>
              )}
            </div>

            {visibleCompanies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                {trimmedSearch || hasActiveFilters
                  ? "No companies match your filters."
                  : "No stories have been shared yet."}
              </div>
            ) : (
              <div className={companyGridClass}>
                {visibleCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => openCompany(company)}
                    className="group min-h-[88px] rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                      {company.company_name}
                    </p>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-indigo-600 opacity-75 transition group-hover:opacity-100">
                      {company.story_count}{" "}
                      {company.story_count === 1 ? "story" : "stories"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BrowseShell>
  );
}
