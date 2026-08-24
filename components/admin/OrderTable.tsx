import {
  formatOrderAmount,
  providerLabel,
  statusLabel,
  type OrderDirectoryResult,
} from "@/lib/admin/orders";
import { cx } from "@/lib/cx";

export function OrderTable({ directory }: { directory: OrderDirectoryResult }) {
  if (directory.rows.length === 0) {
    return (
      <div className="gg-empty gg-empty--admin">
        <strong>{directory.total === 0 ? "No orders yet" : "No orders match"}</strong>
        <p>
          {directory.total === 0
            ? "Queued bottles appear here until Maya or the bank confirms them."
            : "Clear the search or pick another state to see more rows."}
        </p>
      </div>
    );
  }

  return (
    <div className="gg-table-wrap">
      <table className="gg-table">
        <caption className="gg-vh">
          Order tracking: pending, reconciled, or failed.
        </caption>
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Reference</th>
            <th scope="col">Qty</th>
            <th scope="col">Amount</th>
            <th scope="col">Provider</th>
            <th scope="col">State</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          {directory.rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <span className="gg-table__name">{row.memberName}</span>
                <span className="gg-table__meta">{row.mobile}</span>
              </th>
              <td>
                <span className="gg-table__mono">{row.reference}</span>
              </td>
              <td>{row.quantity}</td>
              <td>
                <span className="gg-table__mono">{formatOrderAmount(row)}</span>
              </td>
              <td>{providerLabel(row.provider)}</td>
              <td>
                <span
                  className={cx(
                    "gg-status",
                    row.status === "reconciled" && "gg-status--open",
                    row.status === "pending" && "gg-status--pending",
                    row.status === "failed" && "gg-status--failed",
                  )}
                >
                  {statusLabel(row.status)}
                </span>
              </td>
              <td className="gg-table__wrap">
                {row.failureReason || (row.status === "pending" ? "Waiting on webhook" : "—")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
