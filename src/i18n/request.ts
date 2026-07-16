import { cookies, headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"

import {
  localeCookieName,
  localeNumberingSystems,
  resolveAppLocale,
  type AppLocale,
} from "@/i18n/config"
import { loadMessages } from "@/i18n/messages"

export const appTimeZone = "Asia/Kolkata"

export function createFormats(locale: AppLocale) {
  const numberingSystem = localeNumberingSystems[locale]

  return {
    dateTime: {
      dateOnly: {
        day: "numeric",
        month: "short",
        numberingSystem,
        timeZone: appTimeZone,
        year: "numeric",
      },
      clockDate: {
        day: "numeric",
        month: "short",
        numberingSystem,
        timeZone: appTimeZone,
        year: "numeric",
      },
      clockTime: {
        hour: "2-digit",
        hour12: true,
        minute: "2-digit",
        numberingSystem,
        second: "2-digit",
        timeZone: appTimeZone,
      },
      movement: {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        numberingSystem,
        timeZone: appTimeZone,
        year: "numeric",
      },
    },
    number: {
      currency: {
        currency: "INR",
        maximumFractionDigits: 0,
        numberingSystem,
        style: "currency",
      },
      integer: {
        maximumFractionDigits: 0,
        numberingSystem,
      },
      quantity: {
        maximumFractionDigits: 3,
        numberingSystem,
      },
    },
  } as const
}

export type AppFormats = ReturnType<typeof createFormats>

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const locale = resolveAppLocale(
    cookieStore.get(localeCookieName)?.value,
    headerStore.get("accept-language")
  )

  return {
    formats: createFormats(locale),
    locale,
    messages: await loadMessages(locale),
    timeZone: appTimeZone,
  }
})
