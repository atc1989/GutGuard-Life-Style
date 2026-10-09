"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { moderateStories, type AdminStoryRow } from "@/lib/actions/admin";
import type { StoryStatus } from "@/lib/schemas/story-moderate";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormField } from "@/components/ui/FormField";

const FILTERS: { id: StoryStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

export function AdminStoriesClient({
  rows,
  counts,
  status,
}: {
  rows: AdminStoryRow[];
  counts: Record<StoryStatus, number>;
  status: StoryStatus | "all";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;

  function setFilter(next: StoryStatus | "all") {
    const params = new URLSearchParams();
    if (next !== "pending") params.set("status", next);
    const qs = params.toString();
    router.push(qs ? `/admin/stories?${qs}` : "/admin/stories");
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function runModerate(action: "approve" | "reject", ids: string[]) {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await moderateStories({
        ids,
        action,
        reason: action === "reject" ? reason : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        if (result.failedIds.length) setSelected(result.failedIds);
        return;
      }
      setMessage(
        `${result.count} ${result.count === 1 ? "story" : "stories"} ${
          action === "approve" ? "approved" : "rejected"
        }.`,
      );
      setSelected(result.failedIds);
      setRejectOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="gg-stack">
      <div>
        <h2 className="gg-heading" style={{ fontSize: 28 }}>
          Stories
        </h2>
        <p className="gg-help" style={{ marginTop: 6 }}>
          Pending stories stay off the member feed until approved.
        </p>
      </div>

      <div className="gg-admin-chips" role="tablist" aria-label="Story status">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className="gg-admin-chip"
            role="tab"
            aria-selected={status === filter.id}
            onClick={() => setFilter(filter.id)}
          >
            {filter.label}
            {filter.id !== "all" ? ` (${counts[filter.id]})` : ""}
          </button>
        ))}
      </div>

      <div className="gg-admin-toolbar">
        <label className="gg-admin-check">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() =>
              setSelected(allSelected ? [] : allIds)
            }
            aria-label="Select all stories on this page"
          />
          Select all
        </label>
        <Button
          variant="commerce"
          disabled={!selected.length || pending}
          aria-busy={pending}
          onClick={() => runModerate("approve", selected)}
        >
          Approve
        </Button>
        <Button
          variant="secondary"
          disabled={!selected.length || pending}
          aria-busy={pending}
          onClick={() => setRejectOpen(true)}
        >
          Reject
        </Button>
      </div>

      <p className="gg-help" aria-live="polite">
        {message ?? `${selected.length} selected`}
      </p>
      {error ? <Alert tone="error">{error}</Alert> : null}

      {rows.length === 0 ? (
        <div className="gg-empty">
          <strong>Queue is empty.</strong>
          <p>No stories in this filter.</p>
        </div>
      ) : (
        <div className="gg-admin-table-wrap">
          <table className="gg-admin-table">
            <thead>
              <tr>
                <th scope="col">Select</th>
                <th scope="col">Member</th>
                <th scope="col">Story</th>
                <th scope="col">Status</th>
                <th scope="col">Row</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <label className="gg-admin-check">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggle(row.id)}
                        aria-label={`Select story by ${row.memberName}`}
                      />
                    </label>
                  </td>
                  <td>{row.memberName}</td>
                  <td>
                    <p>
                      {row.about === "self" ? "Own story" : row.relationship || "Someone"}
                    </p>
                    <p className="gg-help">
                      {row.days} days · {row.capsules} capsules
                    </p>
                    <p style={{ marginTop: 6 }}>{row.outcomes.join(", ") || "—"}</p>
                    {row.rejectReason ? (
                      <p className="gg-help">Reject: {row.rejectReason}</p>
                    ) : null}
                  </td>
                  <td>
                    <Badge active={row.status === "approved"}>{row.status}</Badge>
                  </td>
                  <td>
                    <div className="gg-admin-row-actions">
                      <Button
                        variant="commerce"
                        disabled={pending}
                        onClick={() => runModerate("approve", [row.id])}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={pending}
                        onClick={() => {
                          setSelected([row.id]);
                          setRejectOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        title="Reject stories"
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="commerce"
              loading={pending}
              onClick={() => runModerate("reject", selected)}
            >
              Confirm reject
            </Button>
          </>
        }
      >
        <FormField
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          hint="Shown to operators. Keep it short."
        />
      </Dialog>
    </div>
  );
}
