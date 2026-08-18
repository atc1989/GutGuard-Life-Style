import { createBrowserClient } from "@supabase/ssr";

/** Browser anon client. Unused until real auth is wired. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
