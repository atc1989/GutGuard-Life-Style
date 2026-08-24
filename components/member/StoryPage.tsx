"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useOverlay } from "@/lib/overlay-store";
import type { FeedStory } from "@/lib/member-data";

export function StoryPage({
  published,
  own,
  mock,
}: {
  published: FeedStory[];
  own: FeedStory[];
  mock: boolean;
}) {
  const { open } = useOverlay();

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Story</h1>
          <p className="gg-lede">
            What the community is reporting, day by day.
            {mock ? " Preview quotes until operators approve live stories." : ""}
          </p>
        </div>
        <Button variant="commerce" onClick={() => open("share")}>
          Share my story
        </Button>
      </div>
      {own.length > 0 ? (
        <div className="gg-stack">
          <p className="gg-eyebrow">Your submissions</p>
          <div className="gg-grid-2">
            {own.map((story) => (
              <Card key={story.id}>
                <p className="gg-eyebrow">{story.kicker}</p>
                <h2 className="gg-heading gg-story-name">{story.name}</h2>
                <p className="gg-lede gg-story-quote">{story.body}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
      <div className="gg-grid-2">
        {published.length === 0 ? (
          <Card>
            <p className="gg-eyebrow">Community</p>
            <h2 className="gg-heading gg-story-name">Nothing approved yet</h2>
            <p className="gg-lede gg-story-quote">
              Stories wait in the operator queue. After approval they land here.
            </p>
          </Card>
        ) : (
          published.map((story) => (
            <Card key={story.id}>
              <p className="gg-eyebrow">{story.kicker}</p>
              <h2 className="gg-heading gg-story-name">{story.name}</h2>
              <p className="gg-lede gg-story-quote">{story.body}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
