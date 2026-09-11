import { TRUST_STATS } from "@/lib/mock/seed";
import styles from "./LandingView.module.css";

/** Four trust metrics. 4-up from 900px, 2-up below it. */
export function TrustGrid() {
  return (
    <section className={styles.trust} aria-labelledby="trust-title">
      <div className={styles.shell}>
        <h2 className="gg-vh" id="trust-title">
          Gutguard in numbers
        </h2>
        <ul className={styles.trustGrid}>
          {TRUST_STATS.map(([value, label]) => (
            <li key={label} className={styles.statCard}>
              <strong className={styles.statValue}>{value}</strong>
              <span className="gg-help">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
