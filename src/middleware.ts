import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public admin login — no auth cookie required
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isDashboard && !isAdmin) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.get("printoe_auth")?.value === "1";
  const role = decodeURIComponent(
    request.cookies.get("printoe_role")?.value ?? "",
  );

  if (!hasAuthCookie) {
    const loginPath = isAdmin ? "/admin/login" : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin session must not use customer dashboard
  if (isDashboard && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Customer session must not open admin panel
  if (isAdmin && role && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
