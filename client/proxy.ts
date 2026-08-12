import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_ONLY_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("commercecore_token")?.value;

  // Server-side instant edge redirect for authenticated users trying to access guest routes
  if (token && GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup"],
};
