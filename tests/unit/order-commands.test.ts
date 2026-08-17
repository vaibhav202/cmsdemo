import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  changeCartLineQuantity,
  isPaymentMode,
  isValidIdempotencyKey,
  maxCartLineQuantity,
  maxCartLines,
  mergeCartLine,
  prepareCreateOrderCommand,
  removeCartLine,
} from "../../src/features/orders/commands"

type TestLine = {
  menuItemId: string
  quantity: number
}

const getLineId = (line: TestLine) => line.menuItemId

function validInput(
  overrides: Partial<Parameters<typeof prepareCreateOrderCommand>[0]> = {}
) {
  return {
    actorRole: "cashier" as const,
    actorVendorSlug: "city-canteen",
    customerLabel: "Counter 4",
    defaultCustomerLabel: "Counter customer",
    idempotencyKey: "00000000-0000-4000-8000-000000000001",
    lines: [{ menuItemId: "menu-item-1", quantity: 1 }],
    note: "",
    paymentMode: "cash",
    vendorSlug: "city-canteen",
    ...overrides,
  }
}

describe("order cart rules", () => {
  it("merges duplicate menu items into one line", () => {
    const lines = mergeCartLine(
      [{ menuItemId: "meal", quantity: 2 }],
      { menuItemId: "meal", quantity: 3 },
      getLineId
    )

    assert.deepEqual(lines, [{ menuItemId: "meal", quantity: 5 }])
  })

  it("caps a line quantity and refuses a cart over the line limit", () => {
    const capped = mergeCartLine(
      [{ menuItemId: "meal", quantity: maxCartLineQuantity - 1 }],
      { menuItemId: "meal", quantity: 4 },
      getLineId
    )
    const fullCart = Array.from({ length: maxCartLines }, (_, index) => ({
      menuItemId: `item-${index}`,
      quantity: 1,
    }))

    assert.deepEqual(capped, [
      { menuItemId: "meal", quantity: maxCartLineQuantity },
    ])
    assert.deepEqual(
      mergeCartLine(fullCart, { menuItemId: "extra", quantity: 1 }, getLineId),
      fullCart
    )
    assert.deepEqual(
      changeCartLineQuantity(
        [{ menuItemId: "meal", quantity: 1 }],
        "meal",
        maxCartLineQuantity + 10,
        getLineId
      ),
      [{ menuItemId: "meal", quantity: maxCartLineQuantity }]
    )
  })

  it("changes and removes only the requested line", () => {
    const lines: TestLine[] = [
      { menuItemId: "meal", quantity: 1 },
      { menuItemId: "drink", quantity: 2 },
    ]

    assert.deepEqual(
      changeCartLineQuantity(lines, "drink", 4, getLineId),
      [
        { menuItemId: "meal", quantity: 1 },
        { menuItemId: "drink", quantity: 4 },
      ]
    )
    assert.deepEqual(removeCartLine(lines, "meal", getLineId), [
      { menuItemId: "drink", quantity: 2 },
    ])
  })

  it("rejects duplicate lines at checkout instead of trusting the cart UI", () => {
    const result = prepareCreateOrderCommand(
      validInput({
        lines: [
          { menuItemId: "meal", quantity: 1 },
          { menuItemId: "meal", quantity: 2 },
        ],
      })
    )

    assert.deepEqual(result, { ok: false, reason: "cart" })
  })

  it("accepts only supported payment modes", () => {
    assert.equal(isPaymentMode("cash"), true)
    assert.equal(isPaymentMode("upi"), true)
    assert.equal(isPaymentMode("card"), true)
    assert.equal(isPaymentMode("pending"), false)
    assert.deepEqual(
      prepareCreateOrderCommand(validInput({ paymentMode: "pending" })),
      { ok: false, reason: "payment" }
    )
  })

  it("requires a UUID idempotency key for a normalized command", () => {
    const key = "00000000-0000-4000-8000-000000000001"

    assert.equal(isValidIdempotencyKey(key), true)
    assert.equal(isValidIdempotencyKey("retry-me"), false)
    assert.deepEqual(
      prepareCreateOrderCommand(validInput({ idempotencyKey: "retry-me" })),
      { ok: false, reason: "generic" }
    )
  })
})
