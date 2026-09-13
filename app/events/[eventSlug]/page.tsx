import { notFound } from "next/navigation";
import { EventLanding } from "@/components/events/EventLanding";
import { GINHAWA_EVENTS, getEventBySlug, parseReservationNotice } from "@/lib/events";

export function generateStaticParams() {
  return GINHAWA_EVENTS.map((event) => ({ eventSlug: event.slug }));
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ from?: string; reservation?: string }>;
}) {
  const { eventSlug } = await params;
  const query = await searchParams;
  const event = getEventBySlug(eventSlug);
  if (!event) notFound();

  const reservation = parseReservationNotice(query.reservation);

  return (
    <EventLanding event={event} inviter={query.from} reservation={reservation} />
  );
}
