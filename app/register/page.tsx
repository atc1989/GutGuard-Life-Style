import { RegisterForm } from "@/components/funnel/RegisterForm";
import { trustedReturnTo } from "@/lib/lifestyle/return-to";

// A first-time OneGrinders username waits on the guild API, which currently
// stalls ~30s before succeeding (see lib/one-account/onegrinders.ts). Server
// actions posted from this page inherit this limit, so it must exceed the 45s
// abort there. Returning members take the local-first path and never wait.
export const maxDuration = 60;

// `?returnTo=` is read per request, so this page cannot be prerendered.
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  // Checked here as well as in the action: a value that will never be honoured
  // should not travel any further than the page that received it.
  const raw = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  return <RegisterForm returnTo={trustedReturnTo(raw) ?? undefined} />;
}
