import { FUNNEL_STEPS } from "@/lib/mock/seed";
import styles from "./LandingView.module.css";

/** The three funnel steps. 3-up from 900px, stacked in source order below it. */
export function StepGrid() {
  return (
    <section className={styles.steps} aria-labelledby="steps-title">
      <div className={styles.shell}>
        <h2 className="gg-eyebrow" id="steps-title">
          <em style={{ fontFamily: "var(--gg-serif)", marginRight: 8 }}>01</em>
          Three steps. No payment, ever, to start.
        </h2>
        <ul className={styles.stepGrid}>
          {FUNNEL_STEPS.map((step) => (
            <li key={step.n} className={styles.stepCard}>
              <p className="gg-eyebrow">{step.n}</p>
              <h3 className={`gg-heading ${styles.stepTitle}`}>{step.title}</h3>
              <p className="gg-help">{step.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
