import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  calculateStockMovement,
  maximumInventoryQuantity,
  parseInventoryQuantity,
} from "../../src/features/inventory/calculations"

describe("inventory calculations", () => {
  it("parses bounded quantities at three-decimal precision", () => {
    assert.equal(parseInventoryQuantity("2.3456"), 2.346)
    assert.equal(parseInventoryQuantity(0), 0)
    assert.equal(parseInventoryQuantity(String(maximumInventoryQuantity)), 1_000_000)
  })

  it("rejects missing, negative, non-finite, and oversized values", () => {
    assert.equal(parseInventoryQuantity(null), null)
    assert.equal(parseInventoryQuantity(""), null)
    assert.equal(parseInventoryQuantity("-0.1"), null)
    assert.equal(parseInventoryQuantity("not-a-number"), null)
    assert.equal(parseInventoryQuantity(Infinity), null)
    assert.equal(parseInventoryQuantity(maximumInventoryQuantity + 1), null)
  })

  it("calculates stock in and stock out without floating-point drift", () => {
    assert.deepEqual(calculateStockMovement(1.2, "in", 0.105), {
      nextQuantity: 1.305,
      ok: true,
      quantityDelta: 0.105,
    })
    assert.deepEqual(calculateStockMovement(1.2, "out", 0.1), {
      nextQuantity: 1.1,
      ok: true,
      quantityDelta: -0.1,
    })
  })

  it("distinguishes invalid input from insufficient stock", () => {
    assert.deepEqual(calculateStockMovement(1, "out", 1.001), {
      ok: false,
      reason: "insufficient",
    })
    assert.deepEqual(calculateStockMovement(1, "in", 0), {
      ok: false,
      reason: "invalid",
    })
  })
})

