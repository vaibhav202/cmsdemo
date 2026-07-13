import { ModulePage } from "@/components/dashboard/module-page"

type LedgerPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function LedgerPage({ params }: LedgerPageProps) {
  const { vendorSlug } = await params

  return <ModulePage module="ledger" vendorSlug={vendorSlug} />
}
