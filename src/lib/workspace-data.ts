import type { MembershipStatus, ModuleKey, VendorRole } from "@/lib/permissions"

export const workspaceVendor = {
  id: "vendor_pune_001",
  name: "City Canteen",
  slug: "city-canteen",
  plan: "Essential",
  status: "active",
  location: "Pune, Maharashtra",
}

export type WorkspaceAccount = {
  id: string
  email: string
  password: string
  name: string
  role: VendorRole
  status: MembershipStatus
}

export const workspaceAccounts: WorkspaceAccount[] = [
  {
    id: "owner",
    email: "owner@citycanteen.in",
    password: "Owner@2026",
    name: "Vendor Owner",
    role: "owner",
    status: "active",
  },
  {
    id: "cashier",
    email: "cashier@citycanteen.in",
    password: "Cashier@2026",
    name: "Counter Cashier",
    role: "cashier",
    status: "active",
  },
  {
    id: "kitchen",
    email: "kitchen@citycanteen.in",
    password: "Kitchen@2026",
    name: "Kitchen Staff",
    role: "kitchen",
    status: "active",
  },
  {
    id: "accountant",
    email: "accounts@citycanteen.in",
    password: "Accounts@2026",
    name: "Accounts User",
    role: "accountant",
    status: "active",
  },
]

export const moduleLabels: Record<
  ModuleKey,
  {
    title: string
    description: string
  }
> = {
  order: {
    title: "Order Dashboard",
    description: "Create counter orders, confirm payment, and hand off tickets.",
  },
  kitchen: {
    title: "Kitchen Dashboard",
    description: "Track items that need preparation and move orders forward.",
  },
  queue: {
    title: "Queue Dashboard",
    description: "Show live order status for staff or customer-facing screens.",
  },
  control: {
    title: "Control Dashboard",
    description: "Manage menu, staff access, vendor settings, and audit checks.",
  },
  inventory: {
    title: "Inventory",
    description: "Monitor stock quantity, low-stock warnings, and daily usage.",
  },
  ledger: {
    title: "Ledger",
    description: "Track receivables, payables, expenses, and settlement notes.",
  },
  reports: {
    title: "Reports",
    description: "Review sales, estimated margins, completed orders, and stock alerts.",
  },
}
