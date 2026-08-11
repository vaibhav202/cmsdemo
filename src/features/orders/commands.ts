import {
  canAccessModule,
  type VendorRole,
} from "@/features/memberships/permissions"

export type CreateOrderCommand = {
  customerLabel: string
  menuItemId: string
  quantity: number
  vendorId: string
  vendorSlug: string
}

export type CreateOrderCommandFailure =
  | "generic"
  | "quantity"
  | "role"
  | "workspace"

export type CreateOrderCommandResult =
  | {
      command: CreateOrderCommand
      ok: true
    }
  | {
      ok: false
      reason: CreateOrderCommandFailure
    }

export function prepareCreateOrderCommand(input: {
  actorRole: VendorRole
  actorVendorSlug: string
  customerLabel: string
  defaultCustomerLabel: string
  menuItemId: string
  quantity: number
  vendorId: string
  vendorSlug: string
}): CreateOrderCommandResult {
  if (!canAccessModule(input.actorRole, "order")) {
    return { ok: false, reason: "role" }
  }

  if (input.vendorSlug !== input.actorVendorSlug) {
    return { ok: false, reason: "workspace" }
  }

  if (!input.vendorId || !input.vendorSlug || !input.menuItemId) {
    return { ok: false, reason: "generic" }
  }

  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 1 ||
    input.quantity > 20
  ) {
    return { ok: false, reason: "quantity" }
  }

  return {
    command: {
      customerLabel:
        input.customerLabel.trim() || input.defaultCustomerLabel,
      menuItemId: input.menuItemId,
      quantity: input.quantity,
      vendorId: input.vendorId,
      vendorSlug: input.vendorSlug,
    },
    ok: true,
  }
}

