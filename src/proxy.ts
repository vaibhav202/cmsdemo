import { NextResponse, type NextRequest } from "next/server"

import { WORKSPACE_SESSION_COOKIE } from "@/features/auth/demo-session"

export function proxy(request: NextRequest) {
  if (request.cookies.has(WORKSPACE_SESSION_COOKIE)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", request.nextUrl.pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/app/:path*"],
}
