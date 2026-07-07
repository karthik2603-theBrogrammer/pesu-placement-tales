"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Input } from "@nextui-org/react";
import BrowseToaster from "./components/BrowseToaster";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import H from "../components/Heading";
import P from "../components/Paragraph";
import BrowseShell from "./components/BrowseShell";
import {
  companyBrowsePath,
  markDirectoryCompanyNavigation,
} from "../../utils/browseRoutes";

export default function BrowseDirectoryPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoadingCompanies(true);
        const response = await fetch("/api/browse-companies");
        const data = await response.json();
        setCompanies(data.result || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    }
    fetchCompanies();
  }, []);

  const filterByName = (list, query) =>
    list.filter((company) =>
      company.company_name.toLowerCase().includes(query.toLowerCase())
    );

  const companiesWithStories = useMemo(
    () => companies.filter((c) => c.story_count > 0),
    [companies]
  );
  const companiesPending = useMemo(
    () => companies.filter((c) => !c.story_count),
    [companies]
  );

  const trimmedSearch = searchQuery.trim();
  const visibleWithStories = trimmedSearch
    ? filterByName(companiesWithStories, trimmedSearch)
    : companiesWithStories;
  const visiblePending = trimmedSearch
    ? filterByName(companiesPending, trimmedSearch)
    : companiesPending;

  const companyGridClass =
    visibleWithStories.length <= 6
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
          <div className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
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
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm"
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
          <div className="flex items-center justify-center rounded-3xl border border-amber-100 bg-white/70 p-10 shadow-sm">
            <Spinner color="warning" labelColor="warning" className="text-xs">
              Loading companies...
            </Spinner>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-amber-100 bg-white/75 p-4 shadow-sm backdrop-blur md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Companies with stories
                </h2>
                <p className="text-xs text-gray-500">
                  {visibleWithStories.length} with stories
                  {companiesPending.length > 0 && (
                    <> · {companiesPending.length} awaiting a first tale</>
                  )}
                </p>
              </div>
              <Input
                aria-label="Search companies"
                className="w-full md:max-w-sm"
                placeholder="Search company..."
                startContent={<CiSearch className="text-gray-400" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                color="warning"
                variant="bordered"
              />
            </div>

            {visibleWithStories.length === 0 && visiblePending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-8 text-center text-sm text-gray-500">
                No companies found.
              </div>
            ) : (
              <>
                {visibleWithStories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-6 text-center text-sm text-gray-500">
                    {trimmedSearch
                      ? "No companies with stories match your search."
                      : "No stories have been shared yet."}
                  </div>
                ) : (
                  <div className={companyGridClass}>
                    {visibleWithStories.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => openCompany(company)}
                        className="group min-h-[88px] rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
                      >
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                          {company.company_name}
                        </p>
                        <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-amber-600 opacity-75 transition group-hover:opacity-100">
                          {company.story_count}{" "}
                          {company.story_count === 1 ? "story" : "stories"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {visiblePending.length > 0 && (
                  <div className="mt-6 border-t border-dashed border-amber-100/80 pt-5">
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      In our directory — no stories yet
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {visiblePending.map((company) => (
                        <span
                          key={company.id}
                          className="cursor-default rounded-full border border-dashed border-slate-200/90 bg-slate-50/60 px-3 py-1.5 text-xs text-slate-500 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/50 hover:text-amber-800"
                        >
                          {company.company_name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">
                      These companies are listed — stories may appear here later.{" "}
                      <Link
                        href="/add-student"
                        className="text-amber-600/80 underline-offset-2 hover:text-amber-700 hover:underline"
                      >
                        Share yours
                      </Link>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </BrowseShell>
  );
}
