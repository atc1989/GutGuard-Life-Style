import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { getAdminUserDetail } from "@/lib/actions/admin";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminUserDetail(id);

  if (!result.ok) {
    return (
      <div className="gg-stack">
        <Link href="/admin/users" className="gg-link gg-link--row">
          ← Users
        </Link>
        <Alert tone="error">{result.error}</Alert>
      </div>
    );
  }

  const user = result.user;

  return (
    <div className="gg-stack">
      <Link href="/admin/users" className="gg-link gg-link--row">
        ← Users
      </Link>
      <div>
        <p className="gg-eyebrow">Read-only audit</p>
        <h2 className="gg-heading" style={{ fontSize: 32, marginTop: 8 }}>
          {user.name}
        </h2>
        <p className="gg-help" style={{ marginTop: 6 }}>
          No privilege changes on this screen.
        </p>
      </div>

      <dl className="gg-admin-dl">
        <div>
          <dt>Mobile</dt>
          <dd className="gg-admin-table__mono">{user.mobile}</dd>
        </div>
        <div>
          <dt>Phase</dt>
          <dd>{user.phase}</dd>
        </div>
        <div>
          <dt>Claimed</dt>
          <dd>
            <Badge active={user.claimed}>
              {user.claimed ? "Claimed" : "Open"}
            </Badge>
          </dd>
        </div>
        <div>
          <dt>Points</dt>
          <dd>
            {user.points} · {user.pending} pending · {user.banked} banked
          </dd>
        </div>
        <div>
          <dt>Supply</dt>
          <dd>
            {user.daysLeft} days · {user.capsulesPerDay} capsules/day
          </dd>
        </div>
        <div>
          <dt>GEMA</dt>
          <dd>
            <Badge active={user.baseComplete}>
              {user.baseComplete ? "Unlocked" : "Locked"}
            </Badge>
          </dd>
        </div>
      </dl>

      <div>
        <p className="gg-eyebrow">BASE steps 0–4</p>
        <ul className="gg-admin-base-list">
          {user.baseSteps.map((step) => (
            <li key={step.index}>
              <Badge active={step.done}>{step.done ? "Done" : "Open"}</Badge>
              <span>
                {step.index}. {step.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
