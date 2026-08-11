import { Badge } from "@/components/ui/badge"
import { useFormatter, useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StockItem, StockLog } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"

export function StockMovementHistory({
  stockItems,
  stockLog,
}: {
  stockItems: StockItem[]
  stockLog: StockLog[]
}) {
  const t = useTranslations("Inventory")
  const format = useFormatter()
  const dashboardFormat = useDashboardFormats()
  const itemById = new Map(stockItems.map((item) => [item.id, item]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("historyTitle")}</CardTitle>
        <CardDescription>{t("historyDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {stockLog.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ingredient")}</TableHead>
                <TableHead>{t("changeColumn")}</TableHead>
                <TableHead>{t("reasonColumn")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("recordedColumn")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockLog.map((entry) => {
                const item = itemById.get(entry.stock_item_id)
                const delta = Number(entry.quantity_delta)

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {item?.name ?? t("removedIngredient")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={delta < 0 ? "outline" : "secondary"}>
                        {delta > 0 ? "+" : ""}
                        {dashboardFormat.quantity(delta)} {item?.unit ?? ""}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.reason}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format.dateTime(new Date(entry.created_at), "movement")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("emptyHistoryTitle")}</EmptyTitle>
              <EmptyDescription>{t("emptyHistoryDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
