import type { AppLocale } from "@/i18n/config"

import enMessages from "../../messages/en-IN.json"

const messageLoaders: Record<AppLocale, () => Promise<typeof enMessages>> = {
  "en-IN": async () => enMessages,
  "gu-IN": async () =>
    (await import("../../messages/gu-IN.json")).default as typeof enMessages,
  "hi-IN": async () =>
    (await import("../../messages/hi-IN.json")).default as typeof enMessages,
  "mr-IN": async () =>
    (await import("../../messages/mr-IN.json")).default as typeof enMessages,
}

export type AppMessages = typeof enMessages

export async function loadMessages(locale: AppLocale): Promise<AppMessages> {
  return messageLoaders[locale]()
}
