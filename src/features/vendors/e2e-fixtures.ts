import type { VendorDashboardData } from "@/features/vendors/data"

const createdAt = "2026-07-28T12:00:00.000Z"
const vendorId = "20000000-0000-0000-0000-000000000001"

export const e2eVendorDashboardData = {
  categories: [
    {
      created_at: createdAt,
      id: "60000000-0000-0000-0000-000000000001",
      name: "Meals",
      sort_order: 1,
      vendor_id: vendorId,
    },
  ],
  ledger: [],
  menuItems: [
    {
      category_id: "60000000-0000-0000-0000-000000000001",
      cost_price: 45,
      created_at: createdAt,
      description: "Firefox test fixture",
      id: "70000000-0000-0000-0000-000000000001",
      image_url: null,
      in_stock: true,
      menu_categories: { name: "Meals" },
      name: "Test meal",
      price: 90,
      sort_order: 1,
      updated_at: createdAt,
      vendor_id: vendorId,
    },
  ],
  orders: [
    {
      created_at: createdAt,
      customer_label: "Counter 1",
      id: "80000000-0000-0000-0000-000000000001",
      order_items: [
        {
          created_at: createdAt,
          id: "90000000-0000-0000-0000-000000000001",
          item_name_snapshot: "Test meal",
          menu_item_id: "70000000-0000-0000-0000-000000000001",
          order_id: "80000000-0000-0000-0000-000000000001",
          price_at_time: 90,
          quantity: 1,
        },
      ],
      payment_status: "paid",
      source: "counter",
      status: "paid",
      token_no: 101,
      total: 90,
      updated_at: createdAt,
      vendor_id: vendorId,
    },
  ],
  stockItems: [
    {
      created_at: createdAt,
      current_qty: 10,
      id: "a0000000-0000-0000-0000-000000000001",
      name: "Test ingredient",
      reorder_level: 2,
      unit: "kg",
      updated_at: createdAt,
      vendor_id: vendorId,
    },
  ],
  stockLog: [],
  vendor: {
    brand_color: "#2563eb",
    created_at: createdAt,
    heading_font: "sans",
    id: vendorId,
    location: "Pune, Maharashtra",
    logo_asset_id: null,
    logo_url: null,
    name: "City Canteen",
    plan: "Basic",
    slug: "city-canteen",
    status: "active",
    updated_at: createdAt,
  },
} satisfies VendorDashboardData

