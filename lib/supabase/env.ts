function isUsable(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return (
    !lower.includes("your-publishable") &&
    !lower.includes("your-anon") &&
    !lower.includes("your-project") &&
    !lower.includes("your-server-only")
  );
}

export function isSupabaseConfigured(): boolean {
  return (
    isUsable(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    isUsable(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
