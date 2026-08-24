import { Alert } from "@/components/ui/Alert";
import { MemberSearch } from "@/components/admin/MemberSearch";
import { MemberTable } from "@/components/admin/MemberTable";
import type { MemberDirectoryResult } from "@/lib/admin/search";

export function MemberDirectory({
  directory,
}: {
  directory: MemberDirectoryResult;
}) {
  const countLabel =
    directory.matched === directory.total
      ? `${directory.matched} members`
      : `${directory.matched} of ${directory.total} members`;

  return (
    <section className="gg-admin-directory" aria-labelledby="member-directory-heading">
      <div className="gg-admin-directory__head">
        <h2 id="member-directory-heading" className="gg-vh">
          Users
        </h2>
        <p className="gg-admin-count" aria-live="polite">
          {countLabel}
          {directory.source === "preview" ? " · preview" : ""}
        </p>
      </div>
      {directory.source === "preview" ? (
        <Alert>
          Preview directory — these are not live members. Connect Supabase to
          audit real cards.
        </Alert>
      ) : null}
      {directory.error ? <Alert tone="error">{directory.error}</Alert> : null}
      <MemberSearch query={directory.query} filter={directory.filter} />
      <MemberTable directory={directory} />
    </section>
  );
}
