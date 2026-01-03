import { type NextRequest, NextResponse } from "next/server"

/**
 * Next.js Middleware Proxy
 *
 * Note: We cannot check auth status here because:
 * 1. The refresh token is HttpOnly (not accessible in JS/middleware)
 * 2. The cookie path is /api/auth (not sent to other routes)
 * 3. The access token is in-memory only (not persisted)
 *
 * Auth protection is handled client-side by the AuthProvider.
 * Dashboard pages redirect to sign-in when no user is authenticated.
 */
export function proxy(request: NextRequest) {
  // Currently just passes through - auth is handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: ["/creators/:path*", "/reviewers/:path*", "/auth/:path*", "/admin/:path*"],
}
