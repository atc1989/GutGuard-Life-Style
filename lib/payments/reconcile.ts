import type { OrderStatus, PaymentSignal } from "./envelope";

export type ReconcileDecision = {
  nextStatus: OrderStatus;
  reason: string | null;
  matched: boolean;
};

export function nextOrderStatus(
  current: OrderStatus,
  signal: PaymentSignal,
): OrderStatus {
  if (current === "reconciled") return "reconciled";
  if (signal === "success") return "reconciled";
  if (signal === "failure") return "failed";
  return current;
}

export function decideReconciliation(input: {
  current: OrderStatus;
  signal: PaymentSignal;
  expectedCentavos: number;
  incomingCentavos: number | null;
}): ReconcileDecision {
  if (!input.incomingCentavos || input.incomingCentavos !== input.expectedCentavos) {
    if (input.signal === "success") {
      return {
        nextStatus: input.current === "reconciled" ? "reconciled" : "failed",
        reason: "Amount does not match the queued order.",
        matched: true,
      };
    }
  }

  const nextStatus = nextOrderStatus(input.current, input.signal);
  if (input.signal === "success" && nextStatus === "reconciled") {
    return { nextStatus, reason: null, matched: true };
  }
  if (input.signal === "failure") {
    return {
      nextStatus,
      reason: "Provider reported a failed, expired, or cancelled payment.",
      matched: true,
    };
  }
  return {
    nextStatus,
    reason: "Provider has not finished this payment yet.",
    matched: true,
  };
}

export function pesosLabel(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
