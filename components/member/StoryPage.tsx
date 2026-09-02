"use client";

import { STORIES } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { StoryStatus } from "@/lib/schemas/story-moderate";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Feed = {
  community: {
    id: string;
    name: string;
    about: string;
    outcomes: string[];
    days: string;
  }[];
  mine: {
    id: string;
    status: StoryStatus;
    about: string;
    outcomes: string[];
  }[];
};

export function StoryPage({
  feed,
  feedError,
}: {
  feed?: Feed;
  feedError?: string;
}) {
  const { open } = useOverlay();
  const useLive = isSupabaseConfigured() && feed;
  const community = useLive
    ? feed.community
    : STORIES.map((story) => ({
        id: story.id,
        name: story.name,
        about: story.quote,
        outcomes: [] as string[],
        days: story.place,
      }));

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Story</h1>
          <p className="gg-lede">
            What the community is reporting, day by day.
          </p>
        </div>
        <Button variant="commerce" onClick={() => open("share")}>
          Share my story
        </Button>
      </div>
      <p className="gg-alert gg-story-disclaimer">
        Gutguard is a food supplement with no approved therapeutic claims — results vary.
      </p>

      {feedError ? (
        <p className="gg-help" role="status">
          {feedError}
        </p>
      ) : null}

      {useLive && feed.mine.length > 0 ? (
        <div className="gg-stack">
          <p className="gg-eyebrow">Your submissions</p>
          {feed.mine.map((story) => (
            <Card key={story.id}>
              <Badge active={story.status === "approved"}>{story.status}</Badge>
              <p className="gg-lede" style={{ marginTop: 8 }}>
                {story.about === "self" ? "Your own story" : story.about}
              </p>
              <p className="gg-help" style={{ marginTop: 6 }}>
                {story.outcomes.join(", ") || "Waiting for review"}
              </p>
            </Card>
          ))}
        </div>
      ) : null}

      {community.length === 0 ? (
        <div className="gg-empty">
          <strong>No approved stories yet.</strong>
          <p>Share yours — it appears here after review.</p>
        </div>
      ) : (
        <div className="gg-grid-2">
          {community.map((story) => (
            <Card key={story.id}>
              <p className="gg-eyebrow">{story.days}</p>
              <h2 className="gg-heading" style={{ fontSize: 26, marginTop: 6 }}>
                {story.name}
              </h2>
              <p className="gg-lede" style={{ marginTop: 8 }}>
                {story.about}
              </p>
              {story.outcomes.length ? (
                <p className="gg-help" style={{ marginTop: 8 }}>
                  {story.outcomes.join(", ")}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
