import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PilotInquiryForm } from "@/features/pilot-inquiries/components/pilot-inquiry-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return { title: t("contactTitle"), description: t("contactDescription") }
}

export default async function ContactPage() {
  const t = await getTranslations("Public")

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(420px,1.25fr)] lg:items-start lg:gap-14 lg:px-8 lg:py-20">
      <div className="flex max-w-xl flex-col gap-4 lg:sticky lg:top-24">
        <Badge className="w-fit" variant="outline">
          {t("contact.eyebrow")}
        </Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("contact.title")}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {t("contact.description")}
        </p>
        <p className="text-sm text-muted-foreground">{t("contact.note")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("contact.formTitle")}</CardTitle>
          <CardDescription>{t("contact.formDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PilotInquiryForm />
        </CardContent>
      </Card>
    </section>
  )
}
