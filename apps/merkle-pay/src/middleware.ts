import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isHuman } from "./utils/is-human";
import { isJwtValid } from "./utils/jwt";

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
  ? [process.env.DOMAIN]
  : ["http://localhost:8888", "http://localhost:9999"];

const routesRequiringTurnstile = [
  "/api/payment",
  "/api/boss-auth/sign-in",
  "/api/boss-auth/sign-up",
  "/api/boss-auth/sign-out",
];

const routesRequiringAuth = ["/api/dashboard"];

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("Origin");

  if (request.method === "OPTIONS") {
    if (isProduction) {
      // Deny all OPTIONS requests in production
      return NextResponse.json(
        { code: 403, data: null, message: "Forbidden" },
        { status: 403 }
      );
    } else {
      // Allow all OPTIONS requests in development
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, mp-antibot-token",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
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
        { status: 403 }
      );
    }
  }

  if (shouldCheckAuth) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { code: 401, data: null, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      isTokenExpired: isAccessTokenExpired,
      isTokenValid: isAccessTokenValid,
    } = await isJwtValid(accessToken);
    const {
      isTokenExpired: isRefreshTokenExpired,
      isTokenValid: isRefreshTokenValid,
    } = await isJwtValid(refreshToken);

    if (isRefreshTokenExpired || !isRefreshTokenValid || !isAccessTokenValid) {
      const response = NextResponse.json(
        { code: 401, data: null, message: "Unauthorized" },
        { status: 401 }
      );

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("isAuthenticated");

      return response;
    }

    if (isAccessTokenExpired) {
      return NextResponse.json({
        code: 499,
        data: null,
        message: "Expired",
      });
    }
  }

  const response = NextResponse.next();

  if (!isProduction) {
    // Allow all origins in development
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, mp-antibot-token"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
