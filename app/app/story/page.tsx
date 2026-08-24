import { StoryPage } from "@/components/member/StoryPage";
import { loadStoryFeed } from "@/lib/member-data";

export default async function Page() {
  const feed = await loadStoryFeed();
  return (
    <StoryPage published={feed.published} own={feed.own} mock={feed.mock} />
  );
}
