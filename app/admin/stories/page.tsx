import { ModerationQueue } from "@/components/admin/ModerationQueue";
import { loadStoryDirectory } from "@/lib/actions/stories";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const directory = await loadStoryDirectory(params);
  return <ModerationQueue directory={directory} />;
}
