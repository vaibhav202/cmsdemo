export const stockUnitOptions = [
  { label: "Kilograms", value: "kg" },
  { label: "Grams", value: "g" },
  { label: "Litres", value: "l" },
  { label: "Millilitres", value: "ml" },
  { label: "Pieces", value: "pcs" },
  { label: "Packs", value: "pack" },
] as const

export const stockMovementOptions = [
  { label: "Stock in", value: "in" },
  { label: "Stock out", value: "out" },
] as const

export type StockMovementType = (typeof stockMovementOptions)[number]["value"]
export type StockUnit = (typeof stockUnitOptions)[number]["value"]
