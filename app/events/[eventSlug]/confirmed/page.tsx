import { notFound } from "next/navigation";
import { EventConfirmed } from "@/components/events/EventConfirmed";
import { getEventBySlug } from "@/lib/events";

export default async function EventConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { eventSlug } = await params;
  const query = await searchParams;
  const event = getEventBySlug(eventSlug);
  if (!event) notFound();

  return (
    <EventConfirmed event={event} waitlist={query.intent === "waitlist"} />
  );
}
