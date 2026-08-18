"use client";

import { STORIES } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function StoryPage() {
  const { open } = useOverlay();

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
      <div className="gg-grid-2">
        {STORIES.map((story) => (
          <Card key={story.id}>
            <p className="gg-eyebrow">{story.place}</p>
            <h2 className="gg-heading" style={{ fontSize: 26, marginTop: 6 }}>
              {story.name}
            </h2>
            <p className="gg-lede" style={{ marginTop: 8 }}>
              {story.quote}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
