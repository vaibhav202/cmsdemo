import { useTranslations } from "next-intl"

import type { StockItem, StockLog } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { MetricCard } from "@/components/dashboard/shared/metric-card"
import { InventoryActionForms } from "./inventory-action-forms"
import { StockMovementHistory } from "./stock-movement-history"
import { StockRegister } from "./stock-register"

type InventoryDashboardProps = {
  canManageItems: boolean
  canRecordMovements: boolean
  stockItems: StockItem[]
  stockLog: StockLog[]
  vendorId: string
  vendorSlug: string
}

export function InventoryDashboard({
  canManageItems,
  canRecordMovements,
  stockItems,
  stockLog,
  vendorId,
  vendorSlug,
}: InventoryDashboardProps) {
  const t = useTranslations("Inventory")
  const format = useDashboardFormats()
  const lowStock = stockItems.filter(
    (item) => Number(item.current_qty) <= Number(item.reorder_level)
  )
  const canMutateInventory = canManageItems && canRecordMovements

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("metrics.ingredients")}
          note={t("metrics.ingredientsNote")}
          value={format.integer(stockItems.length)}
        />
        <MetricCard
          label={t("metrics.low")}
          note={t("metrics.lowNote")}
          value={format.integer(lowStock.length)}
        />
        <MetricCard
          label={t("metrics.healthy")}
          note={t("metrics.healthyNote")}
          value={format.integer(stockItems.length - lowStock.length)}
        />
      </div>

      {canMutateInventory ? (
        <InventoryActionForms
          stockItems={stockItems}
          vendorId={vendorId}
          vendorSlug={vendorSlug}
        />
      ) : null}

      <StockRegister stockItems={stockItems} />
      <StockMovementHistory stockItems={stockItems} stockLog={stockLog} />
    </>
  )
}
