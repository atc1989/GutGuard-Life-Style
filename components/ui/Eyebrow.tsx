import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

/**
 * UI Library `Eyebrow`, set in Inter Tight micro-label caps (owner ruling: no
 * IBM Plex Mono). `gold` labels groups and cards, `blue` + `rule` heads a hero,
 * `light` sits on blue / dark bands.
 */
export function Eyebrow({
  tone = "gold",
  rule,
  as: Tag = "p",
  id,
  className,
  children,
}: {
  tone?: "blue" | "gold" | "light";
  rule?: boolean;
  as?: "p" | "span" | "div" | "h2" | "h3";
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cx(
        "gg-eyebrow",
        `gg-eyebrow--${tone}`,
        rule && "gg-eyebrow--rule",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
