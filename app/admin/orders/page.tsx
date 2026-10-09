import { Alert } from "@/components/ui/Alert";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { listAdminOrders } from "@/lib/actions/admin";
import { orderStatusSchema } from "@/lib/schemas/order";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const parsed = orderStatusSchema.safeParse(params.status);
  const status = parsed.success ? parsed.data : "all";
  const result = await listAdminOrders({ status });

  if (!result.ok) {
    return (
      <div className="gg-stack">
        <h2 className="gg-heading" style={{ fontSize: 28 }}>
          Orders
        </h2>
        <Alert tone="error">{result.error}</Alert>
      </div>
    );
  }

  return (
    <AdminOrdersClient
      rows={result.rows}
      counts={result.counts}
      status={status}
      webhookDown={result.webhookDown}
      lastWebhookError={result.lastWebhookError}
    />
  );
}
