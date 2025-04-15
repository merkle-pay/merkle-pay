import { auth as bossAuth } from "src/utils/boss-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();

    const { email, password, name, business_name, backup_email } = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(4),
        business_name: z.string().min(4),
        backup_email: z.string().email().optional(),
      })
      .parse(json);

    const result = await bossAuth.api.signUpEmail({
      body: {
        password,
        email,
        name,
        level: 99,
        business_name,
        blockchains: ["solana"],
        wallets: [],
        backup_email: backup_email ?? "",
      },
    });

    console.log(result);
    return NextResponse.json({
      code: 201,
      data: result,
      message: "Boss created successfully",
    });
  } catch (error) {
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
