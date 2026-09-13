import { TRUST_STATS } from "@/lib/mock/seed";
import styles from "./LandingView.module.css";

export function TrustGrid() {
  return (
    <section className={`${styles.section} ${styles.trust}`} aria-label="Trust signals">
      <ul className={styles.trustList}>
        {TRUST_STATS.map(([value, label]) => (
          <li key={label} className={styles.stat}>
            <strong>{value}</strong>
            <span className="gg-help">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
