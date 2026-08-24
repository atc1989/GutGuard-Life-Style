"use client";

import { useMemo } from "react";

function modulesForSeed(seed: string) {
  let a = 7;
  for (let i = 0; i < seed.length; i += 1) {
    a = (a * 31 + seed.charCodeAt(i)) % 99991;
  }
  const grid = Array.from({ length: 21 }, () => Array(21).fill(false));
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      a = (a * 1103515245 + 12345) % 2147483648;
      grid[y][x] = ((a >> 16) & 1) === 1;
    }
  }
  const stamp = (ox: number, oy: number) => {
    for (let h = -1; h <= 7; h += 1) {
      for (let v = -1; v <= 7; v += 1) {
        const y = oy + h;
        const x = ox + v;
        if (y < 0 || x < 0 || y >= 21 || x >= 21) continue;
        const ring = h === 0 || h === 6 || v === 0 || v === 6;
        const core = h >= 2 && h <= 4 && v >= 2 && v <= 4;
        grid[y][x] = ring || core;
      }
    }
  };
  stamp(0, 0);
  stamp(0, 14);
  stamp(14, 0);
  return grid;
}

export function QRBlock({ seed, size = 196 }: { seed: string; size?: number }) {
  const grid = useMemo(() => modulesForSeed(seed), [seed]);
  const cell = size / grid.length;

  return (
    <div className="gg-qr">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <rect width={size} height={size} fill="#fcfaf5" />
        {grid.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${y}-${x}`}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill="#0f0f18"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
