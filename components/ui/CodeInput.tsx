import { cx } from "@/lib/cx";
import type { InputHTMLAttributes } from "react";

/**
 * UI Library `CodeInput`: one wide input with big spaced digits and a dotted
 * placeholder. The heading and "Send again" belong to the caller.
 */
export function CodeInput({
  label,
  length = 6,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "maxLength" | "pattern"> & {
  label: string;
  length?: number;
}) {
  return (
    <input
      className={cx("gg-code-input", className)}
      aria-label={label}
      inputMode="numeric"
      autoComplete="one-time-code"
      spellCheck={false}
      maxLength={length}
      pattern={`[0-9]{${length}}`}
      placeholder={Array.from({ length }, () => "•").join(" ")}
      {...props}
    />
  );
}
