"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { requireWorkspaceSession } from "@/features/auth/demo-session"
import {
  canManageStockItems,
  canRecordStockMovement,
} from "@/features/memberships/permissions"
import {
  stockMovementOptions,
  stockUnitOptions,
} from "@/features/inventory/config"
import {
  calculateStockMovement,
  parseInventoryQuantity,
} from "@/features/inventory/calculations"
import { getFormString } from "@/lib/form-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type InventoryMutationState = {
  message?: string
  savedAt?: number
  status: "idle" | "error" | "success"
}

function getInventoryNumber(formData: FormData, key: string) {
  return parseInventoryQuantity(formData.get(key))
}

function inventoryError(message: string): InventoryMutationState {
  return { message, savedAt: Date.now(), status: "error" }
}

function inventorySuccess(message: string): InventoryMutationState {
  return { message, savedAt: Date.now(), status: "success" }
}

export async function createStockItemAction(
  _previousState: InventoryMutationState,
  formData: FormData
): Promise<InventoryMutationState> {
  const t = await getTranslations("Inventory")
  const session = await requireWorkspaceSession()

  if (!canManageStockItems(session.user.role)) {
    return inventoryError(t("errors.manageRole"))
  }

  const vendorId = getFormString(formData, "vendorId")
  const vendorSlug = getFormString(formData, "vendorSlug")
  const name = getFormString(formData, "name").replace(/\s+/g, " ")
  const unit = getFormString(formData, "unit")
  const openingQty = getInventoryNumber(formData, "openingQty")
  const reorderLevel = getInventoryNumber(formData, "reorderLevel")
  const allowedUnits = stockUnitOptions.map((option) => option.value)

  if (session.vendor.slug !== vendorSlug) {
    return inventoryError(t("errors.workspace"))
  }

  if (name.length < 2 || name.length > 80 || /[%_]/.test(name)) {
    return inventoryError(t("errors.name"))
  }

  if (!allowedUnits.includes(unit as (typeof allowedUnits)[number])) {
    return inventoryError(t("errors.unit"))
  }

  if (openingQty === null || reorderLevel === null) {
    return inventoryError(t("errors.quantityRange"))
  }

  const supabase = await createSupabaseServerClient()
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("id", vendorId)
    .eq("slug", vendorSlug)
    .maybeSingle()

  if (vendorError || !vendor) {
    return inventoryError(t("errors.verify"))
  }

  const { data: existingItem, error: existingError } = await supabase
    .from("stock_items")
    .select("id")
    .eq("vendor_id", vendorId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle()

  if (existingError) {
    return inventoryError(t("errors.check"))
  }

  if (existingItem) {
    return inventoryError(t("errors.duplicate", { name }))
  }

  const { data: stockItem, error: stockError } = await supabase
    .rpc("create_inventory_ingredient", {
      p_name: name,
      p_opening_qty: openingQty,
      p_reorder_level: reorderLevel,
      p_unit: unit,
      p_vendor_id: vendorId,
    })
    .single()

  if (stockError || !stockItem) {
    console.error("Unable to add inventory ingredient", stockError)
    return inventoryError(t("errors.add"))
  }

  revalidatePath(`/app/${vendorSlug}/inventory`)
  revalidatePath(`/app/${vendorSlug}/reports`)

  return inventorySuccess(t("feedback.added", { name }))
}

export async function adjustStockItemAction(
  _previousState: InventoryMutationState,
  formData: FormData
): Promise<InventoryMutationState> {
  const t = await getTranslations("Inventory")
  const session = await requireWorkspaceSession()

  if (!canRecordStockMovement(session.user.role)) {
    return inventoryError(t("errors.movementRole"))
  }

  const vendorId = getFormString(formData, "vendorId")
  const vendorSlug = getFormString(formData, "vendorSlug")
  const stockItemId = getFormString(formData, "stockItemId")
  const movementType = getFormString(formData, "movementType")
  const reason = getFormString(formData, "reason").replace(/\s+/g, " ")
  const quantity = getInventoryNumber(formData, "quantity")
  const allowedMovements = stockMovementOptions.map((option) => option.value)

  if (session.vendor.slug !== vendorSlug) {
    return inventoryError(t("errors.workspace"))
  }

  if (
    !allowedMovements.includes(
      movementType as (typeof allowedMovements)[number]
    )
  ) {
    return inventoryError(t("errors.movementType"))
  }

  if (quantity === null || quantity === 0) {
    return inventoryError(t("errors.movementQuantity"))
  }

  if (reason.length < 3 || reason.length > 120) {
    return inventoryError(t("errors.reason"))
  }

  const supabase = await createSupabaseServerClient()
  const { data: stockItem, error: stockError } = await supabase
    .from("stock_items")
    .select("id, name, unit, current_qty")
    .eq("id", stockItemId)
    .eq("vendor_id", vendorId)
    .maybeSingle()

  if (stockError || !stockItem) {
    return inventoryError(t("errors.notFound"))
  }

  const currentQty = Number(stockItem.current_qty)
  const movement = calculateStockMovement(
    currentQty,
    movementType as (typeof allowedMovements)[number],
    quantity
  )

  if (!movement.ok && movement.reason === "insufficient") {
    return inventoryError(
      t("errors.insufficient", {
        name: stockItem.name,
        quantity: currentQty,
        unit: stockItem.unit,
      })
    )
  }

  if (!movement.ok) {
    return inventoryError(t("errors.movementQuantity"))
  }

  const { data: updatedItem, error: updateError } = await supabase
    .rpc("record_inventory_movement", {
      p_quantity_delta: movement.quantityDelta,
      p_reason: reason,
      p_stock_item_id: stockItemId,
      p_vendor_id: vendorId,
    })
    .single()

  if (updateError) {
    console.error("Unable to record stock movement", updateError)
    return inventoryError(t("errors.movement"))
  }

  if (!updatedItem) {
    return inventoryError(t("errors.movementResult"))
  }

  const updatedQuantity = Number(
    (updatedItem as { current_qty: number }).current_qty
  )

  revalidatePath(`/app/${vendorSlug}/inventory`)
  revalidatePath(`/app/${vendorSlug}/reports`)

  return inventorySuccess(
    t("feedback.updated", {
      name: stockItem.name,
      quantity: updatedQuantity,
      unit: stockItem.unit,
    })
  )
}
