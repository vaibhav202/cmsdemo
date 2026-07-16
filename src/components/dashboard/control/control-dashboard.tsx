import { toggleMenuItemAction } from "@/app/actions/workspace-operations"
import { PackageCheck, PackageX } from "lucide-react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { normalizeVendorAccent } from "@/lib/brand"
import type { MenuItemWithCategory, Vendor } from "@/lib/supabase/types"

import { useDashboardFormats } from "../shared/format"
import { MetricCard } from "../shared/metric-card"
import { VendorAppearanceForm } from "./vendor-appearance-form"

function AvailabilityAction({
  compact = false,
  inStock,
  menuItemId,
  menuItemName,
  vendorSlug,
}: {
  compact?: boolean
  inStock: boolean
  menuItemId: string
  menuItemName: string
  vendorSlug: string
}) {
  const t = useTranslations("Control")
  const label = inStock
    ? t("markUnavailable", { item: menuItemName })
    : t("markAvailable", { item: menuItemName })
  const Icon = inStock ? PackageX : PackageCheck

  const form = (
    <form action={toggleMenuItemAction}>
      <input name="vendorSlug" type="hidden" value={vendorSlug} />
      <input name="menuItemId" type="hidden" value={menuItemId} />
      <input name="nextStockState" type="hidden" value={String(!inStock)} />
      <Button
        aria-label={label}
        className={compact ? "size-11" : undefined}
        size={compact ? "icon" : "sm"}
        type="submit"
        variant="outline"
      >
        {compact ? <Icon /> : label}
      </Button>
    </form>
  )

  if (!compact) return form

  return (
    <Tooltip>
      <TooltipTrigger asChild>{form}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function ControlDashboard({
  menuItems,
  vendor,
  vendorSlug,
}: {
  menuItems: MenuItemWithCategory[]
  vendor: Vendor
  vendorSlug: string
}) {
  const t = useTranslations("Control")
  const order = useTranslations("Order")
  const format = useDashboardFormats()
  const currentAccent = normalizeVendorAccent(vendor.brand_color)
  const currentHeadingFont = vendor.heading_font === "serif" ? "serif" : "sans"

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("metrics.items")}
          note={t("metrics.itemsNote")}
          value={format.integer(menuItems.length)}
        />
        <MetricCard
          label={t("metrics.inStock")}
          note={t("metrics.inStockNote")}
          value={format.integer(
            menuItems.filter((item) => item.in_stock).length
          )}
        />
        <MetricCard
          label={t("metrics.unavailable")}
          note={t("metrics.unavailableNote")}
          value={format.integer(
            menuItems.filter((item) => !item.in_stock).length
          )}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("availabilityTitle")}</CardTitle>
          <CardDescription>{t("availabilityDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length ? (
            <>
              <div className="md:hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("itemColumn")}</TableHead>
                      <TableHead className="text-right">
                        {t("availabilityColumn")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-normal">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.menu_categories?.name ?? order("menuFallback")} ·{" "}
                            {format.currency(Number(item.price))}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant={item.in_stock ? "secondary" : "outline"}>
                              {item.in_stock ? order("inStock") : order("off")}
                            </Badge>
                            <AvailabilityAction
                              compact
                              inStock={item.in_stock}
                              menuItemId={item.id}
                              menuItemName={item.name}
                              vendorSlug={vendorSlug}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("itemColumn")}</TableHead>
                      <TableHead>{t("categoryColumn")}</TableHead>
                      <TableHead>{t("priceColumn")}</TableHead>
                      <TableHead>{t("statusColumn")}</TableHead>
                      <TableHead className="text-right">
                        {t("actionColumn")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {item.menu_categories?.name ?? order("menuFallback")}
                        </TableCell>
                        <TableCell>{format.currency(Number(item.price))}</TableCell>
                        <TableCell>
                          <Badge variant={item.in_stock ? "secondary" : "outline"}>
                            {item.in_stock ? order("inStock") : order("off")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AvailabilityAction
                            inStock={item.in_stock}
                            menuItemId={item.id}
                            menuItemName={item.name}
                            vendorSlug={vendorSlug}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{t("appearanceTitle")}</CardTitle>
            <CardDescription>{t("appearanceDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <VendorAppearanceForm
              currentAccent={currentAccent}
              currentHeadingFont={currentHeadingFont}
              key={`${currentAccent}-${currentHeadingFont}`}
              vendorId={vendor.id}
              vendorSlug={vendorSlug}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("workspaceMark")}</CardTitle>
            <CardDescription>{vendor.name}</CardDescription>
            <CardAction>
              <Avatar size="lg">
                <AvatarFallback className="bg-vendor-brand text-vendor-brand-foreground">
                  {vendor.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("workspaceMarkDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
