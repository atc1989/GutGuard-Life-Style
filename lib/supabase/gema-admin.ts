import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client pinned to the GEMA schema.
 * OneGrinders provisioner writes gema.profiles + gema.members only.
 * Never import into a client component. Never expose the key as NEXT_PUBLIC_.
 */
export function createGemaAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) for OneGrinders login.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "gema" },
  });
}

export function hasGemaAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}
