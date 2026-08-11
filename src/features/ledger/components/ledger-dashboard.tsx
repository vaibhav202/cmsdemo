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
import type { LedgerEntry } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { MetricCard } from "@/components/dashboard/shared/metric-card"

const entryTypeKeys = {
  receivable: "entryTypes.receivable",
  payable: "entryTypes.payable",
  expense: "entryTypes.expense",
} as const

export function LedgerDashboard({ entries }: { entries: LedgerEntry[] }) {
  const t = useTranslations("Ledger")
  const format = useDashboardFormats()
  const intlFormat = useFormatter()
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
          label={t("receivable")}
          note={t("receivableNote")}
          value={format.currency(receivable)}
        />
        <MetricCard
          label={t("payable")}
          note={t("payableNote")}
          value={format.currency(payable)}
        />
        <MetricCard
          label={t("open")}
          note={t("openNote")}
          value={format.integer(entries.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("noteColumn")}</TableHead>
                  <TableHead>{t("typeColumn")}</TableHead>
                  <TableHead>{t("dueColumn")}</TableHead>
                  <TableHead className="text-right">
                    {t("amountColumn")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const entryTypeKey =
                    entryTypeKeys[
                      entry.entry_type as keyof typeof entryTypeKeys
                    ]

                  return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.note}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entryTypeKey ? t(entryTypeKey) : entry.entry_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.due_date
                        ? intlFormat.dateTime(
                            new Date(`${entry.due_date}T00:00:00+05:30`),
                            "dateOnly"
                          )
                        : t("today")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {format.currency(Number(entry.amount))}
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </>
  )
}
