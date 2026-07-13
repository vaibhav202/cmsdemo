import { CheckCircle2, Database, LockKeyhole } from "lucide-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { VendorRole } from "@/lib/permissions"

export function WorkspaceInfoCards({ role }: { role: VendorRole }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Connected workspace</CardTitle>
          <CardDescription>
            Orders, menu availability, stock, ledger, and reports update from
            the same source of truth.
          </CardDescription>
          <CardAction>
            <Database />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Staff permissions</CardTitle>
          <CardDescription>
            Current role: {role}. Navigation and actions are scoped to the work
            this role should perform.
          </CardDescription>
          <CardAction>
            <LockKeyhole />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Daily operations</CardTitle>
          <CardDescription>
            Orders, queue, menu, stock, ledger, and owner reports stay in one
            vendor workspace.
          </CardDescription>
          <CardAction>
            <CheckCircle2 />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
