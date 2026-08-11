import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
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
import type { StockItem } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"

export function StockRegister({ stockItems }: { stockItems: StockItem[] }) {
  const t = useTranslations("Inventory")
  const format = useDashboardFormats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("registerTitle")}</CardTitle>
        <CardDescription>{t("registerDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {stockItems.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ingredient")}</TableHead>
                <TableHead>{t("currentColumn")}</TableHead>
                <TableHead>{t("reorderColumn")}</TableHead>
                <TableHead>{t("statusColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item) => {
                const isLow =
                  Number(item.current_qty) <= Number(item.reorder_level)

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {format.quantity(Number(item.current_qty))} {item.unit}
                    </TableCell>
                    <TableCell>
                      {format.quantity(Number(item.reorder_level))} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isLow ? "destructive" : "secondary"}>
                        {isLow ? t("low") : t("ok")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("emptyRegisterTitle")}</EmptyTitle>
              <EmptyDescription>
                {t("emptyRegisterDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
