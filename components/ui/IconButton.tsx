import Link from "next/link";
import { cx } from "@/lib/cx";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/**
 * UI Library `IconButton`. `square` is the DS default (dialog close, admin);
 * `round` is the Lifestyle top-bar / camera circle; `menu` is the 44px menu or
 * close control. `count` adds the blue bubble and joins the accessible name.
 */
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  shape?: "square" | "round" | "menu";
  ghost?: boolean;
  count?: number;
  href?: string;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton(
    {
      label,
      shape = "square",
      ghost,
      count,
      href,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    const name = count ? `${label}, ${count}` : label;
    const classes = cx(
      "gg-icon-btn",
      shape !== "square" && `gg-icon-btn--${shape}`,
      ghost && "gg-icon-btn--ghost",
      className,
    );
    const bubble = count ? (
      <span className="gg-icon-btn__count" aria-hidden>
        {count}
      </span>
    ) : null;

    if (href) {
      return (
        <Link href={href} className={classes} aria-label={name}>
          {children}
          {bubble}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-label={name}
        className={classes}
        {...props}
      >
        {children}
        {bubble}
      </button>
    );
  },
);
