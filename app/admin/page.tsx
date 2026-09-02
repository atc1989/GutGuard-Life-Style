import Link from "next/link";

const MODULES = [
  {
    href: "/admin/users",
    title: "Users",
    copy: "Search members, claimed cards, BASE and GEMA unlock.",
  },
  {
    href: "/admin/orders",
    title: "Orders",
    copy: "Refill pacing and Maya webhook reconcile.",
  },
  {
    href: "/admin/stories",
    title: "Stories",
    copy: "Approve or reject Stories of Hope for the feed.",
  },
] as const;

export default function AdminHomePage() {
  return (
    <div className="gg-stack">
      <p className="gg-lede">Pick a queue. Every action re-checks admin on the server.</p>
      <div className="gg-admin__modules">
        {MODULES.map((module) => (
          <Link key={module.href} href={module.href} className="gg-admin__module">
            <p className="gg-eyebrow">{module.title}</p>
            <p style={{ marginTop: 8 }}>{module.copy}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
