import {
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
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

const notoSansDevanagari = Noto_Sans_Devanagari({
  display: "swap",
  preload: false,
  subsets: ["devanagari"],
  variable: "--font-noto-sans-devanagari",
  weight: "variable",
})

const notoSerifDevanagari = Noto_Serif_Devanagari({
  display: "swap",
  preload: false,
  subsets: ["devanagari"],
  variable: "--font-noto-serif-devanagari",
  weight: "variable",
})

const notoSansGujarati = Noto_Sans_Gujarati({
  display: "swap",
  preload: false,
  subsets: ["gujarati"],
  variable: "--font-noto-sans-gujarati",
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
  notoSansDevanagari.variable,
  notoSerifDevanagari.variable,
  notoSansGujarati.variable,
  notoSerifGujarati.variable,
].join(" ")

export function getLocaleSansFont(locale: AppLocale) {
  if (locale === "mr-IN" || locale === "hi-IN") {
    return "var(--font-noto-sans-devanagari), var(--font-geist-sans), sans-serif"
  }

  if (locale === "gu-IN") {
    return "var(--font-noto-sans-gujarati), var(--font-geist-sans), sans-serif"
  }

  return "var(--font-geist-sans), sans-serif"
}

export function getLocaleHeadingFont(
  font: string | null | undefined,
  locale: AppLocale
) {
  if (font !== "serif") return getLocaleSansFont(locale)

  if (locale === "mr-IN" || locale === "hi-IN") {
    return "var(--font-noto-serif-devanagari), var(--font-libre-baskerville), serif"
  }

  if (locale === "gu-IN") {
    return "var(--font-noto-serif-gujarati), var(--font-libre-baskerville), serif"
  }

  return "var(--font-libre-baskerville), Georgia, serif"
}
