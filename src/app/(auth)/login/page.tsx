import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { LoginForm } from "@/app/(auth)/login/login-form"
import { LanguageMenu } from "@/components/shell/language-control"
import { ThemeModeControl } from "@/components/shell/theme-mode-control"
import { AccessibilityMenu } from "@/components/accessibility/accessibility-control"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { platformBrand } from "@/lib/brand"
import { workspaceAccounts, workspaceVendor } from "@/lib/workspace-data"
import { getCurrentWorkspaceSession } from "@/lib/workspace-auth"
import { getDefaultRouteForRole } from "@/lib/permissions"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return { title: t("loginTitle") }
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, locale, t, common] = await Promise.all([
    getCurrentWorkspaceSession(),
    getLocale(),
    getTranslations("Auth"),
    getTranslations("Common"),
  ])

  if (session) {
    redirect(getDefaultRouteForRole(session.user.role, session.vendor.slug))
  }

  const { next } = await searchParams
  const features = [
    [t("features.counterLabel"), t("features.counterValue")],
    [t("features.kitchenLabel"), t("features.kitchenValue")],
    [t("features.ownerLabel"), t("features.ownerValue")],
  ]

  return (
    <main className="min-h-svh px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-2.5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="flex flex-col gap-7">
          <div className="flex flex-wrap justify-end gap-2 lg:hidden">
            <LanguageMenu />
            <ThemeModeControl />
            <AccessibilityMenu />
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className="size-10 justify-center rounded-lg"
              variant="default"
            >
              <ShieldCheck />
            </Badge>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("workspaceEyebrow", { vendor: workspaceVendor.name })}
              </p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {platformBrand.name}
              </h1>
            </div>
          </div>
          <div className="flex max-w-2xl flex-col gap-4">
            <Badge variant="outline">{t("productBadge")}</Badge>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("hero")}
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {t("description", { tagline: t("tagline") })}
            </p>
          </div>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            {features.map(([label, value]) => (
              <Card key={label} size="sm">
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle>{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="hidden flex-wrap justify-end gap-2 lg:flex">
            <LanguageMenu />
            <ThemeModeControl />
            <AccessibilityMenu />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("cardTitle")}</CardTitle>
              <CardDescription>{t("cardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm key={locale} next={next} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("rolesTitle")}</CardTitle>
              <CardDescription>{t("rolesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("userColumn")}</TableHead>
                    <TableHead>{t("roleColumn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaceAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {common(`roles.${account.role}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
