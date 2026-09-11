import Link from "next/link";
import { LifestyleCardPrototype } from "@/components/lifestyle/LifestyleCardPrototype";
import styles from "./LandingView.module.css";

/**
 * Card-first hero: centered copy and CTA, then a full-bleed ink/blue stage
 * carrying the placeholder card. The CTA is one anchor styled as the button —
 * never a <button> nested inside a link.
 */
export function Hero({ variant }: { variant: "gift" | "plain" }) {
  const gift = variant === "gift";

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.shell}>
        <div className={styles.heroCopy}>
          <p className="gg-eyebrow">Ginhawa</p>
          {gift ? (
            <>
              <h1 className="gg-display" id="hero-title">
                A <em>welcome gift</em> for our guests.
              </h1>
              <p className={`gg-lede ${styles.lede}`}>
                Your name, number, and a password. Free, no payment to start.
              </p>
            </>
          ) : (
            <>
              <p className="gg-eyebrow">A mental wellness forum</p>
              <h1 className="gg-display" id="hero-title">
                Ginhawa ng <em>Isip at Damdamin</em>
              </h1>
              <p className={`gg-lede ${styles.lede}`}>
                Millions of Filipinos live with anxiety or depression. Most never get
                help. This is a place to start — free, open to anyone.
              </p>
            </>
          )}
          <div className={styles.heroCta}>
            <Link className="gg-button gg-button--pill" href="/register">
              Ready now? Start my Lifestyle Protocol →
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={`${styles.shell} ${styles.stageInner}`}>
          <LifestyleCardPrototype />
          <div className={styles.stageCaption}>
            {gift ? (
              <>
                <p className={`gg-eyebrow ${styles.stageEyebrow}`}>Limited guest gift</p>
                <h2 className={`gg-heading ${styles.stageHeading}`}>
                  A card and an invitation
                </h2>
                <p className={`gg-lede ${styles.stageLede}`}>
                  Come to an event, see it for yourself, decide after. Nothing to pay
                  to come.
                </p>
              </>
            ) : (
              <>
                <p className={`gg-eyebrow ${styles.stageEyebrow}`}>
                  Hosted by Gutguard Lifestyle
                </p>
                <h2 className={`gg-heading ${styles.stageHeading}`}>Everyone welcome</h2>
                <p className={`gg-lede ${styles.stageLede}`}>
                  A community wellness initiative. Free to attend. Not a government or
                  DOH service.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
