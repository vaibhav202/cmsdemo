import { ModulePage } from "@/features/vendors/components/vendor-module-page"

type QueuePageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function QueuePage({ params }: QueuePageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="queue" vendorSlug={vendorSlug} />
}
