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
import type { LedgerEntry } from "@/lib/supabase/types"

import { formatCurrency } from "../shared/format"
import { MetricCard } from "../shared/metric-card"

export function LedgerDashboard({ entries }: { entries: LedgerEntry[] }) {
  const receivable = entries
    .filter((entry) => entry.entry_type === "receivable")
    .reduce((total, entry) => total + Number(entry.amount), 0)
  const payable = entries
    .filter((entry) => ["payable", "expense"].includes(entry.entry_type))
    .reduce((total, entry) => total + Number(entry.amount), 0)

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Receivable"
          note="Money expected"
          value={formatCurrency(receivable)}
        />
        <MetricCard
          label="Payable/expense"
          note="Money to settle"
          value={formatCurrency(payable)}
        />
        <MetricCard
          label="Open entries"
          note="Ledger records"
          value={String(entries.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger entries</CardTitle>
          <CardDescription>
            Receivable, payable, and expense entries for the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.note}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.entry_type}</Badge>
                    </TableCell>
                    <TableCell>{entry.due_date ?? "today"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(entry.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No ledger entries</EmptyTitle>
                <EmptyDescription>
                  Add receivable, payable, or expense entries to track accounts.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </>
  )
}
