import { cx } from "@/lib/cx";
import { Avatar } from "@/components/ui/Avatar";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * UI Library `PersonRow`: a person in a paper box — avatar, name, a line under
 * it, something on the right. Use `as="button"` only when the row holds no
 * buttons of its own.
 */
type Props = {
  variant?: "family" | "team" | "sponsor";
  /** Name used for the initials; omit on `team` to drop the avatar. */
  initialsFrom?: string;
  name: ReactNode;
  note?: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  as?: "div" | "button";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function PersonRow({
  variant = "family",
  initialsFrom,
  name,
  note,
  description,
  trailing,
  children,
  as = "div",
  className,
  ...rest
}: Props) {
  const body = (
    <>
      <div className="gg-person__row">
        {initialsFrom ? (
          <Avatar name={initialsFrom} tone={variant === "sponsor" ? "ink" : "bone"} />
        ) : null}
        <div className="gg-person__main">
          <p className="gg-person__name">
            {name}
            {note ? <span className="gg-person__note"> · {note}</span> : null}
          </p>
          {description ? <div className="gg-person__desc">{description}</div> : null}
        </div>
        {trailing ? (
          <div className="gg-person__trailing">
            {typeof trailing === "string" ? (
              <span className="gg-action-text">{trailing} ›</span>
            ) : (
              trailing
            )}
          </div>
        ) : null}
      </div>
      {children ? <div className="gg-person__extra">{children}</div> : null}
    </>
  );

  const classes = cx("gg-person", `gg-person--${variant}`, className);

  if (as === "button") {
    return (
      <button type="button" className={cx(classes, "gg-tap")} {...rest}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}
