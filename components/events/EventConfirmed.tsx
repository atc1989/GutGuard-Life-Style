import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { EventReservationRecorder } from "@/components/events/EventReservationStatus";
import { eventMapHref, type GinhawaEvent } from "@/lib/events";
import styles from "./EventLanding.module.css";

export function EventConfirmed({
  event,
  waitlist,
}: {
  event: GinhawaEvent;
  waitlist?: boolean;
}) {
  return (
    <main className={styles.page}>
      <EventReservationRecorder slug={event.slug} />
      <Link href={`/events/${event.slug}`} className={styles.back}>
        Back to this evening
      </Link>
      <Alert>
        {waitlist
          ? "You are on the waitlist. We will not hold a seat until one opens."
          : "Your name is on this evening. Show your card at the door."}
      </Alert>
      <section className={styles.hero} aria-labelledby="confirm-title">
        <p className="gg-eyebrow">Reservation</p>
        <h1 id="confirm-title" className={`gg-display ${styles.title}`}>
          {event.title}
        </h1>
        <p className={`gg-lede ${styles.lede}`}>
          {event.dateLabel} · {event.timeLabel}
        </p>
      </section>
      <dl className={styles.facts}>
        <div>
          <dt>Venue</dt>
          <dd>
            {event.venue}, {event.city}
            <br />
            <a
              className={styles.map}
              href={eventMapHref(event.mapQuery)}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open map for {event.venue}
            </a>
          </dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{event.cost}</dd>
        </div>
      </dl>
      <div className={styles.ctaRow}>
        <Link href="/card" className={styles.cta}>
          Open my door card
        </Link>
        <Link href="/events" className={styles.back}>
          All evenings
        </Link>
      </div>
      <p className={styles.disclaimer}>
        This confirmation is for a Lifestyle gathering. It is not a government or DOH appointment.
      </p>
    </main>
  );
}
