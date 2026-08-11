import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { findWorkspaceAccount } from "../../src/features/auth/demo-session"
import { prepareCreateOrderCommand } from "../../src/features/orders/commands"

function prepareForAccount(
  email: string,
  password: string,
  overrides: Partial<Parameters<typeof prepareCreateOrderCommand>[0]> = {}
) {
  const account = findWorkspaceAccount(email, password)
  assert.ok(account, "the integration fixture account should exist")

  return prepareCreateOrderCommand({
    actorRole: account.role,
    actorVendorSlug: "city-canteen",
    customerLabel: " Counter 4 ",
    defaultCustomerLabel: "Counter customer",
    menuItemId: "menu-item-1",
    quantity: 2,
    vendorId: "vendor-1",
    vendorSlug: "city-canteen",
    ...overrides,
  })
}

describe("order action boundary", () => {
  it("normalizes a cashier's valid counter-order command", () => {
    const result = prepareForAccount(
      "cashier@citycanteen.in",
      "Cashier@2026"
    )

    assert.deepEqual(result, {
      command: {
        customerLabel: "Counter 4",
        menuItemId: "menu-item-1",
        quantity: 2,
        vendorId: "vendor-1",
        vendorSlug: "city-canteen",
      },
      ok: true,
    })
  })

  it("rejects a cross-workspace order before database access", () => {
    const result = prepareForAccount(
      "owner@citycanteen.in",
      "Owner@2026",
      { vendorSlug: "another-vendor" }
    )

    assert.deepEqual(result, { ok: false, reason: "workspace" })
  })

  it("rejects a role without order access", () => {
    const result = prepareForAccount(
      "kitchen@citycanteen.in",
      "Kitchen@2026"
    )

    assert.deepEqual(result, { ok: false, reason: "role" })
  })

  it("rejects an out-of-range quantity", () => {
    const result = prepareForAccount(
      "cashier@citycanteen.in",
      "Cashier@2026",
      { quantity: 21 }
    )

    assert.deepEqual(result, { ok: false, reason: "quantity" })
  })
})

