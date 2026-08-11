"use client"

import { useActionState, useEffect, useState } from "react"
import { Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  updateVendorIdentityAction,
  type VendorIdentityState,
} from "@/features/vendors/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  headingFontOptions,
  parseVendorAccentColor,
  vendorAccentOptions,
} from "@/features/vendors/brand"
import { cn } from "@/lib/utils"

import { VendorAccentToggleField } from "./vendor-accent-toggle-field"

type VendorAppearanceFormProps = {
  currentAccent: string
  currentHeadingFont: string
  vendorId: string
  vendorSlug: string
}

const initialState: VendorIdentityState = { status: "idle" }

function getInitialAccentSelection(color: string) {
  return vendorAccentOptions.some((option) => option.value === color)
    ? color
    : "custom"
}

export function VendorAppearanceForm({
  currentAccent,
  currentHeadingFont,
  vendorId,
  vendorSlug,
}: VendorAppearanceFormProps) {
  const t = useTranslations("Control")
  const [state, action, pending] = useActionState(
    updateVendorIdentityAction,
    initialState
  )
  const [accentSelection, setAccentSelection] = useState(() =>
    getInitialAccentSelection(currentAccent)
  )
  const [pickerColor, setPickerColor] = useState(currentAccent)
  const [customColor, setCustomColor] = useState(
    accentSelection === "custom" ? currentAccent : ""
  )
  const [headingFont, setHeadingFont] = useState(currentHeadingFont)

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message)
    }
  }, [state.message, state.savedAt, state.status])

  function selectAccent(nextAccent: string) {
    setAccentSelection(nextAccent)

    if (nextAccent === "custom") {
      setCustomColor((current) => current || pickerColor)
      return
    }

    setPickerColor(nextAccent)
    setCustomColor("")
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input name="vendorId" type="hidden" value={vendorId} />
      <input name="vendorSlug" type="hidden" value={vendorSlug} />

      <VendorAccentToggleField
        onValueChange={selectAccent}
        options={vendorAccentOptions}
        value={accentSelection}
      />

      <FieldGroup className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)]">
        <Field>
          <FieldLabel htmlFor="brandColorPicker">
            {t("pickerLabel")}
          </FieldLabel>
          <Input
            className="h-10 p-1"
            id="brandColorPicker"
            name="brandColorPicker"
            onChange={(event) => {
              setAccentSelection("custom")
              setPickerColor(event.target.value)
              setCustomColor(event.target.value)
            }}
            type="color"
            value={pickerColor}
          />
        </Field>
        <Field data-invalid={state.status === "error"}>
          <FieldLabel htmlFor="brandColorCustom">
            {t("customLabel")}
          </FieldLabel>
          <Input
            aria-invalid={state.status === "error"}
            id="brandColorCustom"
            name="brandColorCustom"
            onChange={(event) => {
              const nextColor = event.target.value
              const parsedColor = parseVendorAccentColor(nextColor)

              setAccentSelection("custom")
              setCustomColor(nextColor)

              if (parsedColor) {
                setPickerColor(parsedColor)
              }
            }}
            placeholder={t("customPlaceholder")}
            value={customColor}
          />
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="headingFont">{t("headingLabel")}</FieldLabel>
        <Select
          name="headingFont"
          onValueChange={setHeadingFont}
          value={headingFont}
        >
          <SelectTrigger className="w-full" id="headingFont">
            <SelectValue placeholder={t("headingPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {headingFontOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === "serif"
                    ? t("headingSerif")
                    : t("headingSans")}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription
          className={cn(
            "text-base text-foreground",
            headingFont === "serif" ? "font-heading-serif" : "font-sans"
          )}
        >
          {t("preview")}
        </FieldDescription>
      </Field>

      {state.status === "error" ? (
        <FieldError>{state.message}</FieldError>
      ) : null}
      {state.status === "success" ? (
        <FieldDescription>{state.message}</FieldDescription>
      ) : null}

      <Button disabled={pending} type="submit">
        <Save data-icon="inline-start" />
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  )
}
