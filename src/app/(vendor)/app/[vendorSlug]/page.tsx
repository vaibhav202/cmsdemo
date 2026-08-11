import { redirect } from "next/navigation"

import { requireWorkspaceSession } from "@/features/auth/demo-session"
import { getDefaultRouteForRole } from "@/features/memberships/permissions"

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
