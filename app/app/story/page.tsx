import { StoryPage } from "@/components/member/StoryPage";
import { listFeedStories } from "@/lib/actions/admin";

export default async function Page() {
  const result = await listFeedStories();
  if (!result.ok) {
    return <StoryPage feedError={result.error} />;
  }
  return <StoryPage feed={{ community: result.community, mine: result.mine }} />;
}
