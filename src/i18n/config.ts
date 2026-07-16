export const supportedLocales = ["mr-IN", "en-IN", "hi-IN", "gu-IN"] as const

export type AppLocale = (typeof supportedLocales)[number]
export type AppNumberingSystem = "deva" | "gujr" | "latn"

export const defaultLocale: AppLocale = "mr-IN"
export const localeCookieName = "cms_platform_locale"

export const localeNumberingSystems: Record<
  AppLocale,
  AppNumberingSystem
> = {
  "en-IN": "latn",
  "gu-IN": "gujr",
  "hi-IN": "deva",
  "mr-IN": "deva",
}

export const localeOptions: ReadonlyArray<{
  label: string
  locale: AppLocale
  shortLabel: string
}> = [
  { label: "मराठी", locale: "mr-IN", shortLabel: "म" },
  { label: "English", locale: "en-IN", shortLabel: "EN" },
  { label: "हिंदी", locale: "hi-IN", shortLabel: "हि" },
  { label: "ગુજરાતી", locale: "gu-IN", shortLabel: "ગુ" },
]

const localeByLanguage: Record<string, AppLocale> = {
  en: "en-IN",
  gu: "gu-IN",
  hi: "hi-IN",
  mr: "mr-IN",
}

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale)
}

type LanguagePreference = {
  language: string
  quality: number
  sequence: number
}

function parseAcceptLanguage(value: string | null | undefined) {
  if (!value) return []

  return value
    .split(",")
    .map((entry, sequence): LanguagePreference | null => {
      const [range, ...parameters] = entry.trim().split(";")
      if (!range || range === "*") return null

      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q=")
      )
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1

      if (!Number.isFinite(quality) || quality <= 0) return null

      return {
        language: range.toLowerCase().split("-")[0],
        quality,
        sequence,
      }
    })
    .filter((entry): entry is LanguagePreference => entry !== null)
    .sort(
      (left, right) =>
        right.quality - left.quality || left.sequence - right.sequence
    )
}

export function resolveAppLocale(
  cookieLocale: string | null | undefined,
  acceptLanguage: string | null | undefined
): AppLocale {
  if (isAppLocale(cookieLocale)) return cookieLocale

  for (const preference of parseAcceptLanguage(acceptLanguage)) {
    const locale = localeByLanguage[preference.language]
    if (locale) return locale
  }

  return defaultLocale
}
