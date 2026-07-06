"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";
import StoryFeedSection from "./StoryFeedSection";

export default function TrendingStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trending-stories");
        const data = await res.json();
        if (res.ok) setStories(data.result || []);
      } catch (error) {
        console.error("Trending stories load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-20 flex justify-center py-8">
        <Spinner color="warning" size="sm" label="Loading trending stories..." />
      </div>
    );
  }

  return (
    <StoryFeedSection
      eyebrow="Most engagement"
      title="Trending"
      stories={stories}
      className="mt-20"
    />
  );
}
