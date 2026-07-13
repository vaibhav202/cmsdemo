import { ModulePage } from "@/components/dashboard/module-page"

type ReportsPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="reports" vendorSlug={vendorSlug} />
}
