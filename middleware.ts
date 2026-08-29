import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("admin_session")?.value;
  
  // If user is trying to access /login but is already authenticated
  if (pathname === "/login" && sessionCookie) {
    try {
      const secret = process.env.JWT_SECRET || "fallback-secret-wedding-app-2026";
      const encodedSecret = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(sessionCookie, encodedSecret);
      
      if (payload.role === "FAMILY_MEMBER") {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
      return NextResponse.redirect(new URL("/admin", request.url));
    } catch (error) {
      // Invalid token, let them proceed to login page
    }
  }

  // Check routes that require authentication (/admin, /portal)
  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = process.env.JWT_SECRET || "fallback-secret-wedding-app-2026";
      const encodedSecret = new TextEncoder().encode(secret);
      
      // Verify token
      const { payload } = await jwtVerify(sessionCookie, encodedSecret);
      const role = payload.role as string;
      const permissions = (payload.permissions as string[]) || [];

      // Family Member RBAC
      if (role === "FAMILY_MEMBER") {
        if (pathname.startsWith("/admin")) {
          // Family members cannot access admin dashboard
          return NextResponse.redirect(new URL("/portal", request.url));
        }
      } else {
        // SUPER_ADMIN and ADMIN
        if (pathname.startsWith("/portal")) {
          // Admins don't use the family portal, they use the admin dashboard
          return NextResponse.redirect(new URL("/admin", request.url));
        }

        // ADMIN and VIEWER Level RBAC
        if (role === "ADMIN" || role === "VIEWER") {
          // Map URL paths to granular View permissions
          const permissionMap: Record<string, string> = {
            "/admin/guests": "guest.view",
            "/admin/events": "calendar.view", // Events and calendar share views typically, or create event.view
            "/admin/seating": "seating.view",
            "/admin/logistics": "transport.view", // Logistics maps to transport/accommodation
            "/admin/budget": "budget.view",
            "/admin/vendors": "vendor.view",
            "/admin/tasks": "task.view",
            "/admin/team": "user.view",
            "/admin/calendar": "calendar.view",
            "/admin/wedding-day": "wedding_day.view",
          };

          // Find if the current path falls under a restricted module
          for (const [route, permCode] of Object.entries(permissionMap)) {
            if (pathname.startsWith(route)) {
              if (!permissions.includes(permCode)) {
                // Not authorized for this module, redirect to /admin dashboard
                return NextResponse.redirect(new URL("/admin", request.url));
              }
            }
          }
        }
      }
      
      // Token is valid and permissions match, allow request to continue
      return NextResponse.next();
    } catch (error) {
      // Token is invalid/expired
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
