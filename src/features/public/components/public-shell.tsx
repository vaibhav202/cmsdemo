import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight, Store } from "lucide-react"

import { AccessibilityMenu } from "@/components/accessibility/accessibility-control"
import { LanguageMenu } from "@/components/shell/language-control"
import { ThemeModeControl } from "@/components/shell/theme-mode-control"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { platformBrand } from "@/features/vendors/brand"

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Public")

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            aria-label={t("nav.home")}
            className="flex min-w-0 items-center gap-2.5"
            href="/"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Store />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-heading text-sm font-semibold">
                {platformBrand.name}
              </span>
              <span className="hidden truncate text-xs text-muted-foreground sm:block">
                {t("nav.tagline")}
              </span>
            </span>
          </Link>

          <nav
            aria-label={t("nav.label")}
            className="ml-auto hidden items-center gap-1 md:flex"
          >
            <Link
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href="/demo"
            >
              {t("nav.demo")}
            </Link>
            <Link
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href="/contact"
            >
              {t("nav.contact")}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            <LanguageMenu compact />
            <ThemeModeControl />
            <AccessibilityMenu />
            <Button asChild className="hidden sm:inline-flex" size="sm">
              <Link href="/login">
                {t("nav.login")}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <Separator />
        <div className="flex flex-col justify-between gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>{t("footer.tagline")}</p>
          <nav aria-label={t("footer.label")} className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="hover:text-foreground" href="/contact">
              {t("footer.contact")}
            </Link>
            <Link className="hover:text-foreground" href="/terms">
              {t("footer.terms")}
            </Link>
            <Link className="hover:text-foreground" href="/privacy">
              {t("footer.privacy")}
            </Link>
            <Link className="hover:text-foreground" href="/login">
              {t("footer.login")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
