import { createBrowserClient } from "@supabase/ssr";

import { sharedSessionCookieOptions } from "@/lib/one-account/client";
import { cookieOptionsForRequestHost } from "@/lib/supabase/cookie-options";

/** Browser anon client. Used when public Supabase env is set. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Change 6: the browser writes these cookies too, so it must agree with
      // the server about their Domain — otherwise two cookies share one name.
      cookieOptions: cookieOptionsForRequestHost(
        sharedSessionCookieOptions(),
        typeof window === "undefined" ? undefined : window.location.hostname,
      ),
    },
  );
}
