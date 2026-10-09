import { cx } from "@/lib/cx";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { CSSProperties, ReactNode } from "react";

/**
 * Card. `panel` is the UI Library Lifestyle panel (paper, 16px, title + aside
 * badge); `commerce` / `editorial` / `ceremonial` / `stat` are the DS cards.
 * `eyebrow`, `title`, `aside` and `meta` are the Library's optional slots.
 */
type Props = {
  variant?: "panel" | "commerce" | "editorial" | "ceremonial" | "stat";
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleAs?: "h2" | "h3";
  aside?: ReactNode;
  meta?: ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function Card({
  variant = "panel",
  eyebrow,
  title,
  titleAs: Title = "h3",
  aside,
  meta,
  id,
  className,
  style,
  children,
}: Props) {
  return (
    <div
      id={id}
      className={cx(
        "gg-card",
        variant !== "commerce" && `gg-card--${variant}`,
        className,
      )}
      style={style}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title || aside ? (
        <div className="gg-card__head">
          {title ? <Title className="gg-card__title">{title}</Title> : <span />}
          {aside}
        </div>
      ) : null}
      {meta ? <p className="gg-card__meta">{meta}</p> : null}
      {children}
    </div>
  );
}
