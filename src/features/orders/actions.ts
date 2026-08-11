"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { requireWorkspaceSession } from "@/features/auth/demo-session"
import { canAccessModule } from "@/features/memberships/permissions"
import { prepareCreateOrderCommand } from "@/features/orders/commands"
import { getNextOrderStatus } from "@/features/orders/transitions"
import { getRequiredFormString } from "@/lib/form-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function createOrderAction(formData: FormData) {
  const t = await getTranslations("Order")
  const session = await requireWorkspaceSession()

  const vendorId = getRequiredFormString(
    formData,
    "vendorId",
    t("errors.generic")
  )
  const vendorSlug = getRequiredFormString(
    formData,
    "vendorSlug",
    t("errors.generic")
  )
  const menuItemId = getRequiredFormString(
    formData,
    "menuItemId",
    t("errors.generic")
  )
  const quantity = Number(formData.get("quantity") ?? 1)
  const customerLabel = String(
    formData.get("customerLabel") ?? t("counterDefault")
  )
  const commandResult = prepareCreateOrderCommand({
    actorRole: session.user.role,
    actorVendorSlug: session.vendor.slug,
    customerLabel,
    defaultCustomerLabel: t("counterDefault"),
    menuItemId,
    quantity,
    vendorId,
    vendorSlug,
  })

  if (!commandResult.ok) {
    if (commandResult.reason === "role") {
      throw new Error(t("errors.role"))
    }

    if (commandResult.reason === "quantity") {
      throw new Error(t("errors.quantity"))
    }

    throw new Error(t("errors.generic"))
  }

  const command = commandResult.command
  const supabase = await createSupabaseServerClient()
  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price, in_stock")
    .eq("id", command.menuItemId)
    .eq("vendor_id", command.vendorId)
    .single()

  if (menuError || !menuItem || !menuItem.in_stock) {
    throw new Error(t("errors.unavailable"))
  }

  const { data: latestOrder, error: latestError } = await supabase
    .from("orders")
    .select("token_no")
    .eq("vendor_id", command.vendorId)
    .order("token_no", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    console.error("Unable to load the latest order token", latestError)
    throw new Error(t("errors.create"))
  }

  const tokenNo = (latestOrder?.token_no ?? 100) + 1
  const total = Number(menuItem.price) * command.quantity

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      vendor_id: command.vendorId,
      token_no: tokenNo,
      customer_label: command.customerLabel,
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
    quantity: command.quantity,
    price_at_time: Number(menuItem.price),
  })

  if (itemError) {
    console.error("Unable to create order item", itemError)
    throw new Error(t("errors.create"))
  }

  revalidatePath(`/app/${command.vendorSlug}/order`)
  revalidatePath(`/app/${command.vendorSlug}/kitchen`)
  revalidatePath(`/app/${command.vendorSlug}/queue`)
}

export async function advanceOrderAction(formData: FormData) {
  const t = await getTranslations("Kitchen")
  const session = await requireWorkspaceSession()
  const vendorSlug = getRequiredFormString(
    formData,
    "vendorSlug",
    t("statusUpdateError")
  )
  const orderId = getRequiredFormString(
    formData,
    "orderId",
    t("statusUpdateError")
  )
  const currentStatus = getRequiredFormString(
    formData,
    "status",
    t("statusUpdateError")
  )
  const nextStatus = getNextOrderStatus(currentStatus)

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
