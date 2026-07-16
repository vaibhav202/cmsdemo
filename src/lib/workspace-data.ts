import type { MembershipStatus, VendorRole } from "@/lib/permissions"

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
