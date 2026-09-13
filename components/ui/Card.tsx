import { cx } from "@/lib/cx";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  variant?: "commerce" | "editorial" | "ceremonial" | "stat" | "auth";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Card({
  variant = "commerce",
  className,
  style,
  children,
}: Props) {
  return (
    <div
      className={cx(
        "gg-card",
        variant === "editorial" && "gg-card--editorial",
        variant === "ceremonial" && "gg-card--ceremonial",
        variant === "stat" && "gg-card--stat",
        variant === "auth" && "gg-card--auth",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
