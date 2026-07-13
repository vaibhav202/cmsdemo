import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { workspaceAccounts, workspaceVendor, type WorkspaceAccount } from "@/lib/workspace-data"
import { getDefaultRouteForRole } from "@/lib/permissions"

export const WORKSPACE_SESSION_COOKIE = "cms_platform_session"

export type WorkspaceSession = {
  user: WorkspaceAccount
  vendor: typeof workspaceVendor
}

export function findWorkspaceAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  return workspaceAccounts.find(
    (account) =>
      account.email === normalizedEmail &&
      account.password === password &&
      account.status === "active"
  )
}

export function getWorkspaceAccountById(id: string | undefined) {
  if (!id) return undefined
  return workspaceAccounts.find((account) => account.id === id)
}

export async function getCurrentWorkspaceSession(): Promise<WorkspaceSession | undefined> {
  const cookieStore = await cookies()
  const account = getWorkspaceAccountById(cookieStore.get(WORKSPACE_SESSION_COOKIE)?.value)

  if (!account || account.status !== "active") {
    return undefined
  }

  return {
    user: account,
    vendor: workspaceVendor,
  }
}

export async function requireWorkspaceSession() {
  const session = await getCurrentWorkspaceSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export function getPostLoginRoute(user: WorkspaceAccount, next?: string) {
  if (
    next?.startsWith(`/app/${workspaceVendor.slug}/`) &&
    !next.startsWith("//") &&
    !next.includes("://")
  ) {
    return next
  }

  return getDefaultRouteForRole(user.role, workspaceVendor.slug)
}
