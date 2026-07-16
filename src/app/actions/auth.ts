"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import {
  WORKSPACE_SESSION_COOKIE,
  findWorkspaceAccount,
  getPostLoginRoute,
} from "@/lib/workspace-auth"

export type LoginState = {
  error?: string
  email?: string
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const t = await getTranslations("Auth.form")
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "")
  const account = findWorkspaceAccount(email, password)

  if (!account) {
    return {
      email,
      error: t("invalidCredentials"),
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(WORKSPACE_SESSION_COOKIE, account.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  redirect(getPostLoginRoute(account, next))
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(WORKSPACE_SESSION_COOKIE)
  redirect("/login")
}
