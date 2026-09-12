import { FaqSection } from "./FaqSection";
import { Hero } from "./Hero";
import { StepGrid } from "./StepGrid";
import { TrustGrid } from "./TrustGrid";
import styles from "./LandingView.module.css";

/**
 * Landing composition. Server-rendered end to end — the FAQ is native
 * `<details>` markup, so nothing on this page needs hydration.
 */
export function LandingView({ variant }: { variant: "gift" | "plain" }) {
  return (
    <main className={styles.page}>
      <Hero variant={variant} />
      <TrustGrid />
      <StepGrid />
      <FaqSection />
    </main>
  );
}
