import { NextRequest, NextResponse } from "next/server";

// Auth.js session strategy is "database" (Prisma-backed), which isn't
// Edge-runtime safe, so middleware can't call auth() directly here. Full
// session/role validation still happens in app/dashboard/layout.tsx and
// app/admin/layout.tsx via requireUser()/requireAdmin(). This middleware is
// a coarse defense-in-depth net: it rejects requests to protected routes
// that don't even carry a session cookie, so a route that forgets to call
// its own auth check (as happened with the invoice PDF route) doesn't end
// up fully unprotected.
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!hasSessionCookie(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/dashboard/:path*",
    "/api/reports/:path*",
  ],
};
