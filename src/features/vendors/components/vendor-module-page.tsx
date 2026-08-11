import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { getLocale } from "next-intl/server"

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
} from "@/features/memberships/permissions"
import { InventoryDashboard } from "@/features/inventory/components/inventory-dashboard"
import { KitchenDashboard } from "@/features/kitchen/components/kitchen-dashboard"
import { LedgerDashboard } from "@/features/ledger/components/ledger-dashboard"
import { OrderDashboard } from "@/features/orders/components/order-dashboard"
import { QueueDashboard } from "@/features/queue/components/queue-dashboard"
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard"
import { getCurrentWorkspaceSession } from "@/features/auth/demo-session"
import { ControlDashboard } from "@/features/vendors/components/control-dashboard"
import { getVendorDashboardData } from "@/features/vendors/data"
import { getCurrentMemberMedia } from "@/lib/media/assets"
import type { MediaUploadMode } from "@/lib/media/config"

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
  const currentMemberMedia =
    module === "control"
      ? await getCurrentMemberMedia(data.vendor.id)
      : null
  const mediaMode: MediaUploadMode =
    process.env.NODE_ENV === "production" ? "production" : "demo"

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
          mediaMode={mediaMode}
          mediaUploadsEnabled={currentMemberMedia !== null}
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
