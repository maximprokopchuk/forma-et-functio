import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Routing proxy — plan §23 Phase 7.
 * Renamed from `middleware.ts` in Next 16 (file convention deprecation).
 * Same behaviour as before: auth-guard admin/profile/progress/onboarding,
 * bounce logged-in users away from /login and /register.
 */
export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && token) {
      return NextResponse.redirect(new URL("/lessons", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/progress") ||
          pathname.startsWith("/onboarding")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/progress/:path*",
    "/onboarding",
    "/login",
    "/register",
  ],
};
