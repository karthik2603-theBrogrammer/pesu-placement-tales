import Link from "next/link";
import TrendingStories from "./components/home/TrendingStories";
import RecentStories from "./components/home/RecentStories";
import CreatorNote from "./components/home/CreatorNote";
import { getDb, isDbConfigured } from "../utils/db";
import { getTrendingStories } from "../utils/trendingStories";
import { fetchRecentStories } from "../utils/recentStories";

export const revalidate = 300;

const highlights = [
  "Company-specific insights",
  "Real interview patterns",
  "Open source & community-built",
];

async function loadHomeFeeds() {
  if (!isDbConfigured()) {
    return {
      trending: { result: [], sortBy: "votes" },
      recent: [],
    };
  }

  try {
    const sql = getDb();
    const [trending, recent] = await Promise.all([
      getTrendingStories(sql),
      fetchRecentStories(sql),
    ]);
    return { trending, recent };
  } catch (error) {
    console.error("Home feed load error:", error);
    return {
      trending: { result: [], sortBy: "votes" },
      recent: [],
    };
  }
}

export default async function Home() {
  const { trending, recent } = await loadHomeFeeds();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-white px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(180,83,9,0.32)_1.2px,transparent_1.2px),linear-gradient(90deg,rgba(180,83,9,0.32)_1.2px,transparent_1.2px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_top,black,transparent_95%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.04),rgba(255,255,255,0.35))]" />

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="mb-5 w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
          PESU Placement Tales
        </p>

        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Placement wisdom,
          <span className="block bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent pb-2">
            straight from your seniors
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
          Placement information is limited and scattered — yet interview patterns
          often repeat within a company. Read seniors&apos; experiences, prepare
          sharper, and share what you know to lift the next batch.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/add-student"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-7 py-3 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
          >
            Share your story
          </Link>
          <Link
            href="/browse"
            className="rounded-xl border border-amber-300 bg-white/70 px-7 py-3 text-sm font-semibold text-amber-700 backdrop-blur transition hover:bg-amber-100"
          >
            Browse
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {highlights.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {item}
            </span>
          ))}
        </div>

        <CreatorNote />
      </section>

      <TrendingStories stories={trending.result} sortBy={trending.sortBy} />
      <RecentStories stories={recent} />
    </main>
  );
}
