"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { moderateStories } from "@/lib/actions/stories";
import {
  storyBlurb,
  storyStatusLabel,
  type StoryDirectoryResult,
} from "@/lib/admin/stories";
import { STORY_FILTERS, type StoryFilter } from "@/lib/schemas/stories";
import { Alert } from "@/components/ui/Alert";
import { cx } from "@/lib/cx";

const FILTER_LABELS: Record<StoryFilter, string> = {
  pending: "Pending",
  approved: "Approved",
  flagged: "Flagged",
  all: "All",
};

function href(query: string, filter: StoryFilter) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filter !== "pending") params.set("filter", filter);
  const encoded = params.toString();
  return encoded ? `/admin/stories?${encoded}` : "/admin/stories";
}

export function ModerationQueue({
  directory,
}: {
  directory: StoryDirectoryResult;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const ids = useMemo(() => directory.rows.map((row) => row.id), [directory.rows]);
  const allOn = ids.length > 0 && ids.every((id) => selected.includes(id));
  const none = selected.length === 0;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAll() {
    setSelected(allOn ? [] : ids);
  }

  async function run(action: "approved" | "flagged") {
    if (none) return;
    setBusy(true);
    const result = await moderateStories({ ids: selected, action });
    setBusy(false);
    if (!result.ok) {
      setNote(result.error);
      return;
    }
    const verb = action === "approved" ? "approved" : "flagged";
    setNote(
      result.preview
        ? `Preview: ${result.count} ${result.count === 1 ? "story" : "stories"} would be ${verb}. Connect Supabase to persist.`
        : `${result.count} ${result.count === 1 ? "story" : "stories"} ${verb}.`,
    );
    setSelected([]);
    router.refresh();
  }

  const countLabel =
    directory.matched === directory.total
      ? `${directory.matched} stories`
      : `${directory.matched} of ${directory.total} stories`;

  return (
    <section className="gg-admin-directory" aria-labelledby="story-queue-heading">
      <div className="gg-admin-pagehead">
        <h1 id="story-queue-heading" className="gg-admin__title">
          Stories
        </h1>
        <p className="gg-admin__lede">
          Review community stories before they appear on My Story. Approve the
          clear ones; flag anything that should stay off the feed.
        </p>
      </div>
      <div className="gg-admin-directory__head">
        <p className="gg-admin-count" aria-live="polite">
          {directory.pendingCount} pending · {countLabel}
          {directory.source === "preview" ? " · preview" : ""}
        </p>
      </div>
      {directory.source === "preview" ? (
        <Alert>
          Preview queue — decisions are not saved until Supabase is connected.
        </Alert>
      ) : null}
      {directory.error ? <Alert tone="error">{directory.error}</Alert> : null}

      <div className="gg-admin-toolbar">
        <form className="gg-admin-search" method="get" action="/admin/stories" role="search">
          {directory.filter !== "pending" ? (
            <input type="hidden" name="filter" value={directory.filter} />
          ) : null}
          <div className="gg-admin-search__row">
            <label className="gg-field" htmlFor="story-q">
              <span className="gg-field__label">Search stories</span>
              <input
                id="story-q"
                name="q"
                type="search"
                defaultValue={directory.query}
                className="gg-field__control"
                placeholder="Name, mobile, or outcome"
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
        <div className="gg-admin-filters" role="group" aria-label="Filter stories">
          {STORY_FILTERS.map((id) => (
            <Link
              key={id}
              href={href(directory.query, id)}
              className={cx("gg-admin-chip", directory.filter === id && "is-active")}
              aria-current={directory.filter === id ? "true" : undefined}
            >
              {FILTER_LABELS[id]}
            </Link>
          ))}
        </div>
      </div>

      {directory.rows.length === 0 ? (
        <div className="gg-empty gg-empty--admin">
          <strong>Queue is clear</strong>
          <p>
            {directory.total === 0
              ? "When members share a story, it waits here until you approve or flag it."
              : "Nothing in this filter. Try Pending or All."}
          </p>
        </div>
      ) : (
        <>
          <div className="gg-table-wrap">
            <table className="gg-table">
              <caption className="gg-vh">Story moderation queue</caption>
              <thead>
                <tr>
                  <th scope="col" className="gg-check-cell">
                    <label className="gg-check-hit">
                      <span className="gg-vh">Select all visible</span>
                      <input
                        type="checkbox"
                        checked={allOn}
                        onChange={toggleAll}
                      />
                    </label>
                  </th>
                  <th scope="col">Member</th>
                  <th scope="col">Story</th>
                  <th scope="col">State</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {directory.rows.map((row) => {
                  const on = selected.includes(row.id);
                  return (
                    <tr key={row.id} className={cx(on && "is-selected")}>
                      <td className="gg-check-cell">
                        <label className="gg-check-hit">
                          <span className="gg-vh">Select {row.memberName}</span>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(row.id)}
                          />
                        </label>
                      </td>
                      <th scope="row">
                        <span className="gg-table__name">{row.memberName}</span>
                        <span className="gg-table__meta">{row.mobile}</span>
                      </th>
                      <td className="gg-table__wrap">{storyBlurb(row)}</td>
                      <td>
                        <span
                          className={cx(
                            "gg-status",
                            row.status === "approved" && "gg-status--open",
                            row.status === "pending" && "gg-status--pending",
                            row.status === "flagged" && "gg-status--failed",
                          )}
                        >
                          {storyStatusLabel(row.status)}
                        </span>
                      </td>
                      <td>
                        <div className="gg-row-actions">
                          <button
                            type="button"
                            className="gg-button gg-button--primary gg-button--compact"
                            disabled={busy}
                            onClick={() => {
                              setSelected([row.id]);
                              void (async () => {
                                setBusy(true);
                                const result = await moderateStories({
                                  ids: [row.id],
                                  action: "approved",
                                });
                                setBusy(false);
                                if (!result.ok) {
                                  setNote(result.error);
                                  return;
                                }
                                setNote(
                                  result.preview
                                    ? "Preview: this story would be approved."
                                    : "Story approved.",
                                );
                                setSelected([]);
                                router.refresh();
                              })();
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="gg-button gg-button--secondary gg-button--compact"
                            disabled={busy}
                            onClick={() => {
                              void (async () => {
                                setBusy(true);
                                const result = await moderateStories({
                                  ids: [row.id],
                                  action: "flagged",
                                });
                                setBusy(false);
                                if (!result.ok) {
                                  setNote(result.error);
                                  return;
                                }
                                setNote(
                                  result.preview
                                    ? "Preview: this story would be flagged."
                                    : "Story flagged.",
                                );
                                setSelected((current) =>
                                  current.filter((id) => id !== row.id),
                                );
                                router.refresh();
                              })();
                            }}
                          >
                            Flag
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="gg-admin-bulk" role="group" aria-label="Bulk moderation">
            <button
              type="button"
              className="gg-button gg-button--primary"
              disabled={none || busy}
              onClick={() => void run("approved")}
            >
              Approve selected
            </button>
            <button
              type="button"
              className="gg-button gg-button--secondary"
              disabled={none || busy}
              onClick={() => void run("flagged")}
            >
              Flag selected
            </button>
            <p className="gg-live" aria-live="polite">
              {note || (none ? "Select rows for a bulk action." : `${selected.length} selected`)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
