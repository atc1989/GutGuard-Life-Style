"use client";

import { CONTACTS, BASE_STEPS } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PersonRow } from "@/components/lifestyle/PersonRow";
import { StatGroup } from "@/components/lifestyle/StatGroup";

export function TeamPage() {
  const { session } = useSession();
  const { open } = useOverlay();
  const unlocked = session.baseDone.filter(Boolean).length === BASE_STEPS.length;
  const invited = CONTACTS.filter(
    (contact) => session.contactInvited[contact.id] ?? contact.invited,
  ).length;

  const head = (
    <header className="gg-page-head">
      {session.team ? <Eyebrow>{session.team}</Eyebrow> : null}
      <h1 className="gg-page-head__title">My Team</h1>
      <p className="gg-page-head__lede">
        {unlocked
          ? "Invite friends to any gathering. Points the moment they join."
          : "Roster, check-ins, and follow-ups."}
      </p>
    </header>
  );

  if (!unlocked) {
    return (
      <div className="gg-narrow">
        {head}
        <EmptyState
          variant="soon"
          badge="Locked"
          title="My Team unlocks after BASE"
          copy="Finish BASE Activation to open your roster, check-ins, and follow-ups."
          action={{ label: "Continue BASE ›", onClick: () => open("base") }}
        />
      </div>
    );
  }

  return (
    <div className="gg-cols">
      <div className="gg-col">
        {head}
        <StatGroup
          items={[
            { value: CONTACTS.length, label: "Contacts" },
            { value: invited, label: "Invited" },
            { value: CONTACTS.length - invited, label: "Not yet" },
          ]}
        />
        <Button size="lg" onClick={() => open("invite")}>
          Invite
        </Button>
      </div>
      <section className="gg-col" aria-label="Contacts">
        {CONTACTS.map((contact) => {
          const isInvited = session.contactInvited[contact.id] ?? contact.invited;
          return (
            <PersonRow
              key={contact.id}
              variant="team"
              initialsFrom={contact.name}
              name={contact.name}
              description={contact.handle}
              trailing={
                isInvited ? (
                  <Badge active>Invited</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => open("invite")}>
                    Invite
                  </Button>
                )
              }
            />
          );
        })}
      </section>
    </div>
  );
}
