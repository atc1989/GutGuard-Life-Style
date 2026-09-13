import Link from "next/link";
import { LifestyleCardPrototype } from "@/components/lifestyle/LifestyleCardPrototype";
import styles from "./LandingView.module.css";

export function Hero({ variant }: { variant: "gift" | "plain" }) {
  return (
    <section className={`${styles.section} ${styles.hero}`} aria-labelledby="landing-hero-title">
      <div className={styles.heroCopy}>
        <p className="gg-eyebrow">Ginhawa</p>
        {variant === "gift" ? (
          <>
            <h1 id="landing-hero-title" className="gg-display">
              A <em>welcome gift</em> for our guests.
            </h1>
            <p className={`gg-lede ${styles.lede}`}>
              Your name, number, and a password. Free, no payment to start.
            </p>
          </>
        ) : (
          <>
            <p className="gg-eyebrow">A mental wellness forum</p>
            <h1 id="landing-hero-title" className="gg-display">
              Ginhawa ng <em>Isip at Damdamin</em>
            </h1>
            <p className={`gg-lede ${styles.lede}`}>
              Millions of Filipinos live with anxiety or depression. Most never get
              help. This is a place to start — free, open to anyone.
            </p>
          </>
        )}
        <div className={styles.cta}>
          <Link href="/register" className={styles.ctaLink}>
            Ready now? Start my Lifestyle Protocol →
          </Link>
        </div>
      </div>
      <div className={styles.stageBleed}>
        <div className={styles.stageInner}>
          <LifestyleCardPrototype />
        </div>
      </div>
    </section>
  );
}
