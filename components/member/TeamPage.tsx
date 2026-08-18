"use client";

import { CONTACTS, BASE_STEPS } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function TeamPage() {
  const { session, update } = useSession();
  const { open } = useOverlay();
  const { push } = useToast();
  const unlocked = session.baseDone.filter(Boolean).length === BASE_STEPS.length;

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
          action={{ label: "Continue BASE →", onClick: () => open("base") }}
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
      </div>
      <div className="gg-grid-2">
        {CONTACTS.map((contact) => {
          const invited = session.contactInvited[contact.id] ?? contact.invited;
          return (
            <Card key={contact.id}>
              <div className="gg-row">
                <div>
                  <strong>{contact.name}</strong>
                  <p className="gg-help">{contact.handle}</p>
                </div>
                {invited ? (
                  <Badge active>Invited</Badge>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      update({
                        contactInvited: {
                          ...session.contactInvited,
                          [contact.id]: true,
                        },
                        invites: session.invites.some((row) => row.name === contact.name)
                          ? session.invites
                          : [
                              ...session.invites,
                              { name: contact.name, stage: "registered" },
                            ],
                        pending: session.pending + 5,
                      });
                      push({
                        tone: "success",
                        title: "Invite sent",
                        body: contact.name,
                      });
                    }}
                  >
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
