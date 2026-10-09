import Link from "next/link";
import { cx } from "@/lib/cx";
import { Spinner } from "@/components/ui/Spinner";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * UI Library `Button`. `secondary` and `signout` are kept as aliases of the
 * outline look so DS call sites (admin) read the same; the Admin shell squares
 * every variant through `.gg-admin`.
 */
type Variant =
  | "primary"
  | "dark"
  | "light"
  | "outline"
  | "ghost"
  | "link"
  | "secondary"
  | "signout";

type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  /** Renders a Next `<Link>` styled as the button instead of a `<button>`. */
  href?: string;
  children: ReactNode;
};

export function buttonClass({
  variant = "primary",
  size = "md",
  block,
  loading,
  className,
}: {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return cx(
    "gg-button",
    `gg-button--${variant}`,
    size !== "md" && `gg-button--${size}`,
    block && "gg-button--block",
    loading && "gg-button--loading",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  loading,
  className,
  type = "button",
  disabled,
  href,
  children,
  ...props
}: Props) {
  const classes = buttonClass({ variant, size, block, loading, className });

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {loading ? <Spinner label="Working" /> : null}
      {children}
    </button>
  );
}
