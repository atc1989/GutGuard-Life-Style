import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  canReserveEvent,
  EVENT_STATUS_LABEL,
  listPublicEvents,
} from "@/lib/events";
import styles from "./EventLanding.module.css";

function dateParts(dateLabel: string) {
  const match = dateLabel.match(/([A-Za-z]+),?\s+(\d+)/);
  return {
    month: match?.[1]?.slice(0, 3) ?? "—",
    day: match?.[2] ?? "—",
  };
}

export function EventList() {
  const events = listPublicEvents();

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="events-title">
        <p className="gg-eyebrow">Ginhawa</p>
        <h1 id="events-title" className={`gg-display ${styles.title}`}>
          Upcoming evenings
        </h1>
        <p className={`gg-lede ${styles.lede}`}>
          Free gatherings. Pick a date, see the hall, and reserve a seat if it is still open.
        </p>
      </section>
      <ul className={styles.list}>
        {events.map((event) => {
          const { month, day } = dateParts(event.dateLabel);
          return (
            <li key={event.slug}>
              <Link href={`/events/${event.slug}`} className={styles.row}>
                <div className={styles.datebox} aria-hidden="true">
                  <p className={styles.month}>{month}</p>
                  <p className={styles.day}>{day}</p>
                </div>
                <div>
                  <p className={styles.rowTitle}>{event.title}</p>
                  <p className={styles.rowMeta}>
                    {event.timeLabel} · {event.venue}
                  </p>
                  <Badge active={canReserveEvent(event.status)}>
                    {EVENT_STATUS_LABEL[event.status]}
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
