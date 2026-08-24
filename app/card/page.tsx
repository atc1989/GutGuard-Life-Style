import { Suspense } from "react";
import { cookies } from "next/headers";
import { DoorCard } from "@/components/funnel/DoorCard";
import { DEV_MEMBER_COOKIE, decodeDevMember } from "@/lib/cookies";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function CardPage() {
  let memberName: string | undefined;
  let memberMobile: string | undefined;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (typeof user?.user_metadata?.name === "string") {
        memberName = user.user_metadata.name;
      }
      if (typeof user?.user_metadata?.mobile === "string") {
        memberMobile = user.user_metadata.mobile;
      }
    } catch {
      // Auth not reachable — DoorCard falls back to the mock UI session.
    }
  }

  if (!memberName) {
    const store = await cookies();
    const dev = decodeDevMember(store.get(DEV_MEMBER_COOKIE)?.value);
    if (dev) {
      memberName = dev.name;
      memberMobile = dev.mobile;
    }
  }

  return (
    <Suspense fallback={<main className="gg-funnel">Loading card…</main>}>
      <DoorCard memberName={memberName} memberMobile={memberMobile} />
    </Suspense>
  );
}
