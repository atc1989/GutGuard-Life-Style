import { ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LANDING_FAQ, LINKS } from "@/lib/mock/seed";

/**
 * Native disclosure FAQ (DS Accordion: SVG chevron, rotates when open). The
 * `<details>` element carries the open state, so this needs no client JS.
 */
export function FaqSection() {
  return (
    <section className="gg-faq" aria-labelledby="faq-title">
      <div className="gg-faq__list">
        <Eyebrow as="h2" id="faq-title">
          Short answers
        </Eyebrow>
        {LANDING_FAQ.map((item, index) => (
          <details key={item.q} className="gg-faq__item" open={index === 0}>
            <summary className="gg-faq__summary">
              <span>{item.q}</span>
              <ChevronDown className="gg-faq__chev" aria-hidden />
            </summary>
            <p className="gg-faq__body">{item.a}</p>
          </details>
        ))}
      </div>
      <aside className="gg-panel gg-faq__aside" aria-labelledby="faq-next-title">
        <Eyebrow as="h3" id="faq-next-title">
          Where to go next
        </Eyebrow>
        <a className="gg-link gg-link--row" href={LINKS.telegram} target="_blank" rel="noopener noreferrer">
          Join Ate Marites’ Telegram group
        </a>
        <a className="gg-link gg-link--row" href={LINKS.facebook} target="_blank" rel="noopener noreferrer">
          Gutguard on Facebook
        </a>
        <a className="gg-link gg-link--row" href={LINKS.site} target="_blank" rel="noopener noreferrer">
          The full site, if you want the detail.
        </a>
      </aside>
    </section>
  );
}
