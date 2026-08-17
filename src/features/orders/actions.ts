"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { requireWorkspaceSession } from "@/features/auth/demo-session"
import { canAccessModule } from "@/features/memberships/permissions"
import {
  isValidIdempotencyKey,
  prepareCreateOrderCommand,
  type CartLineInput,
} from "@/features/orders/commands"
import { getNextOrderStatus } from "@/features/orders/transitions"
import { getRequiredFormString } from "@/lib/form-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getVendorBySlug } from "@/features/vendors/data"

type RpcCreatedOrder = {
  createdAt: string
  id: string
  tokenNo: number
  total: number
}

export type CreatedOrderResult = RpcCreatedOrder

function isE2EFixtureMode() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.E2E_USE_FIXTURES === "1"
  )
}

function readCartLines(value: FormDataEntryValue | null): CartLineInput[] {
  if (typeof value !== "string") return []

  try {
    const parsed: unknown = JSON.parse(value)

    if (!Array.isArray(parsed)) return []

    return parsed.map((line) => {
      if (!line || typeof line !== "object") {
        return { menuItemId: "", quantity: 0 }
      }

      const candidate = line as {
        menuItemId?: unknown
        quantity?: unknown
      }

      return {
        menuItemId:
          typeof candidate.menuItemId === "string"
            ? candidate.menuItemId
            : "",
        quantity: Number(candidate.quantity),
      }
    })
  } catch {
    return []
  }
}

function readRpcCreatedOrder(value: unknown): CreatedOrderResult | null {
  const candidate =
    Array.isArray(value) && value.length === 1 ? value[0] : value

  if (!candidate || typeof candidate !== "object") return null

  const result = candidate as {
    createdAt?: unknown
    id?: unknown
    tokenNo?: unknown
    total?: unknown
  }
  const total = Number(result.total)
  const tokenNo = Number(result.tokenNo)

  if (
    typeof result.createdAt !== "string" ||
    typeof result.id !== "string" ||
    !Number.isFinite(tokenNo) ||
    !Number.isFinite(total)
  ) {
    return null
  }

  return {
    createdAt: result.createdAt,
    id: result.id,
    tokenNo,
    total,
  }
}

function getOrderErrorMessage(
  reason: "cart" | "generic" | "payment" | "quantity" | "role" | "workspace",
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (reason === "role") return t("errors.role")
  if (reason === "quantity") return t("errors.quantity")
  if (reason === "cart") return t("errors.cart")
  if (reason === "payment") return t("errors.payment")
  return t("errors.generic")
}

export async function createOrderAction(formData: FormData) {
  const t = await getTranslations("Order")
  const session = await requireWorkspaceSession()
  const vendorSlug = getRequiredFormString(
    formData,
    "vendorSlug",
    t("errors.generic")
  )
  const idempotencyValue = String(formData.get("idempotencyKey") ?? "")
  const idempotencyKey = isValidIdempotencyKey(idempotencyValue)
    ? idempotencyValue
    : randomUUID()
  const commandResult = prepareCreateOrderCommand({
    actorRole: session.user.role,
    actorVendorSlug: session.vendor.slug,
    customerLabel: String(formData.get("customerLabel") ?? ""),
    defaultCustomerLabel: t("counterDefault"),
    idempotencyKey,
    lines: readCartLines(formData.get("lines")),
    note: String(formData.get("note") ?? ""),
    paymentMode: String(formData.get("paymentMode") ?? ""),
    vendorSlug,
  })

  if (!commandResult.ok) {
    throw new Error(getOrderErrorMessage(commandResult.reason, t))
  }

  const command = commandResult.command

  if (isE2EFixtureMode()) {
    return {
      createdAt: new Date().toISOString(),
      id: `e2e-${command.idempotencyKey}`,
      tokenNo: 102,
      total: 0,
    }
  }

  const vendor = await getVendorBySlug(session.vendor.slug)
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc("create_counter_order", {
    p_customer_label: command.customerLabel,
    p_idempotency_key: command.idempotencyKey,
    p_lines: command.lines,
    p_note: command.note || null,
    p_payment_mode: command.paymentMode,
    p_vendor_id: vendor.id,
  })

  if (error) {
    console.error("Unable to create counter order", error)
    throw new Error(t("errors.create"))
  }

  const order = readRpcCreatedOrder(data)

  if (!order) {
    console.error("Counter order RPC returned an invalid payload", data)
    throw new Error(t("errors.create"))
  }

  revalidatePath(`/app/${command.vendorSlug}/order`)
  revalidatePath(`/app/${command.vendorSlug}/kitchen`)
  revalidatePath(`/app/${command.vendorSlug}/queue`)

  return order
}

export async function cancelOrderAction(formData: FormData) {
  const t = await getTranslations("Order")
  const session = await requireWorkspaceSession()
  const vendorSlug = getRequiredFormString(
    formData,
    "vendorSlug",
    t("errors.cancel")
  )
  const orderId = getRequiredFormString(
    formData,
    "orderId",
    t("errors.cancel")
  )

  if (
    vendorSlug !== session.vendor.slug ||
    !canAccessModule(session.user.role, "order")
  ) {
    throw new Error(t("errors.role"))
  }

  if (isE2EFixtureMode()) return

  const vendor = await getVendorBySlug(session.vendor.slug)
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc("cancel_counter_order", {
    p_order_id: orderId,
    p_vendor_id: vendor.id,
  })

  if (error) {
    console.error("Unable to cancel counter order", error)
    throw new Error(t("errors.cancel"))
  }

  revalidatePath(`/app/${vendorSlug}/order`)
  revalidatePath(`/app/${vendorSlug}/kitchen`)
  revalidatePath(`/app/${vendorSlug}/queue`)
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

  if (!nextStatus) return

  if (
    vendorSlug !== session.vendor.slug ||
    (!canAccessModule(session.user.role, "kitchen") &&
      !canAccessModule(session.user.role, "order"))
  ) {
    throw new Error(t("statusRoleError"))
  }

  if (isE2EFixtureMode()) return

  const vendor = await getVendorBySlug(session.vendor.slug)
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("vendor_id", vendor.id)
    .eq("status", currentStatus)
    .select("id")
    .maybeSingle()

  if (error || !data) {
    console.error("Unable to update order status", error)
    throw new Error(t("statusUpdateError"))
  }

  revalidatePath(`/app/${vendorSlug}/order`)
  revalidatePath(`/app/${vendorSlug}/kitchen`)
  revalidatePath(`/app/${vendorSlug}/queue`)
}
