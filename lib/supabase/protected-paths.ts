export function requiresLifestyleAuth(pathname: string): boolean {
  return (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/card" ||
    pathname.startsWith("/card/") ||
    pathname === "/nearly" ||
    pathname.startsWith("/nearly/")
  );
}

export function unauthenticatedLifestylePath(pathname: string): string {
  if (pathname === "/app" || pathname.startsWith("/app/")) return "/";
  return "/register";
}
