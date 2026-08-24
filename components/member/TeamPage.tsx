"use client";

import { CONTACTS, BASE_STEPS } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function TeamPage({
  serverBaseComplete,
}: {
  serverBaseComplete: boolean | null;
}) {
  const { session } = useSession();
  const { open } = useOverlay();
  const localComplete = session.baseDone.filter(Boolean).length === BASE_STEPS.length;
  const unlocked = serverBaseComplete ?? localComplete;

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
          copy="Finish all five BASE Activation steps to open your roster, check-ins, and invites. The lock is enforced on the server, not only on this screen."
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
          <p className="gg-lede">
            Invite friends to any gathering. Points the moment they join.
          </p>
        </div>
        <Button variant="commerce" onClick={() => open("invite")}>
          Invite
        </Button>
      </div>
      <div className="gg-grid-2">
        {CONTACTS.map((contact) => {
          const invited = session.contactInvited[contact.id] ?? contact.invited;
          return (
            <Card key={contact.id}>
              <div className="gg-row gg-invite-row">
                <div>
                  <strong>{contact.name}</strong>
                  <p className="gg-help">{contact.handle}</p>
                </div>
                {invited ? (
                  <Badge active>Invited</Badge>
                ) : (
                  <Button variant="secondary" onClick={() => open("invite")}>
                    Invite
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
