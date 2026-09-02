import { Alert } from "@/components/ui/Alert";
import { AdminStoriesClient } from "@/components/admin/AdminStoriesClient";
import { listAdminStories } from "@/lib/actions/admin";
import { storyStatusSchema } from "@/lib/schemas/story-moderate";

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const parsed = storyStatusSchema.safeParse(params.status);
  const status =
    params.status === "all" ? "all" : parsed.success ? parsed.data : "pending";
  const result = await listAdminStories({ status });

  if (!result.ok) {
    return (
      <div className="gg-stack">
        <h2 className="gg-heading" style={{ fontSize: 28 }}>
          Stories
        </h2>
        <Alert tone="error">{result.error}</Alert>
      </div>
    );
  }

  return (
    <AdminStoriesClient
      rows={result.rows}
      counts={result.counts}
      status={status}
    />
  );
}
