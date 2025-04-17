import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma";
import { verifyJwt } from "src/utils/verify-jwt";

export async function GET(request: NextRequest) {
  const jwt = request.cookies.get("jwtToken")?.value;
  const mpAuthRequired = request.headers.get("mp-auth-required");

  try {
    if (mpAuthRequired === "true") {
      const isVerified = await verifyJwt(jwt ?? "");

      if (!isVerified) {
        return NextResponse.json({
          code: 401,
          data: [],
          message: "Unauthorized",
        });
      }
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    const _page =
      page && !Number.isNaN(parseInt(page)) && parseInt(page) >= 1
        ? parseInt(page) - 1
        : 0;

    const _pageSize =
      pageSize && !Number.isNaN(parseInt(pageSize)) && parseInt(pageSize) >= 1
        ? parseInt(pageSize)
        : 20;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip: _page * _pageSize,
        take: _pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.payment.count(),
    ]);

    return NextResponse.json({
      code: 200,
      data: {
        payments,
        total,
      },
      message: "Payments fetched successfully",
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
