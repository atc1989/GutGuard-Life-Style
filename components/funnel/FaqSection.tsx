import { LANDING_FAQ, LINKS } from "@/lib/mock/seed";
import styles from "./LandingView.module.css";

/**
 * Native disclosure FAQ. `<details>` carries the open state semantically, so
 * this section needs no client JavaScript and works before hydration.
 */
function Chevron() {
  return (
    <svg
      className={styles.faqChevron}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function FaqSection() {
  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.shell}>
        <h2 className="gg-eyebrow" id="faq-title">
          Short answers
        </h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqList}>
            {LANDING_FAQ.map((item, index) => (
              <details
                key={item.q}
                className={styles.faqItem}
                open={index === 0}
              >
                <summary className={styles.faqSummary}>
                  <span>{item.q}</span>
                  <Chevron />
                </summary>
                <p className={styles.faqBody}>{item.a}</p>
              </details>
            ))}
          </div>
          <aside className={styles.wayfinding}>
            <h3 className="gg-eyebrow">Where to go next</h3>
            <a
              className={`gg-link ${styles.wayLink}`}
              href={LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Ate Marites’ Telegram group
            </a>
            <a
              className={`gg-link ${styles.wayLink}`}
              href={LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Gutguard on Facebook
            </a>
            <a
              className={`gg-link ${styles.wayLink}`}
              href={LINKS.site}
              target="_blank"
              rel="noopener noreferrer"
            >
              The full site, if you want the detail.
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
