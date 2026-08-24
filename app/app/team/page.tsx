import { TeamPage } from "@/components/member/TeamPage";
import { loadBaseComplete } from "@/lib/member-data";

export default async function Page() {
  const serverBaseComplete = await loadBaseComplete();
  return <TeamPage serverBaseComplete={serverBaseComplete} />;
}
