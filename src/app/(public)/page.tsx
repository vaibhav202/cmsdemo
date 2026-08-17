import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock3,
  MonitorSmartphone,
  ReceiptText,
  Utensils,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VerticalTextTicker } from "@/features/public/components/vertical-text-ticker"
import { platformBrand } from "@/features/vendors/brand"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  }
}

export default async function HomePage() {
  const t = await getTranslations("Public")
  const workflows: Array<{
    description: string
    icon: LucideIcon
    title: string
  }> = [
    {
      description: t("home.workflow.counterDescription"),
      icon: ReceiptText,
      title: t("home.workflow.counterTitle"),
    },
    {
      description: t("home.workflow.kitchenDescription"),
      icon: ChefHat,
      title: t("home.workflow.kitchenTitle"),
    },
    {
      description: t("home.workflow.queueDescription"),
      icon: MonitorSmartphone,
      title: t("home.workflow.queueTitle"),
    },
  ]

  return (
    <>
      <section className="overflow-hidden border-b bg-primary/5">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex max-w-3xl flex-col gap-6">
            <Badge className="w-fit" variant="outline">
              {t("home.eyebrow")}
            </Badge>
            <div className="flex flex-col gap-5">
              <h1 className="min-w-0 max-w-3xl font-heading text-5xl leading-[0.92] font-semibold tracking-tight sm:text-7xl sm:leading-[0.9]">
                <VerticalTextTicker
                  items={[
                    t("home.titleTicker.orders"),
                    t("home.titleTicker.handoff"),
                    t("home.titleTicker.queue"),
                    t("home.titleTicker.daily"),
                  ]}
                  label={t("home.titleTickerLabel")}
                  variant="hero"
                />
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("home.description", { product: platformBrand.name })}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/demo">
                {t("home.primaryCta")}
                <ArrowRight data-icon="inline-end" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                {t("home.secondaryCta")}
              </ButtonLink>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="text-primary" />
              {t("home.note")}
            </p>
          </div>

          <Card className="relative overflow-hidden shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>{t("home.previewLabel")}</CardDescription>
                  <CardTitle className="mt-1">{t("home.previewTitle")}</CardTitle>
                </div>
                <Badge variant="secondary">{t("home.previewLive")}</Badge>
              </div>
              <CardDescription>{t("home.previewDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2">
                <PreviewMetric
                  label={t("home.preview.salesLabel")}
                  value={t("home.preview.salesValue", { value: 18420 })}
                />
                <PreviewMetric
                  label={t("home.preview.activeLabel")}
                  value={t("home.preview.activeValue", { value: 18 })}
                />
                <PreviewMetric
                  label={t("home.preview.readyLabel")}
                  value={t("home.preview.readyValue", { value: 4 })}
                />
              </div>
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Utensils />
                    </span>
                    <div>
                      <p className="font-medium">{t("home.preview.ticket", { token: 248 })}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("home.preview.items", { count: 3 })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="preparing">{t("home.preview.status")}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 />
                  {t("home.preview.elapsed", { value: 12 })}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="text-muted-foreground">{t("home.preview.source")}</span>
                <span className="font-medium">{t("home.preview.sourceValue")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex max-w-2xl flex-col gap-3">
          <Badge className="w-fit" variant="outline">
            {t("home.workflowEyebrow")}
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("home.workflowTitle")}
          </h2>
          <p className="text-muted-foreground">{t("home.workflowDescription")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {workflows.map(({ description, icon: Icon, title }) => (
            <Card key={title}>
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon />
                </span>
                <CardTitle className="mt-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-20">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {t("home.demoEyebrow")}
            </Badge>
            <CardTitle className="mt-2 text-2xl">{t("home.demoTitle")}</CardTitle>
            <CardDescription>{t("home.demoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ButtonLink href="/demo">
              {t("home.demoCta")}
              <ArrowRight data-icon="inline-end" />
            </ButtonLink>
            <p className="text-sm text-muted-foreground">{t("home.demoNote")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {t("home.pilotEyebrow")}
            </Badge>
            <CardTitle className="mt-2 text-2xl">{t("home.pilotTitle")}</CardTitle>
            <CardDescription>{t("home.pilotDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonLink href="/contact" variant="outline">
              {t("home.pilotCta")}
              <ArrowRight data-icon="inline-end" />
            </ButtonLink>
          </CardContent>
        </Card>
      </section>
    </>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border p-3">
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function ButtonLink({
  children,
  className,
  href,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  href: string
  variant?: "default" | "outline"
}) {
  return (
    <Button
      asChild
      className={`w-full sm:w-fit ${className ?? ""}`}
      variant={variant}
    >
      <Link href={href}>{children}</Link>
    </Button>
  )
}
