import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isMemberShell(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function isAdminShell(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function redirectWithSessionCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
  search = "",
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

/** Cookie client used by root `proxy.ts` to refresh the Auth token. */
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

  const pathname = request.nextUrl.pathname;

  if (!user && isMemberShell(pathname)) {
    return redirectWithSessionCookies(request, supabaseResponse, "/");
  }

  if (isAdminShell(pathname)) {
    if (!user) {
      return redirectWithSessionCookies(
        request,
        supabaseResponse,
        "/denied",
        "?reason=signed-out",
      );
    }

    const { data: isAdmin, error } = await supabase.rpc("lifestyle_is_admin");
    if (error || !isAdmin) {
      return redirectWithSessionCookies(
        request,
        supabaseResponse,
        "/denied",
        "?reason=forbidden",
      );
    }
  }

  return supabaseResponse;
}
