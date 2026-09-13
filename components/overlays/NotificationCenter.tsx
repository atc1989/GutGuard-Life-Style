"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cx } from "@/lib/cx";
import {
  groupNotifications,
  memberNotifications,
  permissionCopy,
  readBrowserPermission,
  requestBrowserNotifications,
} from "@/lib/member-notifications";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";

export function NotificationCenter() {
  const { session, update } = useSession();
  const { open, close } = useOverlay();
  const router = useRouter();
  const notices = memberNotifications(session);
  const grouped = groupNotifications(notices);
  const permission = session.notificationPrefs.permission;

  function markRead(id: string) {
    update({
      notificationReads: { ...session.notificationReads, [id]: true },
    });
  }

  function openNotice(id: string, href?: string, overlay?: Parameters<typeof open>[0]) {
    markRead(id);
    close();
    if (overlay) open(overlay);
    if (href) router.push(href);
  }

  async function enableBrowserAlerts() {
    const next = await requestBrowserNotifications();
    update({
      notifications: next === "allowed",
      notificationPrefs: { ...session.notificationPrefs, permission: next },
    });
  }

  function syncPermission() {
    update({
      notificationPrefs: {
        ...session.notificationPrefs,
        permission: readBrowserPermission(),
      },
    });
  }

  return (
    <div className="gg-stack">
      {permission === "not_asked" ? (
        <div className="gg-alert" role="status">
          <strong className="gg-alert__kicker">Before we ask the browser</strong>
          Refill and check-in reminders stay in this app first. Enable only if you
          want this browser to ping you as well.
          <Button variant="commerce" className="gg-space-top" onClick={() => void enableBrowserAlerts()}>
            Enable browser reminders
          </Button>
        </div>
      ) : (
        <p className="gg-help">{permissionCopy(permission)}</p>
      )}

      <Switch
        label="Quiet hours · 21:00–07:00"
        checked={session.notificationPrefs.quietHours}
        onChange={(quietHours) =>
          update({
            notificationPrefs: { ...session.notificationPrefs, quietHours },
          })
        }
      />
      <Switch
        label="Refill reminders"
        checked={session.notificationPrefs.refill}
        onChange={(refill) =>
          update({
            notificationPrefs: { ...session.notificationPrefs, refill },
          })
        }
      />
      <Switch
        label="Check-in reminders"
        checked={session.notificationPrefs.checkin}
        onChange={(checkin) =>
          update({
            notificationPrefs: { ...session.notificationPrefs, checkin },
          })
        }
      />
      {permission !== "not_asked" ? (
        <Button variant="secondary" onClick={syncPermission}>
          Refresh browser permission
        </Button>
      ) : null}

      {notices.length === 0 ? (
        <EmptyState title="No alerts" copy="Nothing waiting right now." />
      ) : (
        <>
          {grouped.today.length ? (
            <NoticeGroup
              title="Today"
              items={grouped.today}
              reads={session.notificationReads}
              onOpen={openNotice}
            />
          ) : null}
          {grouped.earlier.length ? (
            <NoticeGroup
              title="Earlier"
              items={grouped.earlier}
              reads={session.notificationReads}
              onOpen={openNotice}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function NoticeGroup({
  title,
  items,
  reads,
  onOpen,
}: {
  title: string;
  items: ReturnType<typeof memberNotifications>;
  reads: Record<string, boolean>;
  onOpen: (id: string, href?: string, overlay?: Parameters<ReturnType<typeof useOverlay>["open"]>[0]) => void;
}) {
  return (
    <div>
      <p className="gg-eyebrow">{title}</p>
      <ul className="gg-notification-list">
        {items.map((item) => {
          const read = Boolean(reads[item.id]);
          return (
            <li key={item.id}>
              <button
                type="button"
                className={cx("gg-notice", read && "is-read")}
                onClick={() => onOpen(item.id, item.href, item.overlay)}
              >
                <strong>{item.title}</strong>
                <span className="gg-help">{item.body}</span>
                <span className="gg-help">{read ? "Read" : "Unread"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
