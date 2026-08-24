export const MEMBER_ROLES = ["member", "admin"] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export function isMemberRole(value: unknown): value is MemberRole {
  return value === "member" || value === "admin";
}

export function parseMemberRole(value: unknown): MemberRole {
  return isMemberRole(value) ? value : "member";
}
