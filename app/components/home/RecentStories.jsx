import StoryFeedSection from "./StoryFeedSection";

export default function RecentStories({ stories = [] }) {
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
