import { SectionLabel } from "@/components/ui/EmptyState";
import { FUNNEL_STEPS } from "@/lib/mock/seed";
import styles from "./LandingView.module.css";

export function StepGrid() {
  return (
    <section className={`${styles.section} ${styles.protocol}`} aria-labelledby="landing-steps-label">
      <div id="landing-steps-label">
        <SectionLabel number="01">Three steps. No payment, ever, to start.</SectionLabel>
      </div>
      <div className={styles.stepGrid}>
        {FUNNEL_STEPS.map((step) => (
          <article key={step.n} className={styles.step}>
            <p className="gg-eyebrow">{step.n}</p>
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className={styles.stepCopy}>{step.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
