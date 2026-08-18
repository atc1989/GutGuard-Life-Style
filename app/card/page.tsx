import { Suspense } from "react";
import { DoorCard } from "@/components/funnel/DoorCard";

export default function CardPage() {
  return (
    <Suspense fallback={<main className="gg-funnel">Loading card…</main>}>
      <DoorCard />
    </Suspense>
  );
}
