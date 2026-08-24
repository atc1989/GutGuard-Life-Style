"use client";

import { useSyncExternalStore } from "react";

const COLORS = ["#0608A9", "#B08D5B", "#EAFF18", "#F4F1EA"] as const;

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Confetti({ fire }: { fire: boolean }) {
  const motionOk = useSyncExternalStore(subscribe, motionAllowed, () => false);

  if (!fire || !motionOk) return null;

  const bits = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${8 + ((i * 17) % 84)}%`,
    delay: `${(i % 8) * 0.05}s`,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="gg-confetti" aria-hidden>
      {bits.map((bit) => (
        <i
          key={bit.id}
          className="gg-confetti__bit"
          style={{
            ["--gg-confetti-left" as string]: bit.left,
            ["--gg-confetti-delay" as string]: bit.delay,
            ["--gg-confetti-color" as string]: bit.color,
          }}
        />
      ))}
    </div>
  );
}
