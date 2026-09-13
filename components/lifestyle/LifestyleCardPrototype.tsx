"use client";

import { useRef, useState, type PointerEvent } from "react";
import styles from "./LifestyleCardPrototype.module.css";

type Props = {
  /** Pointer tilt/glare — off on auth so motion does not compete with forms. */
  enableTilt?: boolean;
  className?: string;
};

export function LifestyleCardPrototype({
  enableTilt = true,
  className,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [tilting, setTilting] = useState(false);

  function resetTilt() {
    const shell = shellRef.current;
    if (!shell) return;
    const card = shell.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    card.style.transform = "";
    card.style.setProperty("--glare-x", "50%");
    card.style.setProperty("--glare-y", "30%");
    setTilting(false);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!enableTilt) return;
    if (event.pointerType !== "mouse") return;
    const shell = shellRef.current;
    if (!shell) return;
    const card = shell.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const rect = shell.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 10;
    const rotateX = (0.5 - y) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
    card.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
    setTilting(true);
  }

  return (
    <div
      ref={shellRef}
      className={[styles.shell, className].filter(Boolean).join(" ")}
      data-tilt={enableTilt ? "true" : "false"}
      data-tilting={tilting ? "true" : "false"}
      onPointerMove={enableTilt ? onPointerMove : undefined}
      onPointerLeave={enableTilt ? resetTilt : undefined}
      aria-hidden="true"
    >
      <div className={styles.card} data-card>
        <div className={styles.art}>
          <p className={styles.mark}>Gutguard Lifestyle</p>
          <h2 className={styles.title}>Test card</h2>
          <div className={styles.meta}>
            <p className={styles.label}>Placeholder</p>
            <p className={styles.number}>0000 0000 0000</p>
          </div>
        </div>
        {enableTilt ? <div className={styles.glare} aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
