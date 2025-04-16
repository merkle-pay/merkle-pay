import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isHuman } from "./utils/is-human";

const allowedOrigins = ["http://localhost:9999", process.env.DOMAIN_NAME];

const routesRequiringTurnstile = [
  "/api/payment",
  "/api/boss-auth/sign-in",
  "/api/boss-auth/sign-up",
  "/api/boss-auth/sign-out",
];

const routesRequiringAuth = ["/api/dashboard"];

export async function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin");
    if (origin && allowedOrigins.includes(origin)) {
      const requestHeaders = request.headers.get(
        "Access-Control-Request-Headers"
      );

      const allowedHeaders = requestHeaders ?? "*";

      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": allowedHeaders,
          "Access-Control-Allow-Credentials": "true",
        },
      });
    } else {
      return new NextResponse(null, { status: 403, statusText: "Forbidden" });
    }
  }

  const origin = request.headers.get("Origin");
  const isOriginAllowed = origin && allowedOrigins.includes(origin);
  const corsHeaders: Record<string, string> = {};
  if (isOriginAllowed) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, DELETE, OPTIONS";
    corsHeaders["Access-Control-Allow-Headers"] = "*";
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
  }

  const shouldCheckTurnstile = routesRequiringTurnstile.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const shouldCheckAuth = routesRequiringAuth.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("mp-auth-required", shouldCheckAuth ? "true" : "false");

  if (shouldCheckTurnstile) {
    const turnstileToken = request.headers.get("mp-antibot-token");
    const isTokenValid = turnstileToken && (await isHuman(turnstileToken));

    if (!isTokenValid) {
      return NextResponse.json(
        { code: 403, data: null, message: "Human verification failed" },
        { status: 403, headers: corsHeaders }
      );
    }
  }

  if (shouldCheckAuth) {
    const jwt = request.cookies.get("jwtToken")?.value;
    if (!jwt) {
      return NextResponse.json(
        { code: 401, data: null, message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });

  return response;
}

// Configure matcher to apply middleware to all routes, excluding static files and Next.js internals
export const config = {
  matcher: "/api/:path*",
};
