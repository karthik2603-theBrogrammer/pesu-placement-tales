"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, usePathname } from "next/navigation";
import posthog from "posthog-js";
import { toast } from "sonner";
import BrowseToaster from "./BrowseToaster";
import { activePlacementKey } from "../../../utils/placementType";
import {
  consumeCompanyNavigationSource,
  isStoryBrowsePath,
} from "../../../utils/browseRoutes";
import {
  computeVoteDelta,
  loadUserVotes,
  saveUserVotes,
} from "../../../utils/storyVotes";
import BrowseShell from "./BrowseShell";
import StorySidebar from "./StorySidebar";

const CompanyBrowseContext = createContext(null);

export function useCompanyBrowse() {
  const ctx = useContext(CompanyBrowseContext);
  if (!ctx) {
    throw new Error("useCompanyBrowse must be used within CompanyBrowseProvider");
  }
  return ctx;
}

function CompanyBrowseProvider({ companyId, children }) {
  const pathname = usePathname();
  const [stories, setStories] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const companyTrackedRef = useRef(false);

  const isStoryView = isStoryBrowsePath(pathname);

  useEffect(() => {
    setUserVotes(loadUserVotes());
  }, []);

  useEffect(() => {
    if (!companyId || Number.isNaN(Number(companyId))) {
      setError("Invalid company.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/getStudentsByCompany/${companyId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load stories.");
        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        setStories(list);
        setCompanyName(list[0]?.company_name || "");
        setLoading(false);

        if (!companyTrackedRef.current) {
          companyTrackedRef.current = true;
          const source = consumeCompanyNavigationSource();
          posthog.capture("company_selected", {
            company_name: list[0]?.company_name || "",
            company_id: Number(companyId),
            story_count: list.length,
            source,
            page_path: `/browse/${companyId}`,
          });
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Company browse load error:", err);
        setError(err.message || "Failed to load stories.");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    if (!isStoryView) setMobileSidebarOpen(false);
  }, [isStoryView]);

  const getStoryById = useCallback(
    (storyId) =>
      stories.find((s) => String(s.student_id) === String(storyId)) ?? null,
    [stories]
  );

  const updateStoryVotes = useCallback((storyId, upvote, downvote) => {
    setStories((list) =>
      list.map((item) =>
        String(item.student_id) === String(storyId)
          ? { ...item, upvote, downvote }
          : item
      )
    );
  }, []);

  const handleVote = useCallback(
    async (storyId, target, voteSource = "reader") => {
      const story = getStoryById(storyId);
      if (!story) return;

      const prev = userVotes[storyId];
      const { upDelta, downDelta, nextVote } = computeVoteDelta(prev, target);

      try {
        const response = await fetch("/api/vote-student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-posthog-distinct-id": posthog.get_distinct_id() ?? "",
          },
          body: JSON.stringify({ studentId: storyId, upDelta, downDelta }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Vote failed.");

        updateStoryVotes(storyId, data.upvote, data.downvote);

        posthog.capture("story_voted", {
          student_id: storyId,
          vote_direction: target,
          company_name: companyName,
          company_id: Number(companyId),
          job_title: story.job_title || "",
          batch_of: story.batch_of,
          year_placed: story.year_placed,
          verdict: story.verdict,
          placement_type: activePlacementKey(story) || "unknown",
          vote_source: voteSource,
          page_path: pathname,
        });

        const nextVotes = { ...userVotes };
        if (nextVote) nextVotes[storyId] = nextVote;
        else delete nextVotes[storyId];
        setUserVotes(nextVotes);
        saveUserVotes(nextVotes);
      } catch (err) {
        console.error("Vote error:", err);
        toast.error(err.message || "Could not register your vote.");
      }
    },
    [
      companyId,
      companyName,
      getStoryById,
      pathname,
      updateStoryVotes,
      userVotes,
    ]
  );

  const value = useMemo(
    () => ({
      companyId: Number(companyId),
      companyName,
      stories,
      loading,
      error,
      userVotes,
      handleVote,
      getStoryById,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      isStoryView,
    }),
    [
      companyId,
      companyName,
      stories,
      loading,
      error,
      userVotes,
      handleVote,
      getStoryById,
      mobileSidebarOpen,
      isStoryView,
    ]
  );

  return (
    <CompanyBrowseContext.Provider value={value}>
      <BrowseShell>
        <BrowseToaster />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {loading ? (
            <p className="py-16 text-center text-sm text-amber-700">Loading…</p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red-600">{error}</p>
          ) : isStoryView ? (
            <div className="flex min-h-[calc(100vh-8rem)] gap-0 lg:gap-4">
              <StorySidebar
                companyId={companyId}
                stories={stories}
                userVotes={userVotes}
                onVote={(id, dir) => handleVote(id, dir, "sidebar")}
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
              />
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
      </BrowseShell>
    </CompanyBrowseContext.Provider>
  );
}

export default function CompanyBrowseLayout({ children }) {
  const params = useParams();
  const companyId = params?.companyId;

  return (
    <CompanyBrowseProvider companyId={companyId}>{children}</CompanyBrowseProvider>
  );
}

export { CompanyBrowseContext };
