import type { StockMovementType } from "@/features/inventory/config"

export const maximumInventoryQuantity = 1_000_000

const inventoryPrecision = 1000

function roundInventoryQuantity(value: number) {
  return Math.round(value * inventoryPrecision) / inventoryPrecision
}

export function parseInventoryQuantity(value: unknown): number | null {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null
  }

  const quantity = Number(value)

  if (
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    quantity > maximumInventoryQuantity
  ) {
    return null
  }

  return roundInventoryQuantity(quantity)
}

export type StockMovementCalculation =
  | {
      ok: true
      nextQuantity: number
      quantityDelta: number
    }
  | {
      ok: false
      reason: "invalid" | "insufficient"
    }

export function calculateStockMovement(
  currentQuantity: number,
  movementType: StockMovementType,
  quantity: number
): StockMovementCalculation {
  if (
    !Number.isFinite(currentQuantity) ||
    currentQuantity < 0 ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > maximumInventoryQuantity
  ) {
    return { ok: false, reason: "invalid" }
  }

  const quantityDelta = movementType === "in" ? quantity : -quantity
  const nextQuantity = roundInventoryQuantity(
    currentQuantity + quantityDelta
  )

  if (nextQuantity < 0) {
    return { ok: false, reason: "insufficient" }
  }

  return {
    nextQuantity,
    ok: true,
    quantityDelta: roundInventoryQuantity(quantityDelta),
  }
}

