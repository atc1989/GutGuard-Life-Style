import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { listAdminUsers } from "@/lib/actions/admin";
import { AdminUsersFilters } from "@/components/admin/AdminUsersFilters";

type Search = {
  q?: string;
  claimed?: string;
  base?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const claimed =
    params.claimed === "yes" || params.claimed === "no" ? params.claimed : "all";
  const base =
    params.base === "done" || params.base === "open" ? params.base : "all";

  const result = await listAdminUsers({
    q: params.q,
    claimed,
    base,
  });

  return (
    <div className="gg-stack">
      <div>
        <h2 className="gg-heading" style={{ fontSize: 28 }}>
          Users
        </h2>
        <p className="gg-help" style={{ marginTop: 6 }}>
          GEMA unlocked means BASE is complete — same gate as the member app.
        </p>
      </div>

      <AdminUsersFilters q={params.q ?? ""} claimed={claimed} base={base} />

      {!result.ok ? (
        <Alert tone="error">{result.error}</Alert>
      ) : (
        <>
          <p className="gg-help" aria-live="polite">
            {result.rows.length} member{result.rows.length === 1 ? "" : "s"}
          </p>
          {result.rows.length === 0 ? (
            <div className="gg-empty">
              <strong>No members match.</strong>
              <p>Clear filters or try another name / mobile.</p>
            </div>
          ) : (
            <div className="gg-admin-table-wrap">
              <table className="gg-admin-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Mobile</th>
                    <th scope="col">Phase</th>
                    <th scope="col">Claimed</th>
                    <th scope="col">BASE</th>
                    <th scope="col">GEMA</th>
                    <th scope="col">Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>
                        <span className="gg-admin-table__mono">{row.mobile}</span>
                      </td>
                      <td>{row.phase}</td>
                      <td>
                        <Badge active={row.claimed}>
                          {row.claimed ? "Claimed" : "Open"}
                        </Badge>
                      </td>
                      <td>
                        <Badge active={row.baseComplete}>
                          {row.baseComplete ? "Done" : "Open"}
                        </Badge>
                      </td>
                      <td>
                        <Badge active={row.baseComplete}>
                          {row.baseComplete ? "Unlocked" : "Locked"}
                        </Badge>
                      </td>
                      <td>
                        <Link
                          href={`/admin/users/${row.id}`}
                          className="gg-button gg-button--secondary"
                          style={{ minHeight: 44 }}
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
