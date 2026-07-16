import type { CSSProperties } from "react"

export const accessibilityCookieName = "cms_platform_accessibility"
export const accessibilityCookieMaxAge = 60 * 60 * 24 * 365

export const textSizeRange = {
  max: 200,
  min: 100,
  step: 10,
} as const

export const textWeightRange = {
  max: 500,
  min: 400,
  step: 50,
} as const

export const colorProfiles = [
  "default",
  "color-safe",
  "high-contrast",
] as const

export type ColorProfile = (typeof colorProfiles)[number]

export type AccessibilityPreferences = {
  colorProfile: ColorProfile
  textSize: number
  textWeight: number
}

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  colorProfile: "default",
  textSize: 100,
  textWeight: 400,
}

type AccessibilityStyle = CSSProperties &
  Record<`--font-weight-${"medium" | "normal" | "semibold"}`, number>

function isRangeStep(
  value: number,
  range: { max: number; min: number; step: number }
) {
  return (
    Number.isInteger(value) &&
    value >= range.min &&
    value <= range.max &&
    (value - range.min) % range.step === 0
  )
}

export function isColorProfile(value: string): value is ColorProfile {
  return colorProfiles.includes(value as ColorProfile)
}

export function parseAccessibilityPreferences(
  value: string | null | undefined
): AccessibilityPreferences {
  if (!value) return defaultAccessibilityPreferences

  const [textSizeValue, textWeightValue, colorProfileValue, ...remainder] =
    value.split(":")
  const textSize = Number(textSizeValue)
  const textWeight = Number(textWeightValue)

  if (
    remainder.length > 0 ||
    !isRangeStep(textSize, textSizeRange) ||
    !isRangeStep(textWeight, textWeightRange) ||
    !isColorProfile(colorProfileValue)
  ) {
    return defaultAccessibilityPreferences
  }

  return {
    colorProfile: colorProfileValue,
    textSize,
    textWeight,
  }
}

export function serializeAccessibilityPreferences(
  preferences: AccessibilityPreferences
) {
  return `${preferences.textSize}:${preferences.textWeight}:${preferences.colorProfile}`
}

export function getAccessibilityStyle(
  preferences: AccessibilityPreferences
): AccessibilityStyle {
  return {
    "--font-weight-medium": preferences.textWeight + 100,
    "--font-weight-normal": preferences.textWeight,
    "--font-weight-semibold": preferences.textWeight + 200,
    fontSize: `${preferences.textSize}%`,
  }
}
