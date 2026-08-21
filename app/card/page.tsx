import { Suspense } from "react";
import { DoorCard } from "@/components/funnel/DoorCard";
import { createClient } from "@/lib/supabase/server";

export default async function CardPage() {
  let memberName: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (typeof user?.user_metadata?.name === "string") {
      memberName = user.user_metadata.name;
    }
  } catch {
    // Missing env or Auth not reachable — DoorCard falls back to in-memory UI state.
  }

  return (
    <Suspense fallback={<main className="gg-funnel">Loading card…</main>}>
      <DoorCard memberName={memberName} />
    </Suspense>
  );
}
