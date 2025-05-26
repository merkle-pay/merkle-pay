import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma";

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
  const { business_name, blockchain, wallets, tokens } = await request.json();

  const business = await prisma.business.create({
    data: {
      business_name,
      blockchain,
      wallets,
      tokens,
    },
  });
}
