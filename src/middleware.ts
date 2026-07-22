import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public admin login — no auth cookie required
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isCheckout =
    pathname === "/checkout" || pathname.startsWith("/checkout/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isDashboard && !isCheckout && !isAdmin) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.get("printoe_auth")?.value === "1";
  if (hasAuthCookie) return NextResponse.next();

  const loginPath = isAdmin ? "/admin/login" : "/login";
  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*", "/admin/:path*"],
};
