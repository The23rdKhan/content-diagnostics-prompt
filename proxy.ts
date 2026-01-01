import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const authUser = request.cookies.get("auth_user")?.value

  if (!authUser && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  // Redirect unauthenticated users trying to access protected routes
  if (
    !authUser &&
    (request.nextUrl.pathname.startsWith("/creators") || request.nextUrl.pathname.startsWith("/reviewers"))
  ) {
    if (
      !request.nextUrl.pathname.startsWith("/creators/dashboard") &&
      !request.nextUrl.pathname.startsWith("/reviewers/dashboard")
    ) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/creators/:path*", "/reviewers/:path*", "/auth/:path*", "/admin/:path*"],
}
