import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { EventReservationNotice } from "@/components/events/EventReservationStatus";
import {
  canJoinWaitlist,
  canReserveEvent,
  displayInviterName,
  EVENT_STATUS_LABEL,
  eventMapHref,
  eventReserveHref,
  getEventBySlug,
  type GinhawaEvent,
} from "@/lib/events";
import styles from "./EventLanding.module.css";

const RESEARCH = {
  summary: "Research and advocacy notes",
  disclosure:
    "This is a private community initiative, not a government or DOH service. Gutguard is sold as a food supplement. These notes are for context, not a medical claim or endorsement.",
  body: "Some public programs and studies have looked at the gut–brain conversation. We share that background so guests can ask better questions. It does not mean Gutguard treats anxiety, depression, or any disease.",
};

export function EventLanding({
  event,
  inviter,
  reservation,
}: {
  event: GinhawaEvent;
  inviter?: string | null;
  reservation?: "confirmed" | "exists" | "error" | "waitlist" | null;
}) {
  const inviterName = displayInviterName(inviter);
  const next = event.nextSlug ? getEventBySlug(event.nextSlug) : undefined;
  const reserveHref = canReserveEvent(event.status)
    ? eventReserveHref(event.slug)
    : canJoinWaitlist(event.status)
      ? eventReserveHref(event.slug, "waitlist")
      : null;
  const ctaLabel = canJoinWaitlist(event.status) ? "Join the waitlist" : "Reserve my seat";

  return (
    <main className={styles.page}>
      <Link href="/events" className={styles.back}>
        All Ginhawa evenings
      </Link>

      {reservation === "confirmed" ? (
        <Alert>Your name is on this evening. Show your card at the door.</Alert>
      ) : null}
      {reservation === "waitlist" ? (
        <Alert>You are on the waitlist. We will not hold a seat until one opens.</Alert>
      ) : null}
      {reservation === "exists" ? (
        <Alert>You already have a seat on this evening. No need to reserve again.</Alert>
      ) : null}
      {reservation === "error" ? (
        <Alert tone="error">We could not save that reservation. Try again, or pick another evening.</Alert>
      ) : null}
      <EventReservationNotice slug={event.slug} />

      {event.notice ? <Alert tone="error" className={styles.notice}>{event.notice}</Alert> : null}

      <section className={styles.hero} aria-labelledby="event-title">
        <p className="gg-eyebrow">Ginhawa</p>
        <Badge active={canReserveEvent(event.status)}>{EVENT_STATUS_LABEL[event.status]}</Badge>
        <h1 id="event-title" className={`gg-display ${styles.title}`}>
          {event.title}
        </h1>
        <p className={`gg-lede ${styles.lede}`}>{event.purpose}</p>
        <p className={`gg-lede ${styles.lede}`}>{event.lede}</p>
      </section>

      <dl className={styles.facts}>
        <div>
          <dt>Date</dt>
          <dd>{event.dateLabel}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{event.timeLabel}</dd>
        </div>
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
        <div>
          <dt>Availability</dt>
          <dd>{event.availability}</dd>
        </div>
      </dl>

      {reserveHref ? (
        <div className={styles.ctaRow}>
          <Link href={reserveHref} className={styles.cta}>
            {ctaLabel}
          </Link>
        </div>
      ) : next ? (
        <div className={styles.ctaRow}>
          <Link href={`/events/${next.slug}`} className={styles.cta}>
            See the next evening
          </Link>
        </div>
      ) : null}

      {event.giftActive ? (
        <section className={styles.panel} aria-labelledby="event-gift">
          <p className="gg-eyebrow">Guest gift</p>
          <h2 id="event-gift" className={styles.panelTitle}>
            A card and an invitation
          </h2>
          <p className="gg-help">
            If you want a Lifestyle card after the evening, we will help you start. Nothing to pay to come.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="event-outcomes">
        <p className="gg-eyebrow">What we will cover</p>
        <h2 id="event-outcomes" className={styles.panelTitle}>
          Three things to leave with
        </h2>
        <ol className={styles.outcomes}>
          {event.outcomes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <p className="gg-help">
        {inviterName
          ? `${inviterName} invited you to this evening.`
          : "You found this evening on your own — you are still welcome."}
      </p>

      <section aria-labelledby="event-about">
        <p className="gg-eyebrow">What is Gutguard?</p>
        <h2 id="event-about" className={styles.panelTitle}>
          A Filipino synbiotic
        </h2>
        <p className="gg-help">
          Gutguard is a Filipino synbiotic — good bacteria plus the fibre that feeds them — made to support
          the gut side of the gut–brain conversation. Selling is a later, optional choice. Most guests just
          come to listen.
        </p>
      </section>

      <details className={styles.faq}>
        <summary>
          {RESEARCH.summary}
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className={styles.faqBody}>
          <p>{RESEARCH.disclosure}</p>
          <p>{RESEARCH.body}</p>
        </div>
      </details>

      {reserveHref ? (
        <div className={styles.ctaRow}>
          <Link href={reserveHref} className={styles.cta}>
            {ctaLabel}
          </Link>
        </div>
      ) : null}

      <p className={styles.disclaimer}>
        Gutguard Lifestyle is a private initiative. It is not a government, hospital, or DOH service.
        Gutguard is a food supplement. This page does not diagnose, treat, or promise a health result.
      </p>
    </main>
  );
}
