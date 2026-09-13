"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { getWelcomeSeen, persistProfile } from "@/lib/actions/member";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  readWelcomeSeenPreference,
  shouldShowWelcomeOverlay,
  writeWelcomeSeenPreference,
} from "@/lib/welcome";

const COPY = {
  gift: {
    title: "A welcome gift",
    body: "A card and an invitation. Come to an event, see it for yourself, decide after. Nothing to pay to come.",
  },
  plain: {
    title: "Ginhawa",
    body: "A place to start — free, open to anyone. Most people never get help. This is a first step, not a government or DOH service.",
  },
} as const;

export function WelcomeOverlay({ variant }: { variant: "gift" | "plain" }) {
  const { session, update } = useSession();
  const [open, setOpen] = useState(false);
  const copy = COPY[variant];

  useEffect(() => {
    let cancelled = false;

    async function decide() {
      const storedPreference = readWelcomeSeenPreference(window.localStorage);
      const profile = isSupabaseConfigured() ? await getWelcomeSeen() : { seen: false };
      if (cancelled) return;
      setOpen(
        shouldShowWelcomeOverlay({
          mockWelcomeSeen: session.welcomeSeen || profile.seen,
          storedPreference,
        }),
      );
    }

    void decide();
    return () => {
      cancelled = true;
    };
  }, [session.welcomeSeen]);

  function dismiss() {
    writeWelcomeSeenPreference(window.localStorage);
    update({ welcomeSeen: true });
    if (isSupabaseConfigured()) {
      void persistProfile({ welcomeSeen: true });
    }
    setOpen(false);
  }

  return (
    <Dialog
      title={copy.title}
      open={open}
      onClose={dismiss}
      variant="center"
      footer={
        <Button variant="pill" onClick={dismiss}>
          Continue
        </Button>
      }
    >
      <p>{copy.body}</p>
    </Dialog>
  );
}
