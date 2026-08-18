"use client";

import { Button } from "@/components/ui/Button";
import { useOverlay } from "@/lib/overlay-store";

export function BottomBar() {
  const { open } = useOverlay();
  return (
    <div className="gg-bottom-bar">
      <div className="gg-bottom-bar__inner">
        <Button variant="commerce" block onClick={() => open("order")}>
          Order now
        </Button>
      </div>
    </div>
  );
}
