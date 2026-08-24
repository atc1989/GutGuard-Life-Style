import { cx } from "@/lib/cx";
import { Spinner } from "@/components/ui/Spinner";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "editorial"
  | "commerce"
  | "pill"
  | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({
  variant = "primary",
  block,
  loading,
  className,
  type = "button",
  disabled,
  children,
  ref,
  ...props
}: Props) {
  const hasStatusSlot = typeof loading === "boolean";

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "gg-button",
        `gg-button--${variant}`,
        block && "gg-button--block",
        loading && "gg-button--loading",
        hasStatusSlot && "gg-button--status",
        className,
      )}
    >
      {hasStatusSlot ? (
        <span className="gg-button__icon" aria-hidden="true">
          {loading ? <Spinner decorative /> : null}
        </span>
      ) : null}
      {children}
    </button>
  );
}
