import type { AppFormats } from "@/i18n/request"
import type { AppLocale } from "@/i18n/config"
import type { AppMessages } from "@/i18n/messages"

declare module "next-intl" {
  interface AppConfig {
    Formats: AppFormats
    Locale: AppLocale
    Messages: AppMessages
  }
}
