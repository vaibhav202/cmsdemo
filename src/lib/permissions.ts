export type VendorRole =
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "kitchen"
  | "accountant"

export type MembershipStatus = "active" | "invited" | "disabled"

export type ModuleKey =
  | "order"
  | "kitchen"
  | "queue"
  | "control"
  | "inventory"
  | "ledger"
  | "reports"

const moduleRoles: Record<ModuleKey, VendorRole[]> = {
  order: ["owner", "admin", "manager", "cashier"],
  kitchen: ["owner", "admin", "manager", "kitchen"],
  queue: ["owner", "admin", "manager", "cashier", "kitchen"],
  control: ["owner", "admin", "manager"],
  inventory: ["owner", "admin", "manager", "kitchen"],
  ledger: ["owner", "admin", "accountant"],
  reports: ["owner", "admin", "manager", "accountant"],
}

const stockManagerRoles: VendorRole[] = ["owner", "admin", "manager"]

export function canAccessModule(role: VendorRole, module: ModuleKey) {
  return moduleRoles[module].includes(role)
}

export function canManageStockItems(role: VendorRole) {
  return stockManagerRoles.includes(role)
}

export function canRecordStockMovement(role: VendorRole) {
  return stockManagerRoles.includes(role)
}

export function getDefaultModuleForRole(role: VendorRole): ModuleKey {
  if (role === "kitchen") return "kitchen"
  if (role === "accountant") return "reports"
  return "order"
}

export function getModuleHref(vendorSlug: string, module: ModuleKey) {
  return `/app/${vendorSlug}/${module}`
}

export function getDefaultRouteForRole(role: VendorRole, vendorSlug: string) {
  return getModuleHref(vendorSlug, getDefaultModuleForRole(role))
}

export function getAllowedModules(role: VendorRole) {
  return (Object.keys(moduleRoles) as ModuleKey[]).filter((module) =>
    canAccessModule(role, module)
  )
}
