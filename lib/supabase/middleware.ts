import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  requiresLifestyleAuth,
  unauthenticatedLifestylePath,
} from "@/lib/supabase/protected-paths";

/** Cookie client used by root middleware to refresh the Auth token. */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and supabase.auth.getUser().
  // getUser() validates the JWT and refreshes expired tokens, writing cookies via setAll.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && requiresLifestyleAuth(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = unauthenticatedLifestylePath(request.nextUrl.pathname);
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
