import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { getLocale } from "next-intl/server"

import { ControlDashboard } from "@/components/dashboard/control/control-dashboard"
import { InventoryDashboard } from "@/components/dashboard/inventory/inventory-dashboard"
import { KitchenDashboard } from "@/components/dashboard/kitchen/kitchen-dashboard"
import { LedgerDashboard } from "@/components/dashboard/ledger/ledger-dashboard"
import { OrderDashboard } from "@/components/dashboard/order/order-dashboard"
import { QueueDashboard } from "@/components/dashboard/queue/queue-dashboard"
import { ReportsDashboard } from "@/components/dashboard/reports/reports-dashboard"
import { DashboardHeader } from "@/components/dashboard/shared/dashboard-header"
import { WorkspaceInfoCards } from "@/components/dashboard/shared/workspace-info-cards"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  canAccessModule,
  canManageStockItems,
  canRecordStockMovement,
  type ModuleKey,
} from "@/lib/permissions"
import { getVendorDashboardData } from "@/lib/supabase/queries"
import { getCurrentWorkspaceSession } from "@/lib/workspace-auth"

type ModulePageProps = {
  module: ModuleKey
  vendorSlug: string
}

function AccessDenied({ module }: { module: ModuleKey }) {
  const t = useTranslations("Module")

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4">
      <Badge variant="destructive">{t("accessDenied")}</Badge>
      <Card>
        <CardHeader>
          <CardTitle>{t(`${module}.title`)}</CardTitle>
          <CardDescription>{t("accessDeniedDescription")}</CardDescription>
          <CardAction>
            <AlertTriangle />
          </CardAction>
        </CardHeader>
      </Card>
    </section>
  )
}

export async function ModulePage({ module, vendorSlug }: ModulePageProps) {
  const session = await getCurrentWorkspaceSession()

  if (!session || !canAccessModule(session.user.role, module)) {
    return <AccessDenied module={module} />
  }

  const [data, locale] = await Promise.all([
    getVendorDashboardData(vendorSlug),
    getLocale(),
  ])

  return (
    <section className="flex flex-col gap-6" key={locale}>
      <DashboardHeader module={module} vendorName={data.vendor.name} />

      {module === "order" ? (
        <OrderDashboard
          menuItems={data.menuItems}
          orders={data.orders}
          vendorId={data.vendor.id}
          vendorSlug={vendorSlug}
        />
      ) : null}

      {module === "kitchen" ? (
        <KitchenDashboard orders={data.orders} vendorSlug={vendorSlug} />
      ) : null}

      {module === "queue" ? <QueueDashboard orders={data.orders} /> : null}

      {module === "control" ? (
        <ControlDashboard
          menuItems={data.menuItems}
          vendor={data.vendor}
          vendorSlug={vendorSlug}
        />
      ) : null}

      {module === "inventory" ? (
        <InventoryDashboard
          canManageItems={canManageStockItems(session.user.role)}
          canRecordMovements={canRecordStockMovement(session.user.role)}
          stockItems={data.stockItems}
          stockLog={data.stockLog}
          vendorId={data.vendor.id}
          vendorSlug={vendorSlug}
        />
      ) : null}

      {module === "ledger" ? <LedgerDashboard entries={data.ledger} /> : null}

      {module === "reports" ? (
        <ReportsDashboard
          menuItems={data.menuItems}
          orders={data.orders}
          stockItems={data.stockItems}
        />
      ) : null}

      <WorkspaceInfoCards role={session.user.role} />
    </section>
  )
}
