import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { sharedSessionCookieOptions } from "@/lib/one-account";

/** Cookie / SSR anon client. Used by middleware and member actions when env is set. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Change 6: one session across the three origins. Undefined until
      // NEXT_PUBLIC_ONE_ACCOUNT_COOKIE_DOMAIN is set, so this is a no-op today.
      cookieOptions: sharedSessionCookieOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware can refresh the session.
          }
        },
      },
    },
  );
}
