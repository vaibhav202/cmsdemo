import type { ComponentType } from "react"
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  MonitorUp,
  Warehouse,
} from "lucide-react"

import type { ModuleKey } from "@/features/memberships/permissions"

export type NavIcon = ComponentType<{
  className?: string
  "data-icon"?: string
}>

export const navIcons = {
  order: ClipboardList,
  kitchen: ChefHat,
  queue: MonitorUp,
  control: LayoutDashboard,
  inventory: Warehouse,
  ledger: BookOpenCheck,
  reports: ChartNoAxesCombined,
} satisfies Record<ModuleKey, NavIcon>
