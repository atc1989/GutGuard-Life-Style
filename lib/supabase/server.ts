import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { sharedSessionCookieOptions } from "@/lib/one-account";
import { cookieOptionsForRequestHost } from "@/lib/supabase/cookie-options";

/** Cookie / SSR anon client. Used by middleware and member actions when env is set. */
export async function createClient() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const requestHostname =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Share on gutguard.ph, but keep a host-only session on Vercel aliases.
      cookieOptions: cookieOptionsForRequestHost(
        sharedSessionCookieOptions(),
        requestHostname,
      ),
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
