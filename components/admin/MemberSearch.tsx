import Link from "next/link";
import { Search } from "lucide-react";
import { MEMBER_FILTERS, type MemberFilter } from "@/lib/schemas/admin";
import { cx } from "@/lib/cx";

const FILTER_LABELS: Record<MemberFilter, string> = {
  all: "All",
  invited: "Registered",
  claimed: "Claimed",
  active: "Active",
  base: "BASE done",
  gema: "GEMA open",
  admin: "Admins",
};

function usersHref(query: string, filter: MemberFilter) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filter !== "all") params.set("filter", filter);
  const encoded = params.toString();
  return encoded ? `/admin/users?${encoded}` : "/admin/users";
}

export function MemberSearch({
  query,
  filter,
}: {
  query: string;
  filter: MemberFilter;
}) {
  return (
    <div className="gg-admin-toolbar">
      <form
        className="gg-admin-search"
        method="get"
        action="/admin/users"
        role="search"
      >
        {filter !== "all" ? (
          <input type="hidden" name="filter" value={filter} />
        ) : null}
        <div className="gg-admin-search__row">
          <label className="gg-field" htmlFor="member-q">
            <span className="gg-field__label">Search members</span>
            <input
              id="member-q"
              name="q"
              type="search"
              defaultValue={query}
              className="gg-field__control"
              placeholder="Name, mobile, or card number"
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
      <div className="gg-admin-filters" role="group" aria-label="Filter members">
        {MEMBER_FILTERS.map((id) => (
          <Link
            key={id}
            href={usersHref(query, id)}
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
