import { CheckCircle2, Database, LockKeyhole } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { VendorRole } from "@/features/memberships/permissions"

export function WorkspaceInfoCards({ role }: { role: VendorRole }) {
  const t = useTranslations("Module.info")
  const common = useTranslations("Common")

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>{t("connectedTitle")}</CardTitle>
          <CardDescription>{t("connectedDescription")}</CardDescription>
          <CardAction>
            <Database />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("permissionsTitle")}</CardTitle>
          <CardDescription>
            {t("permissionsDescription", {
              role: common(`roles.${role}`),
            })}
          </CardDescription>
          <CardAction>
            <LockKeyhole />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("operationsTitle")}</CardTitle>
          <CardDescription>{t("operationsDescription")}</CardDescription>
          <CardAction>
            <CheckCircle2 />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
