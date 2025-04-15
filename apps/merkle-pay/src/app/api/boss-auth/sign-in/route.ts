import { auth as bossAuth } from "src/utils/boss-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();

    const { email, password } = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      .parse(json);

    const { token: sessionToken } = await bossAuth.api.signInEmail({
      body: {
        password,
        email,
      },
    });

    const { token: jwtToken } = await bossAuth.api.getToken({
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    const response = NextResponse.json({
      code: 200,
      data: {
        sessionToken,
        jwtToken,
      },
      message: "Login successful",
    });

    response.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("jwtToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.log("error", error);
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        {
          code: 400,
          data: null,
          message: validationError.message,
        },
        {
          status: 400,
        }
      );
    }
    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
