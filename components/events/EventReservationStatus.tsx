"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { persistReservation } from "@/lib/actions/member";
import { decideReservation } from "@/lib/reservations";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function EventReservationNotice({ slug }: { slug: string }) {
  const { session } = useSession();
  const kind = session.reservations[slug];
  if (kind === "waitlist") {
    return <Alert>You are on the waitlist. We will not hold a seat until one opens.</Alert>;
  }
  if (kind === "reserved") {
    return <Alert>You already have a seat on this evening. No need to reserve again.</Alert>;
  }
  return null;
}

export function EventReservationRecorder({ slug }: { slug: string }) {
  const { session, update } = useSession();

  useEffect(() => {
    const decision = decideReservation(slug, session.reservations);
    if (!decision.ok) return;
    if (session.reservations[slug]) return;
    update({
      reservations: { ...session.reservations, [slug]: decision.kind },
    });
    if (isSupabaseConfigured()) {
      void persistReservation(slug);
    }
  }, [session.reservations, slug, update]);

  return null;
}
