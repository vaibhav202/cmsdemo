"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

import { isActiveOrder } from "@/components/dashboard/shared/format"
import type { OrderWithItems } from "@/lib/supabase/types"

type ActiveOrdersContextValue = {
  activeOrders: OrderWithItems[]
  activeOrdersCount: number
  isOpen: boolean
  orders: OrderWithItems[]
  setIsOpen: (open: boolean) => void
  toggle: () => void
  vendorSlug: string
}

const ActiveOrdersContext = createContext<ActiveOrdersContextValue | null>(null)

export function ActiveOrdersProvider({
  children,
  orders = [],
  vendorSlug,
}: {
  children: ReactNode
  orders: OrderWithItems[]
  vendorSlug: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const activeOrders = orders.filter(isActiveOrder)

  function toggle() {
    setIsOpen((previous) => !previous)
  }

  return (
    <ActiveOrdersContext.Provider
      value={{
        activeOrders,
        activeOrdersCount: activeOrders.length,
        isOpen,
        orders,
        setIsOpen,
        toggle,
        vendorSlug,
      }}
    >
      {children}
    </ActiveOrdersContext.Provider>
  )
}

export function useActiveOrders() {
  const context = useContext(ActiveOrdersContext)
  if (!context) {
    throw new Error("useActiveOrders must be used within an ActiveOrdersProvider")
  }
  return context
}
