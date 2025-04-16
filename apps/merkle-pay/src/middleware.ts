import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isHuman } from "./utils/is-human";

const allowedOrigins = new Set(
  ["http://localhost:9999", process.env.DOMAIN].filter(Boolean)
);

const corsHeadersConfig = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, mp-antibot-token",
};

const pathsRequiringTurnstile = [
  "/api/payment",
  "/api/boss-auth/sign-in",
  "/api/boss-auth/sign-up",
  "/api/boss-auth/sign-out",
];

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const isAllowedOrigin = allowedOrigins.has(origin);

  const corsHeaders = isAllowedOrigin
    ? { "Access-Control-Allow-Origin": origin, ...corsHeadersConfig }
    : {};

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  let response = NextResponse.next();

  const requiresCheck = pathsRequiringTurnstile.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (requiresCheck) {
    const turnstileToken = request.headers.get("mp-antibot-token");
    const isTokenValid = turnstileToken && (await isHuman(turnstileToken));

    if (!isTokenValid) {
      const message = !turnstileToken
        ? "Turnstile token required"
        : "Human verification failed";
      console.warn(`Turnstile check failed: ${message}`);

      response = NextResponse.json(
        { code: 403, data: null, message: message },
        { status: 403, headers: corsHeaders }
      );
    }
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (isAllowedOrigin) {
      response.headers.set(key as string, value as string);
    }
  });

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
