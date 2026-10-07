import { LifestyleMemberClient } from "@/components/prototype/ClientPages";
import { listFeedStories } from "@/lib/actions/admin";
import { loadPrototypeMember } from "@/lib/lifestyle/load-prototype-member";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** The member page: the approved prototype, filled with the signed-in member's own data. */
export default async function MemberPage() {
  const [live, feed] = await Promise.all([loadPrototypeMember(), listFeedStories()]);
  // With Supabase on, a failed read must never fall back to the prototype's demo member.
  if (isSupabaseConfigured() && !live) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#F4F1EA", fontFamily: "var(--font-inter-tight), sans-serif" }}>
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 400, fontSize: 26, margin: 0 }}>We could not load your page.</h1>
          <p style={{ color: "#5b5b6a", lineHeight: 1.5 }}>Please refresh. If it keeps happening, log out and log in again.</p>
          <a href="/app" style={{ display: "inline-block", marginTop: 8, padding: "12px 22px", borderRadius: 99, background: "#0608A9", color: "#fff", textDecoration: "none", fontWeight: 600 }}>Refresh</a>
        </div>
      </main>
    );
  }
  return <LifestyleMemberClient live={live} feed={feed.ok ? feed.community : []} />;
}
