import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const publicRoutes = ["/", "/sign-in"];
const publicPrefixes = ["/feedback-survey", "/unauthorized"];

function isPublicPath(normalizedPath: string): boolean {
  if (publicRoutes.includes(normalizedPath)) return true;
  return publicPrefixes.some(
    (prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );
}

function getLegacyProductsRedirect(normalizedPath: string): string | null {
  if (!normalizedPath.startsWith("/dashboard/news")) return null;

  let target = normalizedPath.replace("/dashboard/news", "/dashboard/products");
  target = target.replace("/create-news", "/create");
  return target;
}

async function validateDashboardSession(
  sessionCookie: { value: string } | undefined
): Promise<{ ok: boolean; user?: { id: string } }> {
  if (!sessionCookie?.value) {
    return { ok: false };
  }

  try {
    const response = await fetch(`${API_URL}/dashboard/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `dashboard_session=${sessionCookie.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false };
    }

    const data = await response.json();
    const user = data.data?.user;

    if (user?.id) {
      return { ok: true, user };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  const legacyRedirect = getLegacyProductsRedirect(normalizedPath);
  if (legacyRedirect) {
    const url = req.nextUrl.clone();
    url.pathname = `${legacyRedirect}/`;
    return NextResponse.redirect(url);
  }

  const isPublicRoute = isPublicPath(normalizedPath);
  const sessionCookie = req.cookies.get("dashboard_session");

  // Cross-origin: cookie may live on API host only — client-side auth handles that.
  // When cookie is present on this host, validate with dashboard auth endpoint.
  if (isPublicRoute && sessionCookie) {
    const session = await validateDashboardSession(sessionCookie);

    if (session.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/";
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.cookies.delete("dashboard_session");
    return response;
  }

  if (!isPublicRoute && sessionCookie) {
    const session = await validateDashboardSession(sessionCookie);

    if (!session.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in/";
      const response = NextResponse.redirect(url);
      response.cookies.delete("dashboard_session");
      return response;
    }
  }

  // No cookie on request: allow through — ProtectedWrapper validates via API (credentials: include)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|placeholder.svg|api).*)",
  ],
};
