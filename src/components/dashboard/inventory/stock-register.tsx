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
import type { StockItem } from "@/lib/supabase/types"

export function StockRegister({ stockItems }: { stockItems: StockItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock register</CardTitle>
        <CardDescription>
          Live quantity and reorder threshold for each ingredient.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stockItems.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Reorder at</TableHead>
                <TableHead>Status</TableHead>
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
                      {item.current_qty} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.reorder_level} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isLow ? "destructive" : "secondary"}>
                        {isLow ? "Low" : "OK"}
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
              <EmptyTitle>No ingredients</EmptyTitle>
              <EmptyDescription>
                Add the first ingredient to begin tracking stock.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
