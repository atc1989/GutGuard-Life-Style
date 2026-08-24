import { MemberDirectory } from "@/components/admin/MemberDirectory";
import { loadMemberDirectory } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const directory = await loadMemberDirectory(params);
  return <MemberDirectory directory={directory} />;
}
