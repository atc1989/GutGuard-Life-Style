type IdentityFields = {
  name?: string | null;
  mobile?: string | null;
  sponsor?: string | null;
};

export function formatIdentityDetails(identity: IdentityFields) {
  return [
    identity.name?.trim(),
    identity.mobile?.trim(),
    identity.sponsor?.trim()
      ? `sponsor ${identity.sponsor.trim()}`
      : null,
  ].filter((value): value is string => Boolean(value));
}
