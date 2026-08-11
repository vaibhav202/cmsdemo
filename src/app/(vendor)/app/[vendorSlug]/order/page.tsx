import { ModulePage } from "@/features/vendors/components/vendor-module-page"

type OrderPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="order" vendorSlug={vendorSlug} />
}
