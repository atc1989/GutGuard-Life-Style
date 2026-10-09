import { cx } from "@/lib/cx";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ReactNode } from "react";

/**
 * UI Library `OfferCard`, `box` variant: the Lifestyle paper offer box. Body
 * text goes in as children, buttons in `actions`. Only the slots a caller has
 * real copy for are rendered.
 */
export function OfferCard({
  eyebrow,
  title,
  titleAs: Title = "h3",
  titleId,
  badge,
  sign,
  note,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  titleAs?: "h1" | "h2" | "h3";
  titleId?: string;
  badge?: ReactNode;
  sign?: string;
  note?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("gg-offer", className)} aria-labelledby={titleId}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <div className="gg-offer__head">
        <Title className="gg-offer__title" id={titleId}>
          {title}
        </Title>
        {badge}
      </div>
      {children ? <div className="gg-offer__body">{children}</div> : null}
      {sign ? <p className="gg-offer__sign">{sign}</p> : null}
      {note ? <p className="gg-offer__note">{note}</p> : null}
      {actions ? <div className="gg-offer__actions">{actions}</div> : null}
    </section>
  );
}
