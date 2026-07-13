import { ModulePage } from "@/components/dashboard/module-page"

type InventoryPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="inventory" vendorSlug={vendorSlug} />
}
