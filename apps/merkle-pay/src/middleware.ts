import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isHuman } from "./utils/is-human";
import { isJwtValid } from "./utils/jwt";

const allowedDevelopmentOrigins = [
  "http://localhost:8888",
  "http://localhost:9999",
];

const routesRequiringTurnstile = [
  "/api/payment",
  "/api/boss-auth/sign-in",
  "/api/boss-auth/sign-up",
  "/api/boss-auth/sign-out",
];

const routesRequiringAuth = ["/api/dashboard"];

const dealWithCors = (response: NextResponse, origin: string) => {
  if (process.env.NODE_ENV !== "production") {
    response.headers.set("Access-Control-Allow-Origin", origin);
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
};

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("Origin");
  const isProduction = process.env.NODE_ENV === "production";

  if (request.method === "OPTIONS") {
    if (isProduction) {
      // Deny all OPTIONS requests in production
      return NextResponse.json(
        { code: 403, data: null, message: "Forbidden" },
        { status: 403 }
      );
    } else {
      if (!origin || !allowedDevelopmentOrigins.includes(origin)) {
        return NextResponse.json(
          { code: 403, data: null, message: "Forbidden" },
          { status: 403 }
        );
      }

      // Allow all OPTIONS requests in development
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
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

  if (shouldCheckTurnstile) {
    const turnstileToken = request.headers.get("mp-antibot-token");
    const isTokenValid = await isHuman(turnstileToken);

    if (!isTokenValid) {
      const response = NextResponse.json(
        { code: 403, data: null, message: "Human verification failed" },
        { status: 403 }
      );

      return dealWithCors(response, origin);
    }
  }

  if (shouldCheckAuth) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      const response = NextResponse.json(
        { code: 401, data: null, message: "Unauthorized" },
        { status: 401 }
      );
      return dealWithCors(response, origin);
    }

    // refresh token is valid, but access token is not valid
    if (!accessToken) {
      const response = NextResponse.json({
        code: 499,
        data: null,
        message: "Expired",
      });
      return dealWithCors(response, origin);
    }

    // refresh token lives 24h
    // access token lives 30d
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

      return dealWithCors(response, origin);
    }

    if (isAccessTokenExpired) {
      const response = NextResponse.json({
        code: 499,
        data: null,
        message: "Expired",
      });
      return dealWithCors(response, origin);
    }
  }

  const response = NextResponse.next();

  return dealWithCors(response, origin);
}

export const config = {
  matcher: "/api/:path*",
};
