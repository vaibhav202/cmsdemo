"use server"

import { refresh, revalidatePath } from "next/cache"

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

function getRequiredString(formData: FormData, key: string) {
  const value = getFormString(formData, key)

  if (!value) {
    throw new Error(`Missing ${key}`)
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
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "order")) {
    throw new Error("This role cannot create counter orders.")
  }

  const vendorId = getRequiredString(formData, "vendorId")
  const vendorSlug = getRequiredString(formData, "vendorSlug")
  const menuItemId = getRequiredString(formData, "menuItemId")
  const quantity = Number(formData.get("quantity") ?? 1)
  const customerLabel = String(formData.get("customerLabel") ?? "Counter")

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw new Error("Quantity must be between 1 and 20.")
  }

  const supabase = await createSupabaseServerClient()
  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price, in_stock")
    .eq("id", menuItemId)
    .eq("vendor_id", vendorId)
    .single()

  if (menuError || !menuItem || !menuItem.in_stock) {
    throw new Error("Menu item is unavailable.")
  }

  const { data: latestOrder, error: latestError } = await supabase
    .from("orders")
    .select("token_no")
    .eq("vendor_id", vendorId)
    .order("token_no", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    throw new Error(latestError.message)
  }

  const tokenNo = (latestOrder?.token_no ?? 100) + 1
  const total = Number(menuItem.price) * quantity

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      vendor_id: vendorId,
      token_no: tokenNo,
      customer_label: customerLabel || "Counter",
      status: "paid",
      payment_status: "paid",
      source: "counter",
      total,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Unable to create order.")
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    menu_item_id: menuItem.id,
    item_name_snapshot: menuItem.name,
    quantity,
    price_at_time: Number(menuItem.price),
  })

  if (itemError) {
    throw new Error(itemError.message)
  }

  revalidatePath(`/app/${vendorSlug}/order`)
  revalidatePath(`/app/${vendorSlug}/kitchen`)
  revalidatePath(`/app/${vendorSlug}/queue`)
}

export async function advanceOrderAction(formData: FormData) {
  const session = await requireWorkspaceSession()
  const vendorSlug = getRequiredString(formData, "vendorSlug")
  const orderId = getRequiredString(formData, "orderId")
  const currentStatus = getRequiredString(formData, "status")
  const nextStatus = statusFlow[currentStatus]

  if (!nextStatus) {
    return
  }

  if (
    !canAccessModule(session.user.role, "kitchen") &&
    !canAccessModule(session.user.role, "order")
  ) {
    throw new Error("This role cannot change order status.")
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/app/${vendorSlug}/order`)
  revalidatePath(`/app/${vendorSlug}/kitchen`)
  revalidatePath(`/app/${vendorSlug}/queue`)
}

export async function toggleMenuItemAction(formData: FormData) {
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "control")) {
    throw new Error("This role cannot change menu availability.")
  }

  const vendorSlug = getRequiredString(formData, "vendorSlug")
  const menuItemId = getRequiredString(formData, "menuItemId")
  const nextStockState = getRequiredString(formData, "nextStockState") === "true"

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("menu_items")
    .update({ in_stock: nextStockState })
    .eq("id", menuItemId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/app/${vendorSlug}/control`)
  revalidatePath(`/app/${vendorSlug}/order`)
}

export async function createStockItemAction(
  _previousState: InventoryMutationState,
  formData: FormData
): Promise<InventoryMutationState> {
  const session = await requireWorkspaceSession()

  if (!canManageStockItems(session.user.role)) {
    return inventoryError("This role cannot add inventory ingredients.")
  }

  const vendorId = getFormString(formData, "vendorId")
  const vendorSlug = getFormString(formData, "vendorSlug")
  const name = getFormString(formData, "name").replace(/\s+/g, " ")
  const unit = getFormString(formData, "unit")
  const openingQty = getInventoryNumber(formData, "openingQty")
  const reorderLevel = getInventoryNumber(formData, "reorderLevel")
  const allowedUnits = stockUnitOptions.map((option) => option.value)

  if (session.vendor.slug !== vendorSlug) {
    return inventoryError("This inventory does not belong to your workspace.")
  }

  if (name.length < 2 || name.length > 80 || /[%_]/.test(name)) {
    return inventoryError("Use an ingredient name between 2 and 80 characters.")
  }

  if (!allowedUnits.includes(unit as (typeof allowedUnits)[number])) {
    return inventoryError("Choose a supported stock unit.")
  }

  if (openingQty === null || reorderLevel === null) {
    return inventoryError("Quantities must be between 0 and 1,000,000.")
  }

  const supabase = await createSupabaseServerClient()
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("id", vendorId)
    .eq("slug", vendorSlug)
    .maybeSingle()

  if (vendorError || !vendor) {
    return inventoryError("Unable to verify this inventory workspace.")
  }

  const { data: existingItem, error: existingError } = await supabase
    .from("stock_items")
    .select("id")
    .eq("vendor_id", vendorId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle()

  if (existingError) {
    return inventoryError("Unable to check the ingredient register.")
  }

  if (existingItem) {
    return inventoryError(`${name} is already in the stock register.`)
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
    return inventoryError(stockError?.message ?? "Unable to add ingredient.")
  }

  revalidatePath(`/app/${vendorSlug}/inventory`)
  revalidatePath(`/app/${vendorSlug}/reports`)

  return inventorySuccess(`${name} added to inventory.`)
}

export async function adjustStockItemAction(
  _previousState: InventoryMutationState,
  formData: FormData
): Promise<InventoryMutationState> {
  const session = await requireWorkspaceSession()

  if (!canRecordStockMovement(session.user.role)) {
    return inventoryError("This role cannot record stock movements.")
  }

  const vendorId = getFormString(formData, "vendorId")
  const vendorSlug = getFormString(formData, "vendorSlug")
  const stockItemId = getFormString(formData, "stockItemId")
  const movementType = getFormString(formData, "movementType")
  const reason = getFormString(formData, "reason").replace(/\s+/g, " ")
  const quantity = getInventoryNumber(formData, "quantity")
  const allowedMovements = stockMovementOptions.map((option) => option.value)

  if (session.vendor.slug !== vendorSlug) {
    return inventoryError("This inventory does not belong to your workspace.")
  }

  if (
    !allowedMovements.includes(
      movementType as (typeof allowedMovements)[number]
    )
  ) {
    return inventoryError("Choose whether stock is coming in or going out.")
  }

  if (quantity === null || quantity === 0) {
    return inventoryError("Movement quantity must be greater than zero.")
  }

  if (reason.length < 3 || reason.length > 120) {
    return inventoryError("Add a reason between 3 and 120 characters.")
  }

  const supabase = await createSupabaseServerClient()
  const { data: stockItem, error: stockError } = await supabase
    .from("stock_items")
    .select("id, name, unit, current_qty")
    .eq("id", stockItemId)
    .eq("vendor_id", vendorId)
    .maybeSingle()

  if (stockError || !stockItem) {
    return inventoryError("Ingredient not found in this workspace.")
  }

  const currentQty = Number(stockItem.current_qty)
  const quantityDelta = movementType === "in" ? quantity : -quantity
  const nextQty = Math.round((currentQty + quantityDelta) * 1000) / 1000

  if (nextQty < 0) {
    return inventoryError(
      `Only ${currentQty} ${stockItem.unit} of ${stockItem.name} is available.`
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
    return inventoryError(updateError.message)
  }

  if (!updatedItem) {
    return inventoryError("The stock movement did not return an updated item.")
  }

  const updatedQuantity = Number(
    (updatedItem as { current_qty: number }).current_qty
  )

  revalidatePath(`/app/${vendorSlug}/inventory`)
  revalidatePath(`/app/${vendorSlug}/reports`)

  return inventorySuccess(
    `${stockItem.name} updated to ${updatedQuantity} ${stockItem.unit}.`
  )
}

export async function updateVendorIdentityAction(
  _previousState: VendorIdentityState,
  formData: FormData
): Promise<VendorIdentityState> {
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "control")) {
    return {
      message: "This role cannot change workspace appearance.",
      status: "error",
    }
  }

  const vendorId = getRequiredString(formData, "vendorId")
  const vendorSlug = getRequiredString(formData, "vendorSlug")
  const presetColor = String(formData.get("brandColorPreset") ?? "").trim()
  const pickerColor = String(formData.get("brandColorPicker") ?? "").trim()
  const customColor = String(formData.get("brandColorCustom") ?? "").trim()
  const headingFont = getRequiredString(formData, "headingFont")
  const allowedColors = vendorAccentOptions.map((option) => option.value)
  const allowedFonts = headingFontOptions.map((option) => option.value)
  const useCustomColor = presetColor === "custom"

  if (
    presetColor &&
    !useCustomColor &&
    !allowedColors.includes(presetColor as (typeof allowedColors)[number])
  ) {
    return { message: "Unsupported brand color.", status: "error" }
  }

  const brandColor = useCustomColor
    ? parseVendorAccentColor(customColor || pickerColor)
    : presetColor

  if (!brandColor) {
    return {
      message: "Use a valid HEX, RGB, or HSL brand color.",
      status: "error",
    }
  }

  if (!allowedFonts.includes(headingFont as (typeof allowedFonts)[number])) {
    return { message: "Unsupported heading font.", status: "error" }
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
    return { message: "Unable to save workspace appearance.", status: "error" }
  }

  if (!updatedVendor) {
    return {
      message: "This workspace did not allow the appearance update.",
      status: "error",
    }
  }

  revalidatePath(`/app/${vendorSlug}`, "layout")
  revalidatePath(`/app/${vendorSlug}/control`)
  refresh()

  return {
    message: "Workspace appearance saved.",
    savedAt: Date.now(),
    savedColor: updatedVendor.brand_color,
    savedFont: updatedVendor.heading_font,
    status: "success",
  }
}
