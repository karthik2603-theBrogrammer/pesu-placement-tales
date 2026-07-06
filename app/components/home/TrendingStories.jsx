import StoryFeedSection from "./StoryFeedSection";

export default function TrendingStories({ stories = [], sortBy = "votes" }) {
  const eyebrow =
    sortBy === "browse" ? "Most browsed companies" : "Most engagement";

  return (
    <StoryFeedSection
      eyebrow={eyebrow}
      title="Trending"
      stories={stories}
      className="mt-20"
    />
  );
}
