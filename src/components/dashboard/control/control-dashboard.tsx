import { toggleMenuItemAction } from "@/app/actions/workspace-operations"
import { PackageCheck, PackageX } from "lucide-react"

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

import { formatCurrency } from "../shared/format"
import { MetricCard } from "../shared/metric-card"
import { VendorAppearanceForm } from "./vendor-appearance-form"

function AvailabilityAction({
  compact = false,
  inStock,
  menuItemId,
  vendorSlug,
}: {
  compact?: boolean
  inStock: boolean
  menuItemId: string
  vendorSlug: string
}) {
  const label = inStock ? "Mark unavailable" : "Mark in stock"
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
  const currentAccent = normalizeVendorAccent(vendor.brand_color)
  const currentHeadingFont = vendor.heading_font === "serif" ? "serif" : "sans"

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Menu items"
          note="Visible in counter orders"
          value={String(menuItems.length)}
        />
        <MetricCard
          label="In stock"
          note="Visible to counter staff"
          value={String(menuItems.filter((item) => item.in_stock).length)}
        />
        <MetricCard
          label="Unavailable"
          note="Hidden from ordering"
          value={String(menuItems.filter((item) => !item.in_stock).length)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu availability</CardTitle>
          <CardDescription>
            Toggle items during rush hours without editing the whole menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length ? (
            <>
              <div className="md:hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-normal">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.menu_categories?.name ?? "Menu"} · {formatCurrency(Number(item.price))}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant={item.in_stock ? "secondary" : "outline"}>
                              {item.in_stock ? "In stock" : "Off"}
                            </Badge>
                            <AvailabilityAction
                              compact
                              inStock={item.in_stock}
                              menuItemId={item.id}
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
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.menu_categories?.name ?? "Menu"}</TableCell>
                        <TableCell>{formatCurrency(Number(item.price))}</TableCell>
                        <TableCell>
                          <Badge variant={item.in_stock ? "secondary" : "outline"}>
                            {item.in_stock ? "In stock" : "Off"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AvailabilityAction
                            inStock={item.in_stock}
                            menuItemId={item.id}
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
                <EmptyTitle>No menu items</EmptyTitle>
                <EmptyDescription>
                  Add menu items before managing availability.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Brand appearance</CardTitle>
            <CardDescription>
              Apply a focused vendor accent and heading style without replacing
              the platform identity.
            </CardDescription>
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
            <CardTitle>Workspace mark</CardTitle>
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
              The accent is reserved for vendor identity and selected
              operational highlights. Navigation, cards, and core controls keep
              the platform appearance consistent.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
