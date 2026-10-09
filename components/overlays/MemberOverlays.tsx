"use client";

import {
  BASE_STEPS,
  EVENTS,
  FIRST_ORDER_PESOS,
  GEMA_RANKS,
  LINKS,
  POINTS,
} from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { SpokeLinks } from "@/components/shell/SpokeLinks";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { EventRow } from "@/components/ui/RequirementTimeline";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { QRBlock } from "@/components/ui/QRBlock";
import { RequirementTimeline } from "@/components/ui/RequirementTimeline";
import { Switch } from "@/components/ui/Switch";
import { InvitePicker } from "@/components/overlays/InvitePicker";
import { StoryShare } from "@/components/overlays/StoryShare";
import { FormField } from "@/components/ui/FormField";
import {
  persistBaseStep,
  persistPointEvent,
  gemaUnlocked,
  loadProfile,
  queueMemberOrder,
  saveProfile,
} from "@/lib/actions/member";
import { profileSchema, type ProfileValues } from "@/lib/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useEffect, useState } from "react";
import { formatIdentityDetails } from "@/lib/member-display";
import { memberNotifications } from "@/lib/member-notifications";
import { Avatar } from "@/components/ui/Avatar";
import { useMemberChrome } from "@/lib/lifestyle/member-chrome-context";
import { Bell, QrCode, Settings } from "lucide-react";

/**
 * Change 5 — the one place a member edits their name and mobile.
 *
 * It loads and saves on its own rather than reading `session`: with Supabase
 * configured the client session is a guest session by design, so `session.name`
 * and `session.mobile` are empty there. With Supabase off there is no server to
 * ask, and the mock session is the only truth. Hence the two paths.
 */
function SettingsIdentity() {
  const { session, update } = useSession();
  const { push } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    // The mock session is the only truth when there is no server to ask.
    defaultValues: configured
      ? { name: "", mobile: "" }
      : { name: session.name, mobile: session.mobile },
  });
  const { reset } = form;

  // Mounted by the drawer opening, so this reads the row once per open — which
  // is what keeps it honest after a change made on GEMA or Academy.
  useEffect(() => {
    if (!configured) return;
    void loadProfile().then((profile) => {
      if (profile) reset(profile);
    });
  }, [configured, reset]);

  return (
    <form
      className="gg-stack"
      noValidate
      aria-busy={saving || undefined}
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);
        setSaving(true);
        try {
          if (!configured) {
            update({ name: values.name, mobile: values.mobile });
          } else {
            const result = await saveProfile(values);
            if (!result.ok) {
              setFormError(result.error);
              for (const [key, message] of Object.entries(result.fieldErrors ?? {})) {
                if (key === "name" || key === "mobile") {
                  form.setError(key, { type: "server", message });
                }
              }
              return;
            }
            // The saved values, not the typed ones: the schema normalizes a
            // mobile to +639…, and the field should show what the row holds.
            if (result.values) reset(result.values);
            router.refresh();
          }
          push({ tone: "success", title: "Saved", body: "Your details are up to date." });
        } finally {
          setSaving(false);
        }
      })}
    >
      {formError ? (
        <p className="gg-field__error" role="alert" aria-live="polite">
          {formError}
        </p>
      ) : null}
      <FormField
        label="Your name"
        placeholder="Your name here"
        autoComplete="name"
        {...form.register("name")}
        error={form.formState.errors.name?.message}
      />
      <FormField
        label="Mobile number"
        placeholder="09xx xxx xxxx"
        inputMode="tel"
        autoComplete="tel"
        hint="Philippine numbers only — 09…, 63… or +63…"
        {...form.register("mobile")}
        error={form.formState.errors.mobile?.message}
      />
      <Button type="submit" variant="commerce" loading={saving}>
        Save details
      </Button>
    </form>
  );
}

export function MemberOverlays() {
  const { overlay, close, open } = useOverlay();
  const { session, update } = useSession();
  const chrome = useMemberChrome();
  const { push } = useToast();
  const [qty, setQty] = useState(1);
  const [serverGema, setServerGema] = useState<boolean | null>(null);
  const localComplete = session.baseDone.every(Boolean);
  const baseComplete = isSupabaseConfigured()
    ? Boolean(serverGema)
    : localComplete;
  const identityDetails = formatIdentityDetails(chrome);
  const notifications = memberNotifications(session);
  const displayName = chrome.displayName;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void gemaUnlocked().then(setServerGema);
  }, [session.baseDone]);

  return (
    <>
      <Drawer
        id="gg-account-sheet"
        title="Account"
        open={overlay === "account"}
        onClose={close}
      >
        <div className="gg-stack">
          <div className="gg-account-sheet__identity">
            <Avatar name={displayName} />
            <div>
              <strong>{displayName}</strong>
              {chrome.sponsor ? (
                <p className="gg-help">with {chrome.sponsor}</p>
              ) : null}
            </div>
          </div>
          <Button variant="secondary" block onClick={() => open("notifications")}>
            <Bell aria-hidden />
            Notifications
            {notifications.length ? (
              <span className="gg-account__badge">{notifications.length}</span>
            ) : null}
          </Button>
          <SpokeLinks variant="sheet" />
          <Button variant="secondary" block onClick={() => open("settings")}>
            <Settings aria-hidden />
            Settings
          </Button>
          <Button variant="secondary" block onClick={() => open("qr")}>
            <QrCode aria-hidden />
            My QR code
          </Button>
          <SignOutButton />
        </div>
      </Drawer>
      <Drawer title="Order now" open={overlay === "order"} onClose={close}>
        <p className="gg-lede" style={{ marginBottom: 16 }}>
          Mock checkout — no card charge in the browser. When Supabase is on, this
          queues a pending order for webhook reconcile.
        </p>
        <Card>
          <p className="gg-eyebrow">Your Gutguard</p>
          <h3 className="gg-heading" style={{ fontSize: 28, margin: "8px 0" }}>
            Monthly protocol
          </h3>
          <p className="gg-help">
            ₱{FIRST_ORDER_PESOS.toLocaleString()} · 1 bottle / 2 blisters
          </p>
          <div className="gg-row" style={{ marginTop: 16 }}>
            <span>Quantity</span>
            <QuantityStepper
              label="Order quantity"
              value={qty}
              min={1}
              max={6}
              onChange={setQty}
            />
          </div>
        </Card>
        <Button
          variant="commerce"
          block
          style={{ marginTop: 16 }}
          onClick={() => {
            void (async () => {
              const result = await queueMemberOrder({
                qty,
                amountPesos: FIRST_ORDER_PESOS * qty,
              });
              if (!result.ok) {
                push({
                  tone: "error",
                  title: "Could not queue",
                  body: result.error,
                });
                return;
              }
              update({ daysLeft: 30 * qty, phase: "member" });
              push({
                tone: "success",
                title: "Order queued",
                body: `${qty} bottle${qty > 1 ? "s" : ""} — mock only, no charge.`,
              });
              close();
            })();
          }}
        >
          Place mock order
        </Button>
      </Drawer>

      <Drawer title="Settings" open={overlay === "settings"} onClose={close}>
        <div className="gg-stack">
          {/* Mounted only while open, so each visit starts from the row. */}
          {overlay === "settings" ? <SettingsIdentity /> : null}
          <Switch
            label="Phone alerts"
            checked={session.notifications}
            onChange={(notifications) => update({ notifications })}
          />
          <p className="gg-help">Nudges + low-supply reminders</p>
          <div className="gg-row">
            <span>Capsules per day</span>
            <QuantityStepper
              label="Daily capsules"
              value={session.capsulesPerDay}
              min={2}
              max={3}
              onChange={(capsulesPerDay) => update({ capsulesPerDay })}
            />
          </div>
          <p className="gg-help">The protocol needs at least 2 capsules a day.</p>
          {identityDetails.length ? (
            <p className="gg-help">{identityDetails.join(" · ")}</p>
          ) : null}
          <Button variant="secondary" onClick={() => open("qr")}>
            Show my QR code full size
          </Button>
          <SignOutButton />
        </div>
      </Drawer>

      <Drawer
        id="gg-notifications-sheet"
        title="Notifications"
        open={overlay === "notifications"}
        onClose={close}
      >
        {notifications.length ? (
          <ul className="gg-notification-list">
            {notifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No alerts" copy="You’re all caught up." />
        )}
      </Drawer>

      <Drawer title="BASE Activation" open={overlay === "base"} onClose={close}>
        <p className="gg-lede" style={{ marginBottom: 16 }}>
          Where every Gentrep starts. Learn the product and the protocol properly.
        </p>
        <RequirementTimeline
          steps={BASE_STEPS.map((step, index) => ({
            title: step.title,
            when: step.when,
            detail: step.detail,
            done: session.baseDone[index],
            onToggle: () => {
              const next = [...session.baseDone];
              next[index] = !next[index];
              update({ baseDone: next });
              if (isSupabaseConfigured()) {
                void persistBaseStep(index, next[index]);
              }
            },
          }))}
        />
        <div style={{ marginTop: 16 }}>
          {EVENTS.slice(0, 3).map((event) => (
            <EventRow
              key={event.id}
              title={event.title}
              place={event.place}
              when={event.when}
              onBook={() =>
                push({
                  tone: "success",
                  title: "Reserved",
                  body: event.title,
                })
              }
            />
          ))}
        </div>
      </Drawer>

      <Drawer
        title="GEMA"
        open={overlay === "gema"}
        onClose={close}
        footer={
          !baseComplete ? (
            <Button variant="commerce" onClick={() => open("base")}>
              Continue BASE
            </Button>
          ) : undefined
        }
      >
        {baseComplete ? (
          <div className="gg-stack">
            <p className="gg-lede">
              For members who finish BASE and choose to build.
            </p>
            {GEMA_RANKS.map((rank) => (
              <Card key={rank.title}>
                <p className="gg-eyebrow">{rank.title}</p>
                <p style={{ marginTop: 8 }}>{rank.copy}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="GEMA is locked"
            copy={`Opens when BASE Activation is complete — ${BASE_STEPS.length - session.baseDone.filter(Boolean).length} to go.`}
          />
        )}
      </Drawer>

      <Drawer title="GG-VERSE" open={overlay === "ggverse"} onClose={close}>
        <div className="gg-stack">
          <Card variant="ceremonial">
            <p className="gg-eyebrow" style={{ color: "var(--gg-gold-soft)" }}>
              Invitation only
            </p>
            <h3
              className="gg-heading"
              style={{ color: "var(--gg-bone)", marginTop: 8 }}
            >
              The members’ world
            </h3>
            <p
              className="gg-lede"
              style={{ color: "var(--gg-bone)", marginTop: 10 }}
            >
              Ranks, tools, the builder economy. Your sponsor decides when you’re ready and sends the link.
            </p>
          </Card>
          <Button
            variant="secondary"
            onClick={() => window.open(LINKS.site, "_blank", "noopener")}
          >
            Ask my sponsor for access
          </Button>
          <Button
            variant="secondary"
            disabled={session.telegram}
            onClick={() => {
              window.open(LINKS.telegram, "_blank", "noopener");
              if (session.telegram) return;
              const nextPoints = session.points + POINTS.telegram;
              update({
                telegram: true,
                points: nextPoints,
                ledger: [
                  {
                    id: `tg-${Date.now()}`,
                    kind: "telegram",
                    amount: POINTS.telegram,
                    pending: false,
                    label: "Joined Telegram",
                  },
                  ...session.ledger,
                ],
              });
              if (isSupabaseConfigured()) {
                void persistPointEvent({
                  kind: "telegram",
                  amount: POINTS.telegram,
                  pending: false,
                  label: "Joined Telegram",
                });
              }
              push({
                tone: "success",
                title: "Telegram points",
                body: `+${POINTS.telegram} added to your card.`,
              });
            }}
          >
            {session.telegram
              ? "Telegram joined"
              : `Join Telegram · +${POINTS.telegram}`}
          </Button>
          <Button
            variant="secondary"
            disabled={session.facebook}
            onClick={() => {
              window.open(LINKS.facebook, "_blank", "noopener");
              if (session.facebook) return;
              update({
                facebook: true,
                points: session.points + POINTS.facebook,
                ledger: [
                  {
                    id: `fb-${Date.now()}`,
                    kind: "facebook",
                    amount: POINTS.facebook,
                    pending: false,
                    label: "Followed on Facebook",
                  },
                  ...session.ledger,
                ],
              });
              if (isSupabaseConfigured()) {
                void persistPointEvent({
                  kind: "facebook",
                  amount: POINTS.facebook,
                  pending: false,
                  label: "Followed on Facebook",
                });
              }
              push({
                tone: "success",
                title: "Facebook points",
                body: `+${POINTS.facebook} added to your card.`,
              });
            }}
          >
            {session.facebook
              ? "Facebook followed"
              : `Follow Facebook · +${POINTS.facebook}`}
          </Button>
        </div>
      </Drawer>

      <Drawer title="Your QR" open={overlay === "qr"} onClose={close}>
        <div style={{ textAlign: "center" }}>
          <p className="gg-eyebrow">{displayName}</p>
          {chrome.cardNo ? (
            <>
              <p className="gg-help" style={{ margin: "8px 0 12px" }}>
                Show this to staff at the door and in the centers.
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <QRBlock seed={chrome.cardNo} />
              </div>
              <p className="gg-help" style={{ fontFamily: "var(--gg-mono)", marginTop: 12 }}>
                {chrome.cardNo}
              </p>
            </>
          ) : (
            <EmptyState
              title="Card not ready"
              copy="Your Gutguard card number will show here once it is minted. This is not a guest or placeholder code."
            />
          )}
        </div>
      </Drawer>

      <StoryShare open={overlay === "share"} onClose={close} />
      <InvitePicker />
    </>
  );
}
