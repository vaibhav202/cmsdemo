import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LiveDemo } from "@/features/public/components/live-demo"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return { title: t("demoTitle"), description: t("demoDescription") }
}

export default function DemoPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <LiveDemo />
    </section>
  )
}
