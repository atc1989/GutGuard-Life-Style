import { NearlyFree } from "@/components/funnel/NearlyFree";
import { loadHealthSnapshot, loadInvites } from "@/lib/member-data";

export default async function NearlyPage() {
  const snapshot = await loadHealthSnapshot();
  const invites = snapshot ? await loadInvites() : undefined;
  return (
    <NearlyFree
      points={snapshot?.points}
      pending={snapshot?.pending}
      banked={snapshot?.banked}
      ledger={snapshot?.ledger}
      invites={invites}
    />
  );
}
