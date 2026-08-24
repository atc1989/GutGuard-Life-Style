import { OrderDirectory } from "@/components/admin/OrderDirectory";
import { loadOrderDirectory } from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const directory = await loadOrderDirectory(params);
  return <OrderDirectory directory={directory} />;
}
