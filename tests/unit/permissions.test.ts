import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canAccessModule,
  canManageStockItems,
  canMemberAccessModule,
  canRecordStockMovement,
  getAllowedModules,
  getDefaultModuleForRole,
  type VendorRole,
} from "../../src/features/memberships/permissions"

describe("membership permissions", () => {
  it("keeps operational module access role-specific", () => {
    assert.equal(canAccessModule("cashier", "order"), true)
    assert.equal(canAccessModule("cashier", "inventory"), false)
    assert.equal(canAccessModule("kitchen", "kitchen"), true)
    assert.equal(canAccessModule("kitchen", "ledger"), false)
    assert.equal(canAccessModule("accountant", "ledger"), true)
  })

  it("requires an active membership in addition to an allowed role", () => {
    assert.equal(canMemberAccessModule("owner", "active", "control"), true)
    assert.equal(canMemberAccessModule("owner", "invited", "control"), false)
    assert.equal(canMemberAccessModule("owner", "disabled", "control"), false)
  })

  it("limits stock mutations to owner, admin, and manager", () => {
    const managers: VendorRole[] = ["owner", "admin", "manager"]
    const nonManagers: VendorRole[] = ["cashier", "kitchen", "accountant"]

    for (const role of managers) {
      assert.equal(canManageStockItems(role), true)
      assert.equal(canRecordStockMovement(role), true)
    }

    for (const role of nonManagers) {
      assert.equal(canManageStockItems(role), false)
      assert.equal(canRecordStockMovement(role), false)
    }
  })

  it("provides a valid default inside every role's allowed modules", () => {
    const roles: VendorRole[] = [
      "owner",
      "admin",
      "manager",
      "cashier",
      "kitchen",
      "accountant",
    ]

    for (const role of roles) {
      assert.equal(
        getAllowedModules(role).includes(getDefaultModuleForRole(role)),
        true,
        `${role} should be allowed to open its default module`
      )
    }
  })
})

