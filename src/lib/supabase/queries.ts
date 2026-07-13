import { unstable_noStore as noStore } from "next/cache"

import {
  DataServiceError,
  VendorNotFoundError,
} from "@/lib/supabase/errors"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type {
  LedgerEntry,
  MenuCategory,
  MenuItemWithCategory,
  OrderWithItems,
  StockItem,
  StockLog,
  Vendor,
} from "@/lib/supabase/types"

export type VendorDashboardData = {
  vendor: Vendor
  categories: MenuCategory[]
  menuItems: MenuItemWithCategory[]
  orders: OrderWithItems[]
  stockItems: StockItem[]
  stockLog: StockLog[]
  ledger: LedgerEntry[]
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) {
    throw new DataServiceError(context, error.message)
  }
}

export async function getVendorBySlug(slug: string) {
  noStore()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  throwIfError(error, "Unable to load vendor")

  if (!data) {
    throw new VendorNotFoundError(slug)
  }

  return data as Vendor
}

export async function getVendorDashboardData(
  slug: string
): Promise<VendorDashboardData> {
  noStore()
  const supabase = await createSupabaseServerClient()

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  throwIfError(vendorError, "Unable to load vendor")

  if (!vendor) {
    throw new VendorNotFoundError(slug)
  }

  const [
    categoriesResult,
    menuItemsResult,
    ordersResult,
    stockItemsResult,
    stockLogResult,
    ledgerResult,
  ] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*, menu_categories(name)")
      .eq("vendor_id", vendor.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("stock_items")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("name", { ascending: true }),
    supabase
      .from("stock_log")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("ledger_entries")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ])

  throwIfError(categoriesResult.error, "Unable to load categories")
  throwIfError(menuItemsResult.error, "Unable to load menu")
  throwIfError(ordersResult.error, "Unable to load orders")
  throwIfError(stockItemsResult.error, "Unable to load stock")
  throwIfError(stockLogResult.error, "Unable to load stock log")
  throwIfError(ledgerResult.error, "Unable to load ledger")

  return {
    vendor: vendor as Vendor,
    categories: categoriesResult.data as MenuCategory[],
    menuItems: menuItemsResult.data as MenuItemWithCategory[],
    orders: ordersResult.data as OrderWithItems[],
    stockItems: stockItemsResult.data as StockItem[],
    stockLog: stockLogResult.data as StockLog[],
    ledger: ledgerResult.data as LedgerEntry[],
  }
}
