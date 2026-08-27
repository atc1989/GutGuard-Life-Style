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
    if (typeof user?.user_metadata?.name === "string") {
      memberName = user.user_metadata.name;
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
