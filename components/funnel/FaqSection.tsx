import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SectionLabel } from "@/components/ui/EmptyState";
import { LANDING_FAQ, LINKS } from "@/lib/mock/seed";
import styles from "./LandingView.module.css";

export function FaqSection() {
  return (
    <section className={styles.section} aria-labelledby="landing-faq-label">
      <div className={styles.faqSplit}>
        <div>
          <div id="landing-faq-label">
            <SectionLabel>Short answers</SectionLabel>
          </div>
          <div className={styles.faqList}>
            {LANDING_FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem} name="landing-faq">
                <summary className={styles.faqSummary}>
                  {item.q}
                  <ChevronDown className={styles.faqChevron} size={20} aria-hidden="true" />
                </summary>
                <div className={styles.faqBody}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
        <div className={styles.wayfinding}>
          <p className="gg-eyebrow">Where to go next</p>
          <Link className={styles.wayLink} href="/events">
            Upcoming Ginhawa evenings
          </Link>
          <a
            className={styles.wayLink}
            href={LINKS.telegram}
            target="_blank"
            rel="noreferrer noopener"
          >
            Join Ate Marites’ Telegram group
          </a>
          <a
            className={styles.wayLink}
            href={LINKS.facebook}
            target="_blank"
            rel="noreferrer noopener"
          >
            Gutguard on Facebook
          </a>
          <a
            className={styles.wayLink}
            href={LINKS.site}
            target="_blank"
            rel="noreferrer noopener"
          >
            The full site, if you want the detail.
          </a>
        </div>
      </div>
    </section>
  );
}
