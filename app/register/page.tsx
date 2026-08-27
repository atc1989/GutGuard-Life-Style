import { RegisterForm } from "@/components/funnel/RegisterForm";

// OneGrinders username verify can wait ~35s; this page posts the sign-in action.
export const maxDuration = 60;

export default function RegisterPage() {
  return <RegisterForm />;
}
