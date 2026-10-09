import { cx } from "@/lib/cx";
import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * Labelled input. `lifestyle` is the UI Library `TextField` (ink semibold
 * label, sans help line, paper control); `boxed` is the DS commerce field and
 * stays for admin (squared by `.gg-admin`); `ruled` is the DS booth field.
 */
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  error?: string;
  variant?: "boxed" | "ruled" | "lifestyle";
  hint?: ReactNode;
};

export function FormField({
  label,
  error,
  variant = "boxed",
  hint,
  id,
  className,
  ...props
}: Props) {
  const fieldId = id ?? props.name;
  const invalid = Boolean(error);
  const describedBy = [
    hint && (variant === "ruled" || !error) ? `${fieldId}-hint` : null,
    error ? `${fieldId}-error` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  if (variant === "ruled") {
    return (
      <div className={cx("gg-ruled-field", invalid && "has-error", className)}>
        <label className="gg-ruled-field__label" htmlFor={fieldId}>
          {label}
        </label>
        <input
          id={fieldId}
          className="gg-ruled-field__control"
          {...props}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
        {hint ? (
          <p className="gg-help" id={`${fieldId}-hint`}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p className="gg-field__error" id={`${fieldId}-error`}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const lifestyle = variant === "lifestyle";

  return (
    <label
      className={cx("gg-field", lifestyle && "gg-field--lifestyle", className)}
      htmlFor={fieldId}
    >
      <span className="gg-field__label">{label}</span>
      <input
        id={fieldId}
        className={cx(
          "gg-field__control",
          !lifestyle && !props["aria-label"] && "gg-field__control--lg",
        )}
        {...props}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      {hint && !error ? (
        <span className="gg-field__help" id={`${fieldId}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="gg-field__error" id={`${fieldId}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
