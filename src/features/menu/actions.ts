"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { requireWorkspaceSession } from "@/features/auth/demo-session"
import { canAccessModule } from "@/features/memberships/permissions"
import { getRequiredFormString } from "@/lib/form-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function toggleMenuItemAction(formData: FormData) {
  const t = await getTranslations("Control.errors")
  const session = await requireWorkspaceSession()

  if (!canAccessModule(session.user.role, "control")) {
    throw new Error(t("availabilityRole"))
  }

  const vendorSlug = getRequiredFormString(
    formData,
    "vendorSlug",
    t("availabilitySave")
  )
  const menuItemId = getRequiredFormString(
    formData,
    "menuItemId",
    t("availabilitySave")
  )
  const nextStockState =
    getRequiredFormString(
      formData,
      "nextStockState",
      t("availabilitySave")
    ) === "true"

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
