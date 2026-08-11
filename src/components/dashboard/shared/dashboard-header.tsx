import { useTranslations } from "next-intl"

import type { ModuleKey } from "@/features/memberships/permissions"

export function DashboardHeader({
  module,
  vendorName,
}: {
  module: ModuleKey
  vendorName: string
}) {
  const t = useTranslations("Module")

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t(`${module}.title`)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {vendorName} · {t(`${module}.description`)}
        </p>
      </div>
    </div>
  )
}
