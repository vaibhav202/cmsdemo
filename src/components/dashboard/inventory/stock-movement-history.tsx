import { Badge } from "@/components/ui/badge"
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

const movementTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
})

export function StockMovementHistory({
  stockItems,
  stockLog,
}: {
  stockItems: StockItem[]
  stockLog: StockLog[]
}) {
  const itemById = new Map(stockItems.map((item) => [item.id, item]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent movements</CardTitle>
        <CardDescription>
          Latest purchases, usage, wastage, and opening balances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stockLog.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="hidden sm:table-cell">Recorded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockLog.map((entry) => {
                const item = itemById.get(entry.stock_item_id)
                const delta = Number(entry.quantity_delta)

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {item?.name ?? "Removed ingredient"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={delta < 0 ? "outline" : "secondary"}>
                        {delta > 0 ? "+" : ""}
                        {entry.quantity_delta} {item?.unit ?? ""}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.reason}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {movementTime.format(new Date(entry.created_at))}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No stock movements</EmptyTitle>
              <EmptyDescription>
                Purchases and ingredient usage will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
