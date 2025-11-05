import { NextResponse } from "next/server";
import { prisma } from "src/lib/db-compat";
import { z } from "zod";

export async function GET() {
  try {
    const businesses = await prisma.business.findMany();

    return NextResponse.json({
      code: 200,
      data: {
        businesses,
      },
      message: "Businesses fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      code: 500,
      data: [],
      message: "Internal server error",
    });
  }
}

export async function POST(request: Request) {
  try {
    const { business_name, blockchain, wallets, tokens } = await request.json();

    if (!!blockchain && blockchain.toLowerCase() !== "solana") {
      return NextResponse.json({
        code: 400,
        data: {
          business: null,
        },
        message: "Only Solana is supported for now",
      });
    }

    const schema = z.object({
      business_name: z.string().min(1),
      blockchain: z.string().min(1),
      wallets: z.array(z.string()).min(1),
      tokens: z.array(z.string()).min(1),
    });

    const parsed = schema.parse({
      business_name,
      blockchain,
      wallets,
      tokens,
    });

    const business = await prisma.business.create({
      data: {
        ...parsed,
      },
    });

    return NextResponse.json({
      code: 201,
      data: {
        business,
      },
      message: "Business created successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      code: 500,
      data: {
        business: null,
      },
      message: `Internal server error: ${(error as Error).message}`,
    });
  }
}
