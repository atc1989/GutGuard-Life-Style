"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { cx } from "@/lib/cx";
import { BASE_STEPS, type ContactChannel } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";
import {
  buildRoster,
  filterRoster,
  followUpDraft,
  ROSTER_FILTERS,
  shouldOfferRosterSearch,
  type RosterFilter,
  type RosterMember,
} from "@/lib/team";

const CHANNELS: Array<{ id: ContactChannel; label: string }> = [
  { id: "sms", label: "SMS" },
  { id: "telegram", label: "Telegram" },
  { id: "in-app", label: "In-app" },
];

function statusLabel(member: RosterMember) {
  if (member.status === "low_supply") return "Low supply";
  if (member.status === "stopped") return "Stopped";
  if (member.status === "invited") return "Invited";
  return "Active";
}

export function TeamPage() {
  const { session, update } = useSession();
  const { open } = useOverlay();
  const { push } = useToast();
  const unlocked = session.baseDone.filter(Boolean).length === BASE_STEPS.length;
  const [filter, setFilter] = useState<RosterFilter>("attention");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [followId, setFollowId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [channel, setChannel] = useState<ContactChannel>(session.contactChannel);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [note, setNote] = useState("");

  const roster = useMemo(() => buildRoster(session), [session]);
  const filtered = useMemo(() => {
    const rows = filterRoster(roster, filter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (member) =>
        member.name.toLowerCase().includes(q) ||
        member.handle.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [filter, query, roster]);
  const selected = roster.find((member) => member.id === selectedId) ?? null;
  const followMember = roster.find((member) => member.id === followId) ?? null;
  const showSearch = shouldOfferRosterSearch(roster.length);

  function startFollowUp(member: RosterMember) {
    const next = followUpDraft(member);
    setFollowId(member.id);
    setDraft(next.draft);
    setChannel(session.contactChannel);
    setSelectedId(null);
  }

  function continueFollowUp() {
    if (!followMember) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(draft);
    }
    setConfirmOpen(true);
    push({
      tone: "success",
      title: "Draft ready",
      body: "Copied locally. Gutguard did not send this message.",
    });
  }

  function recordFollowUp() {
    if (!followMember) return;
    const entry = {
      at: new Date().toISOString(),
      channel,
      note: note.trim() || "Follow-up marked complete.",
    };
    update({
      followUps: {
        ...session.followUps,
        [followMember.id]: [entry, ...(session.followUps[followMember.id] ?? [])],
      },
    });
    setConfirmOpen(false);
    setFollowId(null);
    setNote("");
    push({
      tone: "success",
      title: "Follow-up recorded",
      body: "Private note saved on this roster. The external app was not assumed.",
    });
  }

  if (!unlocked) {
    return (
      <div className="gg-stack">
        <div className="gg-page-head">
          <div>
            <h1 className="gg-heading">My Team</h1>
            <p className="gg-lede">Roster, check-ins, and follow-ups.</p>
          </div>
        </div>
        <EmptyState
          title="My Team unlocks after BASE"
          copy="Finish BASE Activation to open your roster, check-ins, and follow-ups."
          action={{ label: "Continue BASE", onClick: () => open("base") }}
        />
      </div>
    );
  }

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Team</h1>
          <p className="gg-lede">Needs attention first. Nothing is sent until you say it was.</p>
        </div>
        <Button variant="commerce" onClick={() => open("invite")}>
          Invite
        </Button>
      </div>

      <div className="gg-chip-row" role="group" aria-label="Roster filters">
        {ROSTER_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cx("gg-chip", filter === item.id && "is-active")}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <span className="gg-chip__count">
              {filterRoster(roster, item.id).length}
            </span>
          </button>
        ))}
      </div>

      {showSearch ? (
        <FormField
          label="Search roster"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No one in this filter"
          copy="Try another chip, or invite someone new."
        />
      ) : (
        <div className="gg-roster">
          {filtered.map((member) => (
            <Card key={member.id}>
              <button
                type="button"
                className="gg-roster__open"
                onClick={() => setSelectedId(member.id)}
              >
                <Avatar name={member.name} />
                <div>
                  <strong>{member.name}</strong>
                  <p className="gg-help">
                    {statusLabel(member)}
                    {member.protocolDay != null
                      ? ` · Day ${member.protocolDay}`
                      : " · Invitation"}
                    {` · ${member.lastActivity}`}
                    {member.authorizedSupply && member.supplyDays != null
                      ? ` · ${member.supplyDays} days supply`
                      : ""}
                  </p>
                </div>
                {member.attentionReason ? <Badge active>Needs attention</Badge> : <Badge>{statusLabel(member)}</Badge>}
              </button>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        title={selected?.name ?? "Member"}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        footer={
          selected ? (
            <Button variant="commerce" block onClick={() => startFollowUp(selected)}>
              Write follow-up
            </Button>
          ) : null
        }
      >
        {selected ? (
          <div className="gg-stack">
            <div>
              <p className="gg-eyebrow">Status</p>
              <p className="gg-lede">{selected.attentionReason ?? statusLabel(selected)}</p>
            </div>
            <div>
              <p className="gg-eyebrow">Recent adherence</p>
              <p className="gg-help">
                {selected.protocolDay != null
                  ? `Protocol day ${selected.protocolDay}. ${selected.lastActivity}.`
                  : selected.lastActivity}
              </p>
            </div>
            <div>
              <p className="gg-eyebrow">Supply</p>
              <p className="gg-help">
                {selected.authorizedSupply && selected.supplyDays != null
                  ? `${selected.supplyDays} days remaining on the last known bottle.`
                  : "Supply is hidden until this member shares it."}
              </p>
            </div>
            <div>
              <p className="gg-eyebrow">Proof and calendar</p>
              <p className="gg-help">
                Proof stays on their Health page unless they authorize a review.
              </p>
            </div>
            <div>
              <p className="gg-eyebrow">Follow-up history</p>
              {selected.followUps.length === 0 ? (
                <p className="gg-help">No private notes yet.</p>
              ) : (
                <ul className="gg-followup-list">
                  {selected.followUps.map((item) => (
                    <li key={item.at}>
                      <strong>{new Date(item.at).toLocaleString()}</strong>
                      <p className="gg-help">
                        {item.channel} · {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title="Follow-up"
        open={Boolean(followMember) && !confirmOpen}
        onClose={() => setFollowId(null)}
        footer={
          followMember ? (
            <Button variant="commerce" block onClick={continueFollowUp}>
              Copy draft and continue
            </Button>
          ) : null
        }
      >
        {followMember ? (
          <div className="gg-stack">
            <AlertReason reason={followUpDraft(followMember).reason} />
            <label className="gg-field" htmlFor="follow-up-draft">
              <span className="gg-field__label">Editable draft</span>
              <textarea
                id="follow-up-draft"
                className="gg-field__control gg-field__control--area"
                rows={5}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
            <p className="gg-help">Choose the channel this member already approved.</p>
            <div className="gg-chip-row">
              {CHANNELS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={cx("gg-chip", channel === option.id && "is-active")}
                  aria-pressed={channel === option.id}
                  onClick={() => setChannel(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title="Did you complete this follow-up?"
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setFollowId(null);
        }}
        footer={
          <div className="gg-row gg-row--spread">
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmOpen(false);
                setFollowId(null);
              }}
            >
              Not yet
            </Button>
            <Button variant="commerce" onClick={recordFollowUp}>
              Yes, record it
            </Button>
          </div>
        }
      >
        <div className="gg-stack">
          <p className="gg-lede">
            Opening Messages or copying a draft does not mean it was sent. Only
            record a note if you actually followed up.
          </p>
          <label className="gg-field" htmlFor="follow-up-note">
            <span className="gg-field__label">Private note</span>
            <textarea
              id="follow-up-note"
              className="gg-field__control gg-field__control--area"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Short note for you only"
            />
          </label>
        </div>
      </Drawer>
    </div>
  );
}

function AlertReason({ reason }: { reason: string }) {
  return (
    <div className="gg-alert gg-alert--note" role="status">
      <strong className="gg-alert__kicker">Why this follow-up</strong>
      {reason}
    </div>
  );
}
