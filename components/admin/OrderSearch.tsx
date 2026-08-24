import Link from "next/link";
import { Search } from "lucide-react";
import { ORDER_FILTERS, type OrderFilter } from "@/lib/schemas/orders";
import { cx } from "@/lib/cx";

const FILTER_LABELS: Record<OrderFilter, string> = {
  all: "All",
  pending: "Pending",
  reconciled: "Reconciled",
  failed: "Failed",
};

function href(query: string, filter: OrderFilter) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filter !== "all") params.set("filter", filter);
  const encoded = params.toString();
  return encoded ? `/admin/orders?${encoded}` : "/admin/orders";
}

export function OrderSearch({
  query,
  filter,
}: {
  query: string;
  filter: OrderFilter;
}) {
  return (
    <div className="gg-admin-toolbar">
      <form className="gg-admin-search" method="get" action="/admin/orders" role="search">
        {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
        <div className="gg-admin-search__row">
          <label className="gg-field" htmlFor="order-q">
            <span className="gg-field__label">Search orders</span>
            <input
              id="order-q"
              name="q"
              type="search"
              defaultValue={query}
              className="gg-field__control"
              placeholder="Name, mobile, or reference"
              autoComplete="off"
              maxLength={80}
            />
          </label>
          <button type="submit" className="gg-button gg-button--primary">
            <Search size={18} strokeWidth={1.75} aria-hidden="true" />
            Search
          </button>
        </div>
      </form>
      <div className="gg-admin-filters" role="group" aria-label="Filter orders">
        {ORDER_FILTERS.map((id) => (
          <Link
            key={id}
            href={href(query, id)}
            className={cx("gg-admin-chip", filter === id && "is-active")}
            aria-current={filter === id ? "true" : undefined}
          >
            {FILTER_LABELS[id]}
          </Link>
        ))}
      </div>
    </div>
  );
}
