import {
  canAccessModule,
  type VendorRole,
} from "@/features/memberships/permissions"

export const maxCartLineQuantity = 20
export const maxCartLines = 40

export const paymentModes = ["cash", "upi", "card"] as const
export type PaymentMode = (typeof paymentModes)[number]

export function isPaymentMode(value: string): value is PaymentMode {
  return paymentModes.includes(value as PaymentMode)
}

export function isValidIdempotencyKey(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

export type CartLineInput = {
  menuItemId: string
  quantity: number
}

export type CreateOrderCommand = {
  customerLabel: string
  idempotencyKey: string
  lines: CartLineInput[]
  note: string
  paymentMode: PaymentMode
  vendorSlug: string
}

export type CreateOrderCommandFailure =
  | "cart"
  | "generic"
  | "payment"
  | "quantity"
  | "role"
  | "workspace"

export type QuantityCartLine = {
  quantity: number
}

export function mergeCartLine<T extends QuantityCartLine>(
  lines: readonly T[],
  nextLine: T,
  getLineId: (line: T) => string
) {
  if (
    !Number.isInteger(nextLine.quantity) ||
    nextLine.quantity < 1
  ) {
    return [...lines]
  }

  const nextQuantity = Math.min(maxCartLineQuantity, nextLine.quantity)
  const existing = lines.find(
    (line) => getLineId(line) === getLineId(nextLine)
  )

  if (existing) {
    return lines.map((line) =>
      getLineId(line) === getLineId(nextLine)
        ? {
            ...line,
            quantity: Math.min(maxCartLineQuantity, line.quantity + nextQuantity),
          }
        : line
    )
  }

  if (lines.length >= maxCartLines) return [...lines]

  return [...lines, { ...nextLine, quantity: nextQuantity }]
}

export function changeCartLineQuantity<T extends QuantityCartLine>(
  lines: readonly T[],
  lineId: string,
  quantity: number,
  getLineId: (line: T) => string
) {
  if (!Number.isInteger(quantity) || quantity < 1) return [...lines]

  return lines.map((line) =>
    getLineId(line) === lineId
      ? { ...line, quantity: Math.min(maxCartLineQuantity, quantity) }
      : line
  )
}

export function removeCartLine<T extends QuantityCartLine>(
  lines: readonly T[],
  lineId: string,
  getLineId: (line: T) => string
) {
  return lines.filter((line) => getLineId(line) !== lineId)
}

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
  idempotencyKey: string
  lines: CartLineInput[]
  note: string
  paymentMode: string
  vendorSlug: string
}): CreateOrderCommandResult {
  if (!canAccessModule(input.actorRole, "order")) {
    return { ok: false, reason: "role" }
  }

  if (input.vendorSlug !== input.actorVendorSlug) {
    return { ok: false, reason: "workspace" }
  }

  if (
    !input.vendorSlug ||
    !isValidIdempotencyKey(input.idempotencyKey)
  ) {
    return { ok: false, reason: "generic" }
  }

  if (
    !Array.isArray(input.lines) ||
    input.lines.length < 1 ||
    input.lines.length > maxCartLines
  ) {
    return { ok: false, reason: "cart" }
  }

  const normalizedLines = input.lines.map((line) => ({
    menuItemId: line.menuItemId.trim(),
    quantity: line.quantity,
  }))

  if (
    normalizedLines.some(
      (line) =>
        !line.menuItemId ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > maxCartLineQuantity
    )
  ) {
    return { ok: false, reason: "quantity" }
  }

  if (
    new Set(normalizedLines.map((line) => line.menuItemId)).size !==
    normalizedLines.length
  ) {
    return { ok: false, reason: "cart" }
  }

  if (!isPaymentMode(input.paymentMode)) {
    return { ok: false, reason: "payment" }
  }

  if (input.customerLabel.trim().length > 80 || input.note.trim().length > 240) {
    return { ok: false, reason: "generic" }
  }

  return {
    command: {
      customerLabel:
        input.customerLabel.trim() || input.defaultCustomerLabel,
      idempotencyKey: input.idempotencyKey,
      lines: normalizedLines,
      note: input.note.trim(),
      paymentMode: input.paymentMode,
      vendorSlug: input.vendorSlug,
    },
    ok: true,
  }
}
