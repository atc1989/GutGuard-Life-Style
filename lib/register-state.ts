import type { AuthRegisterField } from "@/lib/schemas/auth";

export type RegisterActionState = {
  error: string | null;
  fieldErrors: Partial<Record<AuthRegisterField, string>>;
};

export const initialRegisterState: RegisterActionState = {
  error: null,
  fieldErrors: {},
};
