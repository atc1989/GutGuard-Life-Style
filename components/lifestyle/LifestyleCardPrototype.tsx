"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./LifestyleCardPrototype.module.css";

/**
 * Placeholder Lifestyle card at the physical ID-1 ratio. It is a test visual,
 * not the approved artwork and not anybody's real card — swap the inner face
 * when the design lands and the wrapper, ratio, and sizing stay as they are.
 *
 * Tilt and glare are progressive enhancement: handlers are only attached for a
 * fine pointer that can hover, and never under `prefers-reduced-motion`. The
 * card is not actionable, so it is deliberately not a tab stop.
 */

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
// Restrained. A card that spins reads as a toy, not as a member card.
const MAX_TILT_DEG = 5;

export function LifestyleCardPrototype({
  interactive = true,
}: {
  /** `/register` keeps the card static so motion never competes with typing. */
  interactive?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tiltable, setTiltable] = useState(false);

  useEffect(() => {
    if (!interactive) return;
    const fine = window.matchMedia(FINE_POINTER);
    const reduced = window.matchMedia(REDUCED_MOTION);
    const sync = () => setTiltable(fine.matches && !reduced.matches);
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [interactive]);

  const rest = useCallback(() => {
    const node = wrapRef.current;
    if (!node) return;
    node.style.removeProperty("--gg-card-rx");
    node.style.removeProperty("--gg-card-ry");
    node.style.removeProperty("--gg-card-glare");
  }, []);

  // Written straight to the element rather than through state: this fires on
  // every pointer move and must not re-render the page around it.
  const track = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const node = wrapRef.current;
      if (!node || !tiltable) return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      node.style.setProperty("--gg-card-ry", `${(x - 0.5) * 2 * MAX_TILT_DEG}deg`);
      node.style.setProperty("--gg-card-rx", `${(0.5 - y) * 2 * MAX_TILT_DEG}deg`);
      node.style.setProperty("--gg-card-gx", `${(x * 100).toFixed(1)}%`);
      node.style.setProperty("--gg-card-gy", `${(y * 100).toFixed(1)}%`);
      node.style.setProperty("--gg-card-glare", "1");
    },
    [tiltable],
  );

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onPointerMove={tiltable ? track : undefined}
      onPointerLeave={tiltable ? rest : undefined}
      onPointerCancel={tiltable ? rest : undefined}
    >
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Gutguard Lifestyle</span>
          <span className={styles.eyebrow}>Test card</span>
        </div>
        <p className={styles.wordmark}>
          A card and
          <br />
          an invitation
        </p>
        <div className={styles.foot}>
          <span className={styles.number}>0000 0000 0000</span>
          <span className={styles.eyebrow}>Specimen</span>
        </div>
        <span className={styles.glare} aria-hidden="true" />
      </div>
    </div>
  );
}
