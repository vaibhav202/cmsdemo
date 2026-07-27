import {
  Anek_Devanagari,
  Anek_Gujarati,
  Noto_Serif_Devanagari,
  Noto_Serif_Gujarati,
} from "next/font/google"
import localFont from "next/font/local"

import type { AppLocale } from "@/i18n/config"

export const headingSerif = localFont({
  adjustFontFallback: "Times New Roman",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  src: "../assets/fonts/LibreBaskerville-Variable.ttf",
  variable: "--font-libre-baskerville",
  weight: "400 700",
})

const anekDevanagari = Anek_Devanagari({
  display: "swap",
  preload: false,
  subsets: ["devanagari"],
  variable: "--font-anek-devanagari",
  weight: "variable",
})

const notoSerifDevanagari = Noto_Serif_Devanagari({
  display: "swap",
  preload: false,
  subsets: ["devanagari"],
  variable: "--font-noto-serif-devanagari",
  weight: "variable",
})

const anekGujarati = Anek_Gujarati({
  display: "swap",
  preload: false,
  subsets: ["gujarati"],
  variable: "--font-anek-gujarati",
  weight: "variable",
})

const notoSerifGujarati = Noto_Serif_Gujarati({
  display: "swap",
  preload: false,
  subsets: ["gujarati"],
  variable: "--font-noto-serif-gujarati",
  weight: "variable",
})

export const localeFontVariables = [
  headingSerif.variable,
  anekDevanagari.variable,
  notoSerifDevanagari.variable,
  anekGujarati.variable,
  notoSerifGujarati.variable,
].join(" ")

export function getLocaleSansFont(locale: AppLocale) {
  if (locale === "mr-IN" || locale === "hi-IN") {
    return "var(--font-geist-sans), var(--font-anek-devanagari), sans-serif"
  }

  if (locale === "gu-IN") {
    return "var(--font-geist-sans), var(--font-anek-gujarati), sans-serif"
  }

  return "var(--font-geist-sans), sans-serif"
}

export function getLocaleHeadingFont(
  font: string | null | undefined,
  locale: AppLocale
) {
  if (font !== "serif") return getLocaleSansFont(locale)

  if (locale === "mr-IN" || locale === "hi-IN") {
    return "var(--font-libre-baskerville), var(--font-noto-serif-devanagari), serif"
  }

  if (locale === "gu-IN") {
    return "var(--font-libre-baskerville), var(--font-noto-serif-gujarati), serif"
  }

  return "var(--font-libre-baskerville), Georgia, serif"
}
