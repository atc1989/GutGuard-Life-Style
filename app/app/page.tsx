import { LifestyleMemberClient } from "@/components/prototype/ClientPages";
import { listFeedStories } from "@/lib/actions/admin";
import { loadPrototypeMember } from "@/lib/lifestyle/load-prototype-member";

/** The member page: the approved prototype, filled with the signed-in member's own data. */
export default async function MemberPage() {
  const [live, feed] = await Promise.all([loadPrototypeMember(), listFeedStories()]);
  return <LifestyleMemberClient live={live} feed={feed.ok ? feed.community : []} />;
}
