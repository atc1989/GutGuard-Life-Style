"use client";

import { STORIES } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import type { StoryStatus } from "@/lib/schemas/story-moderate";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";

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
  const mine = feed?.mine ?? [];
  const community = feed
    ? feed.community
    : feedError
      ? []
      : STORIES.map((story) => ({
          id: story.id,
          name: story.name,
          about: story.quote,
          outcomes: [] as string[],
          days: story.place,
        }));

  return (
    <div className="gg-cols">
      <div className="gg-col">
        <header className="gg-page-head">
          <h1 className="gg-page-head__title">My Story</h1>
          <p className="gg-page-head__lede">What the community is reporting, day by day.</p>
        </header>
        <div className="gg-share">
          <Button size="lg" onClick={() => open("share")}>
            Share my story
          </Button>
          <p className="gg-share__note">
            Gutguard is a food supplement with no approved therapeutic claims — results vary.
          </p>
        </div>

        {mine.length > 0 ? (
          <section className="gg-stack gg-stack--tight" aria-labelledby="gg-mine-title">
            <Eyebrow as="h2" id="gg-mine-title">
              Your submissions
            </Eyebrow>
            {mine.map((story) => (
              <Card
                key={story.id}
                title={story.about === "self" ? "Your own story" : story.about}
                aside={
                  <Badge tone="status" active={story.status === "approved"}>
                    {story.status}
                  </Badge>
                }
              >
                <p className="gg-help">{story.outcomes.join(", ") || "Waiting for review"}</p>
              </Card>
            ))}
          </section>
        ) : null}
      </div>

      <section className="gg-col" aria-labelledby="gg-feed-title">
        <div className="gg-section-head">
          <h2 className="gg-section-head__title" id="gg-feed-title">
            Stories of Hope
          </h2>
        </div>
        {feedError ? (
          <p className="gg-help" role="status">
            {feedError}
          </p>
        ) : null}
        {community.length === 0 ? (
          <EmptyState
            title="No approved stories yet."
            copy="Share yours — it appears here after review."
          />
        ) : (
          community.map((story) => (
            <article key={story.id} className="gg-story">
              <div className="gg-story__who">
                <Avatar name={story.name} tone="ink" />
                <p>
                  <strong>{story.name}</strong>
                  {story.days ? <span> · {story.days}</span> : null}
                </p>
              </div>
              <p className="gg-story__quote">“{story.about}”</p>
              {story.outcomes.length ? (
                <ul className="gg-story__tags" aria-label="Outcomes">
                  {story.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
