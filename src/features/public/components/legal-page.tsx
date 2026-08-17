import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const t = await getTranslations("Public")
  const isPrivacy = kind === "privacy"
  const sections = isPrivacy
    ? [
        {
          body: t("legal.privacyDataBody"),
          title: t("legal.privacyDataTitle"),
        },
        {
          body: t("legal.privacySecurityBody"),
          title: t("legal.privacySecurityTitle"),
        },
      ]
    : [
        {
          body: t("legal.termsUseBody"),
          title: t("legal.termsUseTitle"),
        },
        {
          body: t("legal.termsPilotBody"),
          title: t("legal.termsPilotTitle"),
        },
      ]

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-col gap-4">
        <Badge className="w-fit" variant="outline">
          {t("legal.draftBadge")}
        </Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {t(isPrivacy ? "legal.privacyTitle" : "legal.termsTitle")}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {t(isPrivacy ? "legal.privacyIntro" : "legal.termsIntro")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("legal.updated", { date: "15 August 2026" })}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {sections.map(({ body, title }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
