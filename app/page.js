import Link from "next/link";
import HomeSearch from "./components/home/HomeSearch";
import TrendingStories from "./components/home/TrendingStories";
import RecentStories from "./components/home/RecentStories";
import { getDb, isDbConfigured } from "../utils/db";
import { getTrendingStories } from "../utils/trendingStories";
import { fetchRecentStories } from "../utils/recentStories";

export const revalidate = 300;

const highlights = [
  "Company-specific insights",
  "Real interview patterns",
  "Full-text story search",
];

async function loadHomeFeeds() {
  if (!isDbConfigured()) {
    return {
      trending: { result: [], sortBy: "votes" },
      recent: [],
      stats: { companies: 0, stories: 0 },
    };
  }

  try {
    const sql = getDb();
    const [trending, recent, companyCountRes, storyCountRes] = await Promise.all([
      getTrendingStories(sql),
      fetchRecentStories(sql),
      sql`SELECT count(*) FROM company`,
      sql`SELECT count(*) FROM student_placed`,
    ]);
    const stats = {
      companies: parseInt(companyCountRes[0]?.count || "0", 10),
      stories: parseInt(storyCountRes[0]?.count || "0", 10),
    };
    return { trending, recent, stats };
  } catch (error) {
    console.error("Home feed load error:", error);
    return {
      trending: { result: [], sortBy: "votes" },
      recent: [],
      stats: { companies: 0, stories: 0 },
    };
  }
}

export default async function Home() {
  const { trending, recent, stats } = await loadHomeFeeds();

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-950 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(148,163,184,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_80%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-indigo-300/15 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-slate-300/25 blur-3xl" />

      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="mb-5 w-fit rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-sm">
          PESU Placement Tales
        </p>

        <h1 className="text-5xl font-serif font-black leading-tight tracking-tight sm:text-7xl text-slate-900">
          Placement wisdom,
          <span className="block text-indigo-700 pb-2">
            straight from your seniors
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Search through <span className="font-semibold text-slate-900">{stats.stories.toLocaleString()}</span> stories across <span className="font-semibold text-slate-900">{stats.companies.toLocaleString()}</span> companies. Read seniors&apos; experiences, search across all stories, prepare sharper, and share what you know.
        </p>

        <HomeSearch />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/browse"
            className="rounded-xl bg-white border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Browse directory
          </Link>
          <Link
            href="/add-student"
            className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline"
          >
            Share your story
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {highlights.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="px-4 pb-20 sm:px-6 lg:px-8">
        <TrendingStories stories={trending.result} sortBy={trending.sortBy} />
        <RecentStories stories={recent} />
      </div>
      
      {/* Bottom CTA */}
      <section className="relative z-10 border-t border-slate-200 bg-white px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-black tracking-tight text-slate-900 sm:text-4xl">
          Help the next batch
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600 leading-relaxed text-base">
          The best way to prepare is learning from those who just went through it. 
          If you recently got placed, take 5 minutes to share your experience.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/add-student"
            className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            Share your story
          </Link>
          <Link
            href="/pass-the-torch"
            className="rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Pass the torch
          </Link>
        </div>
      </section>
    </main>
  );
}
