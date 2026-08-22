import { createBrowserClient } from "@supabase/ssr";

/** Browser anon client. Used when public Supabase env is set. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
