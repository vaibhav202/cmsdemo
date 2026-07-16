"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"

import {
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from "@/i18n/config"

export type LocaleActionResult = {
  locale?: AppLocale
  status: "error" | "success"
}

export async function setLocaleAction(
  locale: string
): Promise<LocaleActionResult> {
  if (!isAppLocale(locale)) {
    return { status: "error" }
  }

  const cookieStore = await cookies()
  cookieStore.set(localeCookieName, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  refresh()

  return { locale, status: "success" }
}
