import type { StoryAction, StoryFilter } from "../schemas/stories";

export type StoryStatus = "pending" | "approved" | "flagged";

export type StoryRow = {
  id: string;
  userId: string;
  memberName: string;
  mobile: string;
  about: string;
  relationship: string | null;
  days: string;
  capsules: string;
  outcomes: string[];
  status: StoryStatus;
  createdAt: string;
};

export type StoryDirectoryResult = {
  rows: StoryRow[];
  matched: number;
  total: number;
  pendingCount: number;
  source: "live" | "preview";
  query: string;
  filter: StoryFilter;
  error?: string;
};

export function storyStatusLabel(status: StoryStatus): string {
  if (status === "approved") return "Approved";
  if (status === "flagged") return "Flagged";
  return "Pending";
}

export function storyBlurb(row: StoryRow): string {
  const who =
    row.about === "other" && row.relationship
      ? row.relationship
      : row.about === "other"
        ? "Someone close"
        : "Own story";
  const outcomes = row.outcomes.slice(0, 3).join(", ");
  return `${who} · ${row.days} days · ${row.capsules} caps${outcomes ? ` · ${outcomes}` : ""}`;
}

export function filterStories(
  rows: StoryRow[],
  query: string,
  filter: StoryFilter,
): StoryRow[] {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter !== "all" && row.status !== filter) return false;
    if (!needle) return true;
    return [row.memberName, row.mobile, storyBlurb(row), row.status]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

export function actionLabel(action: StoryAction): string {
  return action === "approved" ? "Approve" : "Flag";
}
