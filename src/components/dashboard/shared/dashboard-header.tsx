import { moduleLabels } from "@/lib/workspace-data"
import type { ModuleKey } from "@/lib/permissions"

export function DashboardHeader({
  module,
  vendorName,
}: {
  module: ModuleKey
  vendorName: string
}) {
  const label = moduleLabels[module]

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {label.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {vendorName} · {label.description}
        </p>
      </div>
    </div>
  )
}
