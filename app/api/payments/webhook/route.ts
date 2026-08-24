import { processPaymentWebhook } from "@/lib/payments/process";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const result = await processPaymentWebhook(rawBody, request.headers);
  return Response.json(result.body, { status: result.status });
}
