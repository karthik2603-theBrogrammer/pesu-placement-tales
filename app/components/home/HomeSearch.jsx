"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative mx-auto mt-8 w-full max-w-2xl"
    >
      <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <CiSearch className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search "system design", "Google", "HR round"...'
          className="w-full bg-transparent py-4 pl-12 pr-24 text-base text-slate-900 outline-none placeholder:text-slate-400"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
