import { CONTACTS, type FollowUpNote, type MockSession } from "./mock/seed.ts";

export type RosterFilter =
  | "attention"
  | "active"
  | "low_supply"
  | "stopped"
  | "invited";

export type RosterStatus = "active" | "low_supply" | "stopped" | "invited";

export type RosterMember = {
  id: string;
  name: string;
  handle: string;
  invited: boolean;
  status: RosterStatus;
  protocolDay: number | null;
  lastActivity: string;
  supplyDays: number | null;
  authorizedSupply: boolean;
  attentionReason: string | null;
  followUps: FollowUpNote[];
};

const PROFILES: Record<
  string,
  Omit<RosterMember, "id" | "name" | "handle" | "invited" | "followUps">
> = {
  c1: {
    status: "active",
    protocolDay: 18,
    lastActivity: "Checked in yesterday",
    supplyDays: 14,
    authorizedSupply: true,
    attentionReason: null,
  },
  c2: {
    status: "low_supply",
    protocolDay: 9,
    lastActivity: "Last dose log 6 days ago",
    supplyDays: 3,
    authorizedSupply: true,
    attentionReason: "Low supply — 3 days left. Follow up before they run out.",
  },
  c3: {
    status: "invited",
    protocolDay: null,
    lastActivity: "Invitation waiting",
    supplyDays: null,
    authorizedSupply: false,
    attentionReason: "Invited, not yet on a protocol.",
  },
  c4: {
    status: "stopped",
    protocolDay: 4,
    lastActivity: "No activity for 14 days",
    supplyDays: 0,
    authorizedSupply: true,
    attentionReason: "Stopped. Ask whether they need a refill or a pause.",
  },
  c5: {
    status: "active",
    protocolDay: 6,
    lastActivity: "Logged this morning",
    supplyDays: 22,
    authorizedSupply: true,
    attentionReason: null,
  },
};

export const ROSTER_FILTERS: Array<{ id: RosterFilter; label: string }> = [
  { id: "attention", label: "Needs attention" },
  { id: "active", label: "Active" },
  { id: "low_supply", label: "Low supply" },
  { id: "stopped", label: "Stopped" },
  { id: "invited", label: "Invited" },
];

export function buildRoster(session: MockSession): RosterMember[] {
  return CONTACTS.map((contact): RosterMember => {
    const profile = PROFILES[contact.id];
    const invited = session.contactInvited[contact.id] ?? contact.invited;
    const followUps = session.followUps[contact.id] ?? [];
    if (!profile) {
      return {
        id: contact.id,
        name: contact.name,
        handle: contact.handle,
        invited,
        status: invited ? "invited" : "active",
        protocolDay: null,
        lastActivity: invited ? "Invitation waiting" : "No recent activity",
        supplyDays: null,
        authorizedSupply: false,
        attentionReason: invited ? "Invited, not yet on a protocol." : null,
        followUps,
      };
    }
    return {
      id: contact.id,
      name: contact.name,
      handle: contact.handle,
      invited,
      status: profile.status,
      protocolDay: profile.protocolDay,
      lastActivity: profile.lastActivity,
      supplyDays: profile.supplyDays,
      authorizedSupply: profile.authorizedSupply,
      attentionReason: profile.attentionReason,
      followUps,
    };
  }).sort((a, b) => {
    const attention = Number(Boolean(b.attentionReason)) - Number(Boolean(a.attentionReason));
    if (attention !== 0) return attention;
    return a.name.localeCompare(b.name);
  });
}

export function filterRoster(members: RosterMember[], filter: RosterFilter) {
  return members.filter((member) => {
    if (filter === "attention") return Boolean(member.attentionReason);
    if (filter === "active") return member.status === "active";
    if (filter === "low_supply") return member.status === "low_supply";
    if (filter === "stopped") return member.status === "stopped";
    return member.status === "invited" || member.invited;
  });
}

export function followUpDraft(member: RosterMember) {
  const reason = member.attentionReason ?? "Regular check-in.";
  return {
    reason,
    draft: `Hi ${member.name}, checking in on your Gutguard week. How are the daily doses going?`,
  };
}

export function shouldOfferRosterSearch(count: number) {
  return count >= 8;
}
