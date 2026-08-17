import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalPage } from "@/features/public/components/legal-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return { title: t("termsTitle"), description: t("termsDescription") }
}

export default function TermsPage() {
  return <LegalPage kind="terms" />
}
