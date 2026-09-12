import { MemberShell } from "@/components/shell/MemberShell";
import { ensureCardForCurrentUser } from "@/lib/lifestyle/ensure-card";
import { loadMemberChrome } from "@/lib/lifestyle/load-member-chrome";
import type { ReactNode } from "react";

// The member app reads the session on every render. Saying so is clearer than
// leaning on a cookie read to bail the route out of static generation.
export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }: { children: ReactNode }) {
  // Change 4: a member whose session was opened on GEMA or Academy can land
  // straight in the app. First visit mints the card here too, never at signup.
  // Change 9: chrome is the row after that mint, not the guest client session.
  await ensureCardForCurrentUser();
  const chrome = await loadMemberChrome();
  return <MemberShell chrome={chrome}>{children}</MemberShell>;
}
