"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export function AdminUsersFilters({
  q,
  claimed,
  base,
}: {
  q: string;
  claimed: "all" | "yes" | "no";
  base: "all" | "done" | "open";
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [claimedFilter, setClaimed] = useState(claimed);
  const [baseFilter, setBase] = useState(base);

  function apply(next?: {
    q?: string;
    claimed?: typeof claimedFilter;
    base?: typeof baseFilter;
  }) {
    const params = new URLSearchParams();
    const nextQ = (next?.q ?? query).trim();
    const nextClaimed = next?.claimed ?? claimedFilter;
    const nextBase = next?.base ?? baseFilter;
    if (nextQ) params.set("q", nextQ);
    if (nextClaimed !== "all") params.set("claimed", nextClaimed);
    if (nextBase !== "all") params.set("base", nextBase);
    const qs = params.toString();
    router.push(qs ? `/admin/users?${qs}` : "/admin/users");
  }

  return (
    <form
      className="gg-admin-filters"
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <FormField
        label="Search name or mobile"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Maria or 09…"
        hint="Search does not use member IDs."
      />
      <div className="gg-admin-filters__row">
        <label className="gg-field">
          <span className="gg-field__label">Claimed</span>
          <select
            className="gg-field__control"
            value={claimedFilter}
            onChange={(event) => {
              const value = event.target.value as typeof claimedFilter;
              setClaimed(value);
              apply({ claimed: value });
            }}
          >
            <option value="all">All</option>
            <option value="yes">Claimed</option>
            <option value="no">Not claimed</option>
          </select>
        </label>
        <label className="gg-field">
          <span className="gg-field__label">BASE / GEMA</span>
          <select
            className="gg-field__control"
            value={baseFilter}
            onChange={(event) => {
              const value = event.target.value as typeof baseFilter;
              setBase(value);
              apply({ base: value });
            }}
          >
            <option value="all">All</option>
            <option value="done">BASE done · GEMA unlocked</option>
            <option value="open">BASE open · GEMA locked</option>
          </select>
        </label>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </div>
    </form>
  );
}
