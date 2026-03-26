import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes that require Administrator role
const adminRoutes = ["/admin"];
// Routes that require any authenticated user
const protectedRoutes = ["/User", "/admin"];
// Public routes (auth)
const authRoutes = ["/authentication/login", "/authentication/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  // 1. Skip middleware for static files and specific public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public auth API routes without session
  if (pathname === "/api/auth/login" || pathname === "/api/auth/register") {
    return NextResponse.next();
  }

  // 3. If it's a public auth PAGE and user is already logged in, redirect to their dashboard
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      try {
        const secret = new TextEncoder().encode(
          process.env.AUTH_SECRET || "default_secret_for_development_only",
        );
        const { payload } = await jwtVerify(session, secret);
        const role = payload.role as string;

        if (role === "Administrator" || role === "Admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/User", request.url));
      } catch (error) {
        // Invalid session, let them stay on auth page
      }
    }
    return NextResponse.next();
  }

  // 4. If it's a protected route (includes all /api except auth, /admin, /User), check session
  const isApiRoute = pathname.startsWith("/api/");
  const isProtectedRoute =
    isApiRoute || protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!session) {
      if (isApiRoute) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(
        new URL("/authentication/login", request.url),
      );
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.AUTH_SECRET || "default_secret_for_development_only",
      );
      const { payload } = await jwtVerify(session, secret);
      const role = payload.role as string;

      // 5. Admin-only check for /admin pages and sensitive /api/admin/* or /api/users/*
      const isAdminRoute =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/api/admin") ||
        pathname.startsWith("/api/users");

      if (isAdminRoute && !(role === "Administrator" || role === "Admin")) {
        if (isApiRoute) {
          return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        // Unauthorized - send to user dashboard
        return NextResponse.redirect(new URL("/User", request.url));
      }
    } catch (error) {
      // Invalid session
      if (isApiRoute) {
        return NextResponse.json(
          { message: "Invalid session" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(
        new URL("/authentication/login", request.url),
      );
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (api routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
