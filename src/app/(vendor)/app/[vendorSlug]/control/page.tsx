import { ModulePage } from "@/components/dashboard/module-page"

type ControlPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function ControlPage({ params }: ControlPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="control" vendorSlug={vendorSlug} />
}
