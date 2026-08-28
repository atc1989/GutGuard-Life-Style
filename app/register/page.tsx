import { RegisterForm } from "@/components/funnel/RegisterForm";

// A first-time OneGrinders username waits on the guild API, which currently
// stalls ~30s before succeeding (see lib/one-account/onegrinders.ts). Server
// actions posted from this page inherit this limit, so it must exceed the 45s
// abort there. Returning members take the local-first path and never wait.
export const maxDuration = 60;

export default function RegisterPage() {
  return <RegisterForm />;
}
