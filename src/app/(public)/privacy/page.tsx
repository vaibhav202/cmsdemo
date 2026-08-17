import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalPage } from "@/features/public/components/legal-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return { title: t("privacyTitle"), description: t("privacyDescription") }
}

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />
}
