"use server"

import { refresh, revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { requireWorkspaceSession } from "@/features/auth/demo-session"
import { canAccessModule } from "@/features/memberships/permissions"
import {
  headingFontOptions,
  parseVendorAccentColor,
  vendorAccentOptions,
} from "@/features/vendors/brand"
import { getRequiredFormString } from "@/lib/form-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type VendorIdentityState = {
  message?: string
  savedAt?: number
  savedColor?: string
  savedFont?: string
  status: "idle" | "error" | "success"
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

  const vendorId = getRequiredFormString(
    formData,
    "vendorId",
    t("errors.save")
  )
  const vendorSlug = getRequiredFormString(
    formData,
    "vendorSlug",
    t("errors.save")
  )
  const presetColor = String(formData.get("brandColorPreset") ?? "").trim()
  const pickerColor = String(formData.get("brandColorPicker") ?? "").trim()
  const customColor = String(formData.get("brandColorCustom") ?? "").trim()
  const headingFont = getRequiredFormString(
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
