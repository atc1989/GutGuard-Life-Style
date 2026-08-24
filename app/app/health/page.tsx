import { HealthPage } from "@/components/member/HealthPage";
import { loadHealthSnapshot } from "@/lib/member-data";

export default async function Page() {
  const snapshot = await loadHealthSnapshot();
  return <HealthPage snapshot={snapshot} />;
}
