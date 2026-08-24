import assert from "node:assert/strict";
import test from "node:test";
import { MOCK_ORDERS } from "./mock-orders.ts";
import { filterOrders, orderAmount, statusLabel } from "./orders.ts";
import { parseOrderDirectoryQuery } from "../schemas/orders.ts";

test("order query falls back instead of throwing", () => {
  assert.deepEqual(parseOrderDirectoryQuery({ filter: "nope" }), {
    q: "",
    filter: "all",
  });
});

test("filters isolate pending and failed orders", () => {
  const pending = filterOrders(MOCK_ORDERS, "", "pending");
  assert.ok(pending.every((row) => row.status === "pending"));
  const failed = filterOrders(MOCK_ORDERS, "Boy", "failed");
  assert.equal(failed.length, 1);
  assert.equal(failed[0]?.memberName, "Boy Tapang");
});

test("queued amount is ₱4,500 per bottle in centavos", () => {
  assert.equal(orderAmount(1), 450000);
  assert.equal(orderAmount(2), 900000);
  assert.equal(statusLabel("reconciled"), "Reconciled");
});
