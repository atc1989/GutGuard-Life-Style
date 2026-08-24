import { Alert } from "@/components/ui/Alert";
import { OrderSearch } from "@/components/admin/OrderSearch";
import { OrderTable } from "@/components/admin/OrderTable";
import { providerLabel } from "@/lib/admin/orders";
import type { OrderDirectoryResult } from "@/lib/admin/orders";

export function OrderDirectory({ directory }: { directory: OrderDirectoryResult }) {
  const countLabel =
    directory.matched === directory.total
      ? `${directory.matched} orders`
      : `${directory.matched} of ${directory.total} orders`;

  return (
    <section className="gg-admin-directory" aria-labelledby="order-directory-heading">
      <div className="gg-admin-pagehead">
        <h1 id="order-directory-heading" className="gg-admin__title">
          Orders
        </h1>
        <p className="gg-admin__lede">
          Track queued bottles. Maya and bank webhooks mark each row pending,
          reconciled, or failed.
        </p>
      </div>
      <div className="gg-admin-directory__head">
        <p className="gg-admin-count" aria-live="polite">
          {countLabel}
          {directory.source === "preview" ? " · preview" : ""}
        </p>
      </div>
      {directory.source === "preview" ? (
        <Alert>
          Preview ledger — these are not live payments. Webhooks never run in the
          browser.
        </Alert>
      ) : null}
      {directory.error ? <Alert tone="error">{directory.error}</Alert> : null}
      {directory.unmatched.length > 0 ? (
        <Alert tone="error">
          {directory.unmatched.length} unmatched webhook
          {directory.unmatched.length === 1 ? "" : "s"} — no queued order for that
          reference. {directory.unmatched[0]?.note} (
          {providerLabel(directory.unmatched[0]!.provider)}{" "}
          {directory.unmatched[0]?.providerEventId})
        </Alert>
      ) : null}
      <OrderSearch query={directory.query} filter={directory.filter} />
      <OrderTable directory={directory} />
    </section>
  );
}
