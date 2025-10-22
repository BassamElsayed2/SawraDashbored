// middleware.ts - Auth Middleware for Dashboard
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Public routes that don't require authentication
const publicRoutes = ["/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Normalize pathname (remove trailing slash for comparison, except for root)
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // Check if the current route is public (home page only)
  const isPublicRoute = publicRoutes.includes(normalizedPath);

  // Get session cookie - dashboard uses its own cookie
  const sessionCookie = req.cookies.get("dashboard_session");

  // If on home page and already logged in, redirect to dashboard
  if (isPublicRoute && sessionCookie) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `dashboard_session=${sessionCookie.value}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data?.user;

        // التحقق من صلاحية بيانات المستخدم
        if (user && user.id) {
          // If user has admin role, redirect to dashboard
          if (["admin", "super_admin", "manager"].includes(user.role || "")) {
            const url = req.nextUrl.clone();
            url.pathname = "/dashboard/";
            return NextResponse.redirect(url);
          }
        }
      } else {
        // مسح الكوكي إذا كانت الجلسة غير صالحة
        const url = req.nextUrl.clone();
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.delete("dashboard_session");
        return redirectResponse;
      }
    } catch (error) {
      // مسح الكوكي في حالة حدوث خطأ للأمان
      const url = req.nextUrl.clone();
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.cookies.delete("dashboard_session");
      return redirectResponse;
    }
  }

  // If trying to access protected route without session
  if (!isPublicRoute && !sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Verify session with backend for protected routes
  if (!isPublicRoute && sessionCookie) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `dashboard_session=${sessionCookie.value}`,
        },
      });

      if (!response.ok) {
        // Session is invalid, redirect to home page
        const url = req.nextUrl.clone();
        url.pathname = "/";

        const redirectResponse = NextResponse.redirect(url);
        // Clear invalid cookie
        redirectResponse.cookies.delete("dashboard_session");
        return redirectResponse;
      }

      // Verify user is admin
      const data = await response.json();
      const user = data.data?.user;

      if (
        user &&
        !["admin", "super_admin", "manager"].includes(user.role || "")
      ) {
        // Not an admin, redirect to home page with error
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("error", "unauthorized");

        const redirectResponse = NextResponse.redirect(url);
        // Clear cookie for non-admin users
        redirectResponse.cookies.delete("dashboard_session");
        return redirectResponse;
      }
    } catch (error) {
      // On error, redirect to home page for safety
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
