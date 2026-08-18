import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_ONLY_ROUTES = ["/login", "/signup"];
const AUTHENTICATED_ROUTES = ["/profile"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rupzon_token")?.value || request.cookies.get("commercecore_token")?.value;

  // Server-side instant edge redirect for authenticated users trying to access guest routes
  if (token && GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Server-side edge redirect for unauthenticated users trying to access protected routes
  if (!token && AUTHENTICATED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/profile"],
};

