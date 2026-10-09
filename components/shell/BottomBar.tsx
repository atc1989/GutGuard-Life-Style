"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOverlay } from "@/lib/overlay-store";

export function BottomBar() {
  const { open } = useOverlay();
  return (
    <aside className="gg-bottom-bar" aria-label="Order Gutguard">
      <div className="gg-bottom-bar__inner">
        <Button variant="commerce" block onClick={() => open("order")}>
          <ShoppingBag aria-hidden />
          <span>Order now</span>
        </Button>
      </div>
    </aside>
  );
}
