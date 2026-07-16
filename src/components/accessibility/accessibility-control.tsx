"use client"

import { Accessibility, RotateCcw } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"

import { useAccessibilityPreferences } from "@/components/accessibility/accessibility-provider"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  colorProfiles,
  defaultAccessibilityPreferences,
  textSizeRange,
  textWeightRange,
  type ColorProfile,
} from "@/lib/accessibility-preferences"
import { cn } from "@/lib/utils"

const weightMessageKeys = {
  400: "regular",
  450: "medium",
  500: "strong",
} as const

export function AccessibilitySettings() {
  const {
    colorProfile,
    resetPreferences,
    setColorProfile,
    setTextSize,
    setTextWeight,
    textSize,
    textWeight,
  } = useAccessibilityPreferences()
  const format = useFormatter()
  const t = useTranslations("Common.accessibility")
  const [draftTextSize, setDraftTextSize] = useState(textSize)
  const [draftTextWeight, setDraftTextWeight] = useState(textWeight)
  const textSizeValue = format.number(draftTextSize / 100, {
    maximumFractionDigits: 0,
    style: "percent",
  })
  const weightLabel = t(
    `weights.${weightMessageKeys[draftTextWeight as 400 | 450 | 500]}`
  )

  return (
    <FieldGroup>
      <Field>
        <div className="flex items-center justify-between gap-3">
          <FieldTitle>{t("textSize")}</FieldTitle>
          <span className="text-sm font-medium tabular-nums" aria-hidden>
            {textSizeValue}
          </span>
        </div>
        <Slider
          getValueLabel={(value) =>
            t("textSizeValue", {
              value: format.number(value / 100, {
                maximumFractionDigits: 0,
                style: "percent",
              }),
            })
          }
          max={textSizeRange.max}
          min={textSizeRange.min}
          onValueChange={([value]) => setDraftTextSize(value)}
          onValueCommit={([value]) => setTextSize(value)}
          step={textSizeRange.step}
          thumbLabel={t("textSize")}
          value={[draftTextSize]}
        />
        <FieldDescription>{t("textSizeDescription")}</FieldDescription>
      </Field>

      <Field>
        <div className="flex items-center justify-between gap-3">
          <FieldTitle>{t("textWeight")}</FieldTitle>
          <span className="text-sm font-medium" aria-hidden>
            {weightLabel}
          </span>
        </div>
        <Slider
          getValueLabel={(value) => {
            const key = weightMessageKeys[value as 400 | 450 | 500]
            return t("textWeightValue", { value: t(`weights.${key}`) })
          }}
          max={textWeightRange.max}
          min={textWeightRange.min}
          onValueChange={([value]) => setDraftTextWeight(value)}
          onValueCommit={([value]) => setTextWeight(value)}
          step={textWeightRange.step}
          thumbLabel={t("textWeight")}
          value={[draftTextWeight]}
        />
        <FieldDescription>{t("textWeightDescription")}</FieldDescription>
      </Field>

      <FieldSet>
        <FieldLegend variant="label">{t("colorProfile")}</FieldLegend>
        <FieldDescription>{t("colorProfileDescription")}</FieldDescription>
        <ToggleGroup
          aria-label={t("colorProfile")}
          className="w-full items-stretch"
          onValueChange={(value) => {
            if (value) setColorProfile(value as ColorProfile)
          }}
          orientation="vertical"
          spacing={1}
          type="single"
          value={colorProfile}
          variant="outline"
        >
          {colorProfiles.map((profile) => {
            const label = t(`profiles.${profile}`)

            return (
              <ToggleGroupItem
                aria-label={t("profileOptionLabel", { profile: label })}
                className="h-auto min-h-10 w-full justify-start whitespace-normal py-2 text-left"
                key={profile}
                value={profile}
              >
                {label}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </FieldSet>

      <Field>
        <FieldDescription>{t("supportNote")}</FieldDescription>
        <FieldDescription>{t("deviceNote")}</FieldDescription>
        <Button
          className="w-full"
          onClick={() => {
            setDraftTextSize(defaultAccessibilityPreferences.textSize)
            setDraftTextWeight(defaultAccessibilityPreferences.textWeight)
            resetPreferences()
          }}
          type="button"
          variant="outline"
        >
          <RotateCcw data-icon="inline-start" />
          {t("reset")}
        </Button>
      </Field>
    </FieldGroup>
  )
}

export function AccessibilityMenu({
  compact = true,
  fullWidth = false,
}: {
  compact?: boolean
  fullWidth?: boolean
}) {
  const t = useTranslations("Common.accessibility")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={t("open")}
          className={cn(fullWidth && "w-full justify-start")}
          size={compact ? "icon" : "default"}
          type="button"
          variant="outline"
        >
          <Accessibility data-icon="inline-start" />
          {compact ? <span className="sr-only">{t("open")}</span> : t("title")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={compact ? "end" : "start"}
        className="max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
      >
        <PopoverHeader>
          <PopoverTitle>{t("title")}</PopoverTitle>
          <PopoverDescription>{t("description")}</PopoverDescription>
        </PopoverHeader>
        <AccessibilitySettings />
      </PopoverContent>
    </Popover>
  )
}
