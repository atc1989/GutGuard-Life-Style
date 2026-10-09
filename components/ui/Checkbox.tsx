import { cx } from "@/lib/cx";
import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * UI Library `Checkbox`: native checkbox inside its label, so the whole line
 * toggles it and links inside still work. Blue accent.
 */
export function Checkbox({
  className,
  children,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
}) {
  return (
    <label className={cx("gg-checkbox", className)}>
      <input type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
}
