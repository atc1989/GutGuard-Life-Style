"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { recoverFailedOrder, type AdminOrderRow } from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/schemas/order";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

const FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "reconciled", label: "Reconciled" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "reconciled":
      return "Reconciled";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
  }
}

export function AdminOrdersClient({
  rows,
  counts,
  status,
  webhookDown,
  lastWebhookError,
}: {
  rows: AdminOrderRow[];
  counts: Record<OrderStatus, number>;
  status: OrderStatus | "all";
  webhookDown: boolean;
  lastWebhookError: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [recoverTarget, setRecoverTarget] = useState<AdminOrderRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setFilter(next: OrderStatus | "all") {
    const params = new URLSearchParams();
    if (next !== "all") params.set("status", next);
    const qs = params.toString();
    router.push(qs ? `/admin/orders?${qs}` : "/admin/orders");
  }

  return (
    <div className="gg-stack">
      <div>
        <h2 className="gg-heading" style={{ fontSize: 28 }}>
          Orders
        </h2>
        <p className="gg-help" style={{ marginTop: 6 }}>
          Status comes from Maya webhooks — operators never paste a card number here.
        </p>
      </div>

      {webhookDown ? (
        <Alert tone="error">
          Maya callback is failing
          {lastWebhookError ? ` — ${lastWebhookError}` : "."} Check{" "}
          <code>/api/webhooks/maya</code> and <code>MAYA_WEBHOOK_SECRET</code>.
        </Alert>
      ) : null}

      <div className="gg-admin-chips" role="group" aria-label="Order status filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className="gg-admin-chip"
            aria-pressed={status === filter.id}
            onClick={() => setFilter(filter.id)}
          >
            {filter.label}
            {filter.id !== "all" ? ` (${counts[filter.id]})` : ""}
          </button>
        ))}
      </div>

      <p className="gg-help" aria-live="polite">
        {status === "pending"
          ? `${counts.pending} pending`
          : `${rows.length} order${rows.length === 1 ? "" : "s"} shown`}
      </p>

      {message ? <Alert>{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      {rows.length === 0 ? (
        <div className="gg-empty">
          <strong>No orders yet.</strong>
          <p>
            Member Place-order queues a pending row. That is not the same as a
            webhook outage.
          </p>
        </div>
      ) : (
        <div className="gg-admin-table-wrap">
          <table className="gg-admin-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Refill pacing</th>
                <th scope="col">Maya</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/users/${row.userId}`} className="gg-link">
                      {row.memberName}
                    </Link>
                    <p className="gg-help gg-admin-table__mono">{row.memberMobile}</p>
                  </td>
                  <td className="gg-admin-num">
                    ₱{row.amountPesos.toLocaleString()} · ×{row.qty}
                  </td>
                  <td>
                    <Badge active={row.status === "reconciled"}>
                      {statusLabel(row.status)}
                    </Badge>
                    <span className="gg-vh">{statusLabel(row.status)}</span>
                    {row.lastError ? (
                      <p className="gg-help">{row.lastError}</p>
                    ) : null}
                    {row.reconciledAt ? (
                      <p className="gg-help">
                        Recovered {new Date(row.reconciledAt).toLocaleString()}
                      </p>
                    ) : null}
                  </td>
                  <td>
                    <dl className="gg-admin-pace">
                      <div>
                        <dt>Days left</dt>
                        <dd>{row.daysLeft}</dd>
                      </div>
                      <div>
                        <dt>Capsules/day</dt>
                        <dd>{row.capsulesPerDay}</dd>
                      </div>
                    </dl>
                  </td>
                  <td className="gg-admin-table__mono">
                    {row.mayaPaymentId ?? "—"}
                  </td>
                  <td>
                    {row.status === "failed" ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setRecoverTarget(row);
                          setError(null);
                          setMessage(null);
                        }}
                      >
                        Recover
                      </Button>
                    ) : (
                      <span className="gg-help">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        title="Recover failed order"
        open={Boolean(recoverTarget)}
        onClose={() => setRecoverTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecoverTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="commerce"
              loading={pending}
              onClick={() => {
                if (!recoverTarget) return;
                startTransition(async () => {
                  const result = await recoverFailedOrder({
                    orderId: recoverTarget.id,
                  });
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setMessage(
                    `Order for ${recoverTarget.memberName} · ₱${recoverTarget.amountPesos.toLocaleString()} reconciled.`,
                  );
                  setRecoverTarget(null);
                  router.refresh();
                });
              }}
            >
              Confirm recover
            </Button>
          </>
        }
      >
        {recoverTarget ? (
          <p>
            Mark order for <strong>{recoverTarget.memberName}</strong> of{" "}
            <strong>₱{recoverTarget.amountPesos.toLocaleString()}</strong> as
            reconciled? This does not charge a card — it only repairs webhook
            state after you confirm payment elsewhere.
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
