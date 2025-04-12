import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isHuman } from "./utils/is-human";

export async function middleware(request: NextRequest) {
  // Check if the request path matches the one we want to protect
  if (request.nextUrl.pathname.startsWith("/api/payment")) {
    const turnstileToken = request.headers.get("mp-cf-token");

    if (!turnstileToken) {
      return NextResponse.json({
        code: 403,
        data: null,
        message: "Authentication required",
      });
    }

    const _isHuman = await isHuman(turnstileToken);

    if (!_isHuman) {
      return NextResponse.json({
        code: 403,
        data: null,
        message: "Authentication required",
      });
    }
  }

  return NextResponse.next();
}

// Configure the matcher to only run this middleware for specific API routes
export const config = {
  matcher: ["/api/payment/:path*"],
};
