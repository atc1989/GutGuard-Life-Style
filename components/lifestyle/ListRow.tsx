import { cx } from "@/lib/cx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * UI Library `ListRow`: bold title + grey sub line. Tappable rows end in a blue
 * "›"; static rows (`as="div"`) hold their own action on the right. `href`
 * renders a plain anchor — used for the cross-origin spoke links too.
 */
type Props = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  as?: "button" | "div";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title" | "children">;

export function ListRow({
  title,
  description,
  icon,
  trailing,
  href,
  as = "button",
  className,
  ...rest
}: Props) {
  const tappable = as === "button" || Boolean(href);
  const body = (
    <>
      {icon ? (
        <span className="gg-list-row__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="gg-list-row__main">
        <span className="gg-list-row__title">{title}</span>
        {description ? (
          <span className="gg-list-row__desc">{description}</span>
        ) : null}
      </span>
      {trailing ?? (tappable ? (
        <span className="gg-list-row__chev" aria-hidden>
          ›
        </span>
      ) : null)}
    </>
  );
  const classes = cx("gg-list-row", tappable && "gg-tap", className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {body}
      </a>
    );
  }
  if (as === "div") {
    return <div className={classes}>{body}</div>;
  }
  return (
    <button type="button" className={classes} {...rest}>
      {body}
    </button>
  );
}
