import type { StockItem, StockLog } from "@/lib/supabase/types"

import { MetricCard } from "../shared/metric-card"
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
  const lowStock = stockItems.filter(
    (item) => Number(item.current_qty) <= Number(item.reorder_level)
  )
  const canMutateInventory = canManageItems && canRecordMovements

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Ingredients"
          note="Tracked in the stock register"
          value={String(stockItems.length)}
        />
        <MetricCard
          label="Low stock"
          note="At or below reorder level"
          value={String(lowStock.length)}
        />
        <MetricCard
          label="Healthy"
          note="Above reorder level"
          value={String(stockItems.length - lowStock.length)}
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
