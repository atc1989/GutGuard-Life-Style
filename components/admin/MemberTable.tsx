import {
  formatRegisteredAt,
  gemaLabel,
  registrationLabel,
  type MemberDirectoryResult,
} from "@/lib/admin/search";
import { cx } from "@/lib/cx";

export function MemberTable({ directory }: { directory: MemberDirectoryResult }) {
  if (directory.rows.length === 0) {
    return (
      <div className="gg-empty gg-empty--admin">
        <strong>
          {directory.total === 0 ? "No members yet" : "No members match"}
        </strong>
        <p>
          {directory.total === 0
            ? "When people register, they will appear in this table."
            : "Clear the search or pick another filter to see more rows."}
        </p>
      </div>
    );
  }

  return (
    <div className="gg-table-wrap">
      <table className="gg-table">
        <caption className="gg-vh">
          Member profiles, registration, mobile credentials, and BASE or GEMA
          unlock status.
        </caption>
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Mobile</th>
            <th scope="col">Registration</th>
            <th scope="col">BASE</th>
            <th scope="col">GEMA</th>
            <th scope="col">Role</th>
            <th scope="col">Joined</th>
          </tr>
        </thead>
        <tbody>
          {directory.rows.map((row) => {
            const unlocked = row.gemaUnlocked;
            return (
              <tr key={row.id}>
                <th scope="row">
                  <span className="gg-table__name">{row.name}</span>
                  <span className="gg-table__meta">{row.cardNo}</span>
                </th>
                <td>
                  <span className="gg-table__mono">{row.mobile}</span>
                </td>
                <td>{registrationLabel(row.phase, row.claimed)}</td>
                <td>
                  <span className="gg-table__mono">
                    {row.baseDone} / {row.baseTotal}
                  </span>
                </td>
                <td>
                  <span
                    className={cx(
                      "gg-status",
                      unlocked ? "gg-status--open" : "gg-status--locked",
                    )}
                  >
                    {gemaLabel(unlocked)}
                  </span>
                </td>
                <td>
                  <span
                    className={cx(
                      "gg-status",
                      row.role === "admin" && "gg-status--admin",
                    )}
                  >
                    {row.role === "admin" ? "Admin" : "Member"}
                  </span>
                </td>
                <td>{formatRegisteredAt(row.registeredAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
