import { ModulePage } from "@/components/dashboard/module-page"

type KitchenPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="kitchen" vendorSlug={vendorSlug} />
}
