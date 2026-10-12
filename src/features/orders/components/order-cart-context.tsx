"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

import type { MenuItemWithCategory } from "@/lib/supabase/types"

import {
  changeCartLineQuantity,
  mergeCartLine,
  removeCartLine,
} from "../commands"

export type OrderCartLine = {
  item: MenuItemWithCategory
  quantity: number
}

type OrderCartContextValue = {
  addItem: (item: MenuItemWithCategory, quantity: number) => void
  changeQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  lines: OrderCartLine[]
  openCart: () => void
  removeItem: (menuItemId: string) => void
  setIsOpen: (open: boolean) => void
  toggleCart: () => void
  totalQuantity: number
}

const OrderCartContext = createContext<OrderCartContextValue | null>(null)

export function OrderCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<OrderCartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  function addItem(item: MenuItemWithCategory, quantity: number) {
    setLines((currentLines) =>
      mergeCartLine(currentLines, { item, quantity }, (line) => line.item.id)
    )
  }

  function changeQuantity(menuItemId: string, quantity: number) {
    setLines((currentLines) =>
      changeCartLineQuantity(currentLines, menuItemId, quantity, (line) =>
        line.item.id
      )
    )
  }

  function removeItem(menuItemId: string) {
    setLines((currentLines) =>
      removeCartLine(currentLines, menuItemId, (line) => line.item.id)
    )
  }

  function clearCart() {
    setLines([])
  }

  function openCart() {
    setIsOpen(true)
  }

  function toggleCart() {
    setIsOpen((previous) => !previous)
  }

  const totalQuantity = lines.reduce((total, line) => total + line.quantity, 0)

  return (
    <OrderCartContext.Provider
      value={{
        addItem,
        changeQuantity,
        clearCart,
        isOpen,
        lines,
        openCart,
        removeItem,
        setIsOpen,
        toggleCart,
        totalQuantity,
      }}
    >
      {children}
    </OrderCartContext.Provider>
  )
}

export function useOrderCart() {
  const context = useContext(OrderCartContext)
  if (!context) {
    throw new Error("useOrderCart must be used within an OrderCartProvider")
  }
  return context
}
