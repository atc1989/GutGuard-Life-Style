"use client";

import { useMemo, useState } from "react";
import { persistInvite, persistPointEvent } from "@/lib/actions/member";
import { CONTACTS, LINKS, POINTS } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function InvitePicker() {
  const { overlay, close } = useOverlay();
  const { session, update } = useSession();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONTACTS.filter(
      (contact) =>
        !q ||
        contact.name.toLowerCase().includes(q) ||
        contact.handle.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [query]);

  async function invite(contact: (typeof CONTACTS)[number]) {
    setBusy(contact.id);
    update({
      contactInvited: { ...session.contactInvited, [contact.id]: true },
      pending: session.pending + POINTS.register,
      invites: session.invites.some((row) => row.name === contact.name)
        ? session.invites
        : [...session.invites, { name: contact.name, stage: "registered" }],
      ledger: [
        {
          id: `inv-${contact.id}`,
          kind: "registered",
          amount: POINTS.register,
          pending: true,
          label: `${contact.name} registered`,
        },
        ...session.ledger,
      ],
    });
    if (isSupabaseConfigured()) {
      await persistInvite(contact.name, contact.handle, "registered");
      await persistPointEvent({
        kind: "register",
        amount: POINTS.register,
        pending: true,
        label: `${contact.name} registered`,
      });
    }
    push({ tone: "success", title: "Invite sent", body: contact.name });
    setBusy(null);
  }

  function share() {
    const text = `Join me at Gutguard Lifestyle. ${LINKS.site}`;
    if (navigator.share) {
      void navigator.share({ title: "Gutguard Lifestyle", text, url: LINKS.site });
      return;
    }
    void navigator.clipboard.writeText(text);
    push({ tone: "success", title: "Link copied", body: "Share it from Messages, Messenger, or Viber." });
  }

  return (
    <Drawer title="Invite a friend" open={overlay === "invite"} onClose={close}>
      <div className="gg-stack">
        <p className="gg-lede">
          Pick anyone from Messages, Messenger, or Viber. The date and place are already in the link.
        </p>
        <FormField
          label="Search contacts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name or number"
        />
        <Button variant="secondary" onClick={share}>
          Open phone share menu
        </Button>
        {rows.length === 0 ? (
          <EmptyState title="No one by that name." copy="Try another spelling, or share the link." />
        ) : (
          rows.map((contact) => {
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
                      loading={busy === contact.id}
                      onClick={() => void invite(contact)}
                    >
                      Invite
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
        <p className="gg-help">
          +{POINTS.register} pending when they join. Points become real when they come to an event.
        </p>
      </div>
    </Drawer>
  );
}
