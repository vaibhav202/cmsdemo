import { ModulePage } from "@/features/vendors/components/vendor-module-page"

type ControlPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function ControlPage({ params }: ControlPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="control" vendorSlug={vendorSlug} />
}
