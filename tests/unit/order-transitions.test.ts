import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canTransitionOrder,
  getNextOrderStatus,
  isOrderStatus,
} from "../../src/features/orders/transitions"

describe("order transitions", () => {
  it("follows the paid to preparing to ready to completed workflow", () => {
    assert.equal(getNextOrderStatus("paid"), "preparing")
    assert.equal(getNextOrderStatus("preparing"), "ready")
    assert.equal(getNextOrderStatus("ready"), "completed")
  })

  it("does not transition terminal or unknown states", () => {
    assert.equal(getNextOrderStatus("completed"), undefined)
    assert.equal(getNextOrderStatus("cancelled"), undefined)
    assert.equal(getNextOrderStatus("refunded"), undefined)
  })

  it("rejects skipped and backwards transitions", () => {
    assert.equal(canTransitionOrder("paid", "ready"), false)
    assert.equal(canTransitionOrder("ready", "preparing"), false)
    assert.equal(canTransitionOrder("preparing", "ready"), true)
  })

  it("recognizes only canonical order statuses", () => {
    assert.equal(isOrderStatus("paid"), true)
    assert.equal(isOrderStatus("cancelled"), true)
    assert.equal(isOrderStatus("PAID"), false)
  })
})

