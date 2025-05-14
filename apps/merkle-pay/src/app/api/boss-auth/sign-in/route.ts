import { bossAuth } from "src/utils/boss-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();

    const { username, email, password } = z
      .object({
        username: z.string().optional(),
        email: z.string().optional(),
        password: z.string().min(8),
      })
      .refine((data) => data.email || data.username, {
        message: "Email and username are missing",
      })
      .parse(json);

    const { boss, accessToken, refreshToken } = await bossAuth.signIn({
      email,
      username,
      password,
    });

    if (!boss || !accessToken || !refreshToken) {
      return NextResponse.json({
        code: 401,
        data: null,
        message: "Invalid credentials",
      });
    }

    const response = NextResponse.json({
      code: 200,
      data: {
        boss: {
          username: boss.username,
          email: boss.email,
          avatar_image_url: boss.avatar_image_url,
          role: boss.role,
        },
      },
      message: "Login successful",
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 24, // 24h
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 24 * 60, // 60d
    });

    response.cookies.set("isAuthenticated", "true", {
      httpOnly: false, // <<< Make it readable by JS
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 24 * 60, // 60d
    });

    return response;
  } catch (error) {
    console.log("error", error);
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json({
        code: 400,
        data: null,
        message: validationError.message,
      });
    }
    return NextResponse.json({
      code: 500,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
