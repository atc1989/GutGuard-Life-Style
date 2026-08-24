export const WELCOME_SEEN_COOKIE = "gg-welcome-seen";
export const DEV_MEMBER_COOKIE = "gg-dev-member";

export type DevMember = {
  name: string;
  mobile: string;
  claimed?: boolean;
  cardNo?: string;
};

export function encodeDevMember(member: DevMember): string {
  return encodeURIComponent(JSON.stringify(member));
}

export function decodeDevMember(raw: string | undefined): DevMember | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "name" in parsed &&
      "mobile" in parsed &&
      typeof (parsed as DevMember).name === "string" &&
      typeof (parsed as DevMember).mobile === "string"
    ) {
      const member = parsed as DevMember;
      return {
        name: member.name,
        mobile: member.mobile,
        claimed: Boolean(member.claimed),
        cardNo: typeof member.cardNo === "string" ? member.cardNo : undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
}
