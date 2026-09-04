import { MemberShell } from "@/components/shell/MemberShell";
import { ensureCardForCurrentUser } from "@/lib/lifestyle/ensure-card";
import type { ReactNode } from "react";

export default async function MemberLayout({ children }: { children: ReactNode }) {
  // Change 4: a member whose session was opened on GEMA or Academy can land
  // straight in the app. First visit mints the card here too, never at signup.
  await ensureCardForCurrentUser();
  return <MemberShell>{children}</MemberShell>;
}
