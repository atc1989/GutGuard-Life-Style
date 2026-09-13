import { FaqSection } from "@/components/funnel/FaqSection";
import { Hero } from "@/components/funnel/Hero";
import { StepGrid } from "@/components/funnel/StepGrid";
import { TrustGrid } from "@/components/funnel/TrustGrid";
import { WelcomeOverlay } from "@/components/lifestyle/WelcomeOverlay";
import styles from "./LandingView.module.css";

export function LandingView({ variant }: { variant: "gift" | "plain" }) {
  return (
    <main className={styles.landing}>
      <WelcomeOverlay variant={variant} />
      <Hero variant={variant} />
      <TrustGrid />
      <StepGrid />
      <FaqSection />
    </main>
  );
}
