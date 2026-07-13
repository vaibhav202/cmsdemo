import { redirect } from "next/navigation"

import { requireWorkspaceSession } from "@/lib/workspace-auth"
import { getDefaultRouteForRole } from "@/lib/permissions"

type VendorIndexPageProps = {
  params: Promise<{ vendorSlug: string }>
}

export default async function VendorIndexPage({
  params,
}: VendorIndexPageProps) {
  const { vendorSlug } = await params
  const session = await requireWorkspaceSession()

  redirect(getDefaultRouteForRole(session.user.role, vendorSlug))
}
