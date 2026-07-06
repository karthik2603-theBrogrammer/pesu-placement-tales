"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";
import StoryFeedSection from "./StoryFeedSection";

export default function RecentStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/recent-stories");
        const data = await res.json();
        if (res.ok) setStories(data.result || []);
      } catch (error) {
        console.error("Recent stories load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 flex justify-center py-8">
        <Spinner color="warning" size="sm" label="Loading recent stories..." />
      </div>
    );
  }

  return (
    <StoryFeedSection
      eyebrow="Fresh from the community"
      title="Recently shared"
      stories={stories}
      showBrowseLink
      className="mt-12"
    />
  );
}
