import { bossAuth } from "src/utils/boss-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();

    const { email, password, username } = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        username: z.string().min(4),
      })
      .parse(json);

    const success = await bossAuth.signUp({
      email,
      password,
      username,
    });

    if (success) {
      return NextResponse.json({
        code: 201,
        data: success,
        message: "Boss created successfully",
      });
    }

    return NextResponse.json({
      code: 400,
      data: false,
      message: "Boss creation failed",
    });
  } catch (error) {
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
