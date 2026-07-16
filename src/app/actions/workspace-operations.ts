"use server"

import { refresh, revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import {
  headingFontOptions,
  parseVendorAccentColor,
  vendorAccentOptions,
} from "@/lib/brand"
import { stockMovementOptions, stockUnitOptions } from "@/lib/inventory"
import { requireWorkspaceSession } from "@/lib/workspace-auth"
import {
  canAccessModule,
  canManageStockItems,
  canRecordStockMovement,
} from "@/lib/permissions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const statusFlow: Record<string, string> = {
  paid: "preparing",
  preparing: "ready",
  ready: "completed",
}

export type VendorIdentityState = {
  message?: string
  savedAt?: number
  savedColor?: string
  savedFont?: string
  status: "idle" | "error" | "success"
}

export type InventoryMutationState = {
  message?: string
  savedAt?: number
  status: "idle" | "error" | "success"
}

function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getRequiredString(formData: FormData, key: string, errorMessage: string) {
  const value = getFormString(formData, key)

  if (!value) {
    throw new Error(errorMessage)
  }

  return value
}

function getInventoryNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key))

  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
    return null
  }

  return Math.round(value * 1000) / 1000
}

function inventoryError(message: string): InventoryMutationState {
  return { message, savedAt: Date.now(), status: "error" }
}

function inventorySuccess(message: string): InventoryMutationState {
  return { message, savedAt: Date.now(), status: "success" }
}

export async function createOrderAction(formData: FormData) {
  const t = await getTranslations("Order")
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "order")) {
    throw new Error(t("errors.role"))
  }

  const vendorId = getRequiredString(formData, "vendorId", t("errors.generic"))
  const vendorSlug = getRequiredString(
    formData,
    "vendorSlug",
    t("errors.generic")
  )
  const menuItemId = getRequiredString(
    formData,
    "menuItemId",
    t("errors.generic")
  )
  const quantity = Number(formData.get("quantity") ?? 1)
  const customerLabel = String(
    formData.get("customerLabel") ?? t("counterDefault")
  )

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw new Error(t("errors.quantity"))
  }

  const supabase = await createSupabaseServerClient()
  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price, in_stock")
    .eq("id", menuItemId)
    .eq("vendor_id", vendorId)
    .single()

  if (menuError || !menuItem || !menuItem.in_stock) {
    throw new Error(t("errors.unavailable"))
  }

  const { data: latestOrder, error: latestError } = await supabase
    .from("orders")
    .select("token_no")
    .eq("vendor_id", vendorId)
    .order("token_no", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    console.error("Unable to load the latest order token", latestError)
    throw new Error(t("errors.create"))
  }

  const tokenNo = (latestOrder?.token_no ?? 100) + 1
  const total = Number(menuItem.price) * quantity

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      vendor_id: vendorId,
      token_no: tokenNo,
      customer_label: customerLabel || t("counterDefault"),
      status: "paid",
      payment_status: "paid",
      source: "counter",
      total,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    console.error("Unable to create order", orderError)
    throw new Error(t("errors.create"))
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    menu_item_id: menuItem.id,
    item_name_snapshot: menuItem.name,
    quantity,
    price_at_time: Number(menuItem.price),
  })

  if (itemError) {
    console.error("Unable to create order item", itemError)
    throw new Error(t("errors.create"))
  }

  revalidatePath(`/app/${vendorSlug}/order`)
  revalidatePath(`/app/${vendorSlug}/kitchen`)
  revalidatePath(`/app/${vendorSlug}/queue`)
}

export async function advanceOrderAction(formData: FormData) {
  const t = await getTranslations("Kitchen")
  const session = await requireWorkspaceSession()
  const vendorSlug = getRequiredString(
    formData,
    "vendorSlug",
    t("statusUpdateError")
  )
  const orderId = getRequiredString(
    formData,
    "orderId",
    t("statusUpdateError")
  )
  const currentStatus = getRequiredString(
    formData,
    "status",
    t("statusUpdateError")
  )
  const nextStatus = statusFlow[currentStatus]

  if (!nextStatus) {
    return
  }

  if (
    !canAccessModule(session.user.role, "kitchen") &&
    !canAccessModule(session.user.role, "order")
  ) {
    throw new Error(t("statusRoleError"))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)

  if (error) {
    console.error("Unable to update order status", error)
    throw new Error(t("statusUpdateError"))
  }

  revalidatePath(`/app/${vendorSlug}/order`)
  revalidatePath(`/app/${vendorSlug}/kitchen`)
  revalidatePath(`/app/${vendorSlug}/queue`)
}

export async function toggleMenuItemAction(formData: FormData) {
  const t = await getTranslations("Control.errors")
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "control")) {
    throw new Error(t("availabilityRole"))
  }

  const vendorSlug = getRequiredString(
    formData,
    "vendorSlug",
    t("availabilitySave")
  )
  const menuItemId = getRequiredString(
    formData,
    "menuItemId",
    t("availabilitySave")
  )
  const nextStockState =
    getRequiredString(formData, "nextStockState", t("availabilitySave")) ===
    "true"

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("menu_items")
    .update({ in_stock: nextStockState })
    .eq("id", menuItemId)

  if (error) {
    console.error("Unable to change menu availability", error)
    throw new Error(t("availabilitySave"))
  }

  revalidatePath(`/app/${vendorSlug}/control`)
  revalidatePath(`/app/${vendorSlug}/order`)
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
  const quantityDelta = movementType === "in" ? quantity : -quantity
  const nextQty = Math.round((currentQty + quantityDelta) * 1000) / 1000

  if (nextQty < 0) {
    return inventoryError(
      t("errors.insufficient", {
        name: stockItem.name,
        quantity: currentQty,
        unit: stockItem.unit,
      })
    )
  }

  const { data: updatedItem, error: updateError } = await supabase
    .rpc("record_inventory_movement", {
      p_quantity_delta: quantityDelta,
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

export async function updateVendorIdentityAction(
  _previousState: VendorIdentityState,
  formData: FormData
): Promise<VendorIdentityState> {
  const t = await getTranslations("Control")
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "control")) {
    return {
      message: t("errors.role"),
      status: "error",
    }
  }

  const vendorId = getRequiredString(formData, "vendorId", t("errors.save"))
  const vendorSlug = getRequiredString(
    formData,
    "vendorSlug",
    t("errors.save")
  )
  const presetColor = String(formData.get("brandColorPreset") ?? "").trim()
  const pickerColor = String(formData.get("brandColorPicker") ?? "").trim()
  const customColor = String(formData.get("brandColorCustom") ?? "").trim()
  const headingFont = getRequiredString(
    formData,
    "headingFont",
    t("errors.save")
  )
  const allowedColors = vendorAccentOptions.map((option) => option.value)
  const allowedFonts = headingFontOptions.map((option) => option.value)
  const useCustomColor = presetColor === "custom"

  if (
    presetColor &&
    !useCustomColor &&
    !allowedColors.includes(presetColor as (typeof allowedColors)[number])
  ) {
    return { message: t("errors.color"), status: "error" }
  }

  const brandColor = useCustomColor
    ? parseVendorAccentColor(customColor || pickerColor)
    : presetColor

  if (!brandColor) {
    return {
      message: t("errors.invalidColor"),
      status: "error",
    }
  }

  if (!allowedFonts.includes(headingFont as (typeof allowedFonts)[number])) {
    return { message: t("errors.font"), status: "error" }
  }

  const supabase = await createSupabaseServerClient()
  const { data: updatedVendor, error } = await supabase
    .from("vendors")
    .update({
      brand_color: brandColor,
      heading_font: headingFont,
    })
    .eq("id", vendorId)
    .select("brand_color, heading_font")
    .maybeSingle()

  if (error) {
    console.error("Unable to update vendor appearance", error)
    return { message: t("errors.save"), status: "error" }
  }

  if (!updatedVendor) {
    return {
      message: t("errors.denied"),
      status: "error",
    }
  }

  revalidatePath(`/app/${vendorSlug}`, "layout")
  revalidatePath(`/app/${vendorSlug}/control`)
  refresh()

  return {
    message: t("saved"),
    savedAt: Date.now(),
    savedColor: updatedVendor.brand_color,
    savedFont: updatedVendor.heading_font,
    status: "success",
  }
}
