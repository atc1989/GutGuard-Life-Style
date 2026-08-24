import { Suspense } from "react";
import { DoorCard } from "@/components/funnel/DoorCard";
import { CARD_NUMBER } from "@/lib/mock/seed";
import { loadDoorCard } from "@/lib/member-data";

export default async function CardPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string; claim?: string }>;
}) {
  const params = await searchParams;
  const door = await loadDoorCard();
  const claimed = Boolean(door?.claimed) || params.claimed === "1";
  const claimFailed = params.claim === "failed";

  return (
    <Suspense fallback={<main className="gg-funnel">Loading card…</main>}>
      <DoorCard
        memberName={door?.name}
        memberMobile={door?.mobile}
        cardNo={door?.cardNo || CARD_NUMBER}
        claimed={claimed}
        claimFailed={claimFailed}
      />
    </Suspense>
  );
}
