import { ensureCardForCurrentUser } from "@/lib/lifestyle/ensure-card";
import type { ReactNode } from "react";

// The member app reads the session on every render. Saying so is clearer than
// leaning on a cookie read to bail the route out of static generation.
export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }: { children: ReactNode }) {
  // Change 4: a member whose session was opened on GEMA or Academy can land
  // straight in the app. First visit mints the card here too, never at signup.
  // Addendum 05: the approved member page brings its own header and navigation,
  // so the MemberShell chrome is not wrapped around it.
  await ensureCardForCurrentUser();
  return <>{children}</>;
}
