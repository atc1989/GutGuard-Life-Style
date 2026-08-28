import { Suspense } from "react";
import { DoorCard } from "@/components/funnel/DoorCard";
import { createClient } from "@/lib/supabase/server";

export default async function CardPage() {
  let memberName: string | undefined;
  let cardNo: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // `name` is set by Lifestyle register; `full_name` by the shared One
    // Account provisioner, so a guild member sees their name on first visit.
    const metadataName =
      user?.user_metadata?.name ?? user?.user_metadata?.full_name;
    if (typeof metadataName === "string") {
      memberName = metadataName;
    }
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, card_no")
        .eq("id", user.id)
        .maybeSingle();
      if (typeof profile?.name === "string" && profile.name.trim()) {
        memberName = profile.name;
      }
      if (typeof profile?.card_no === "string") {
        cardNo = profile.card_no;
      }
    }
  } catch {
    // Missing env or Auth not reachable — DoorCard falls back to in-memory UI state.
  }

  return (
    <Suspense fallback={<main className="gg-funnel">Loading card…</main>}>
      <DoorCard memberName={memberName} cardNo={cardNo} />
    </Suspense>
  );
}
