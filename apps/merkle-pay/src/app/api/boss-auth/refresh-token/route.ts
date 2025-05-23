import { bossAuth } from "src/utils/boss-auth";
import { NextRequest, NextResponse } from "next/server";

import { verifyJwt } from "src/utils/jwt";
import { prisma } from "src/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const currentRefreshToken = request.cookies.get("refreshToken")?.value;

    if (!currentRefreshToken) {
      return NextResponse.json({
        code: 401,
        data: null,
        message: "Invalid credentials",
      });
    }

    const { email, username } = await verifyJwt(currentRefreshToken);

    if (!email || !username) {
      return NextResponse.json({
        code: 401,
        data: null,
        message: "Invalid credentials",
      });
    }

    const boss = await prisma.boss.findFirst({
      where: {
        email,
        username,
      },
    });

    if (!boss) {
      return NextResponse.json({
        code: 401,
        data: null,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = await bossAuth.refreshToken({
      boss,
    });

    const response = NextResponse.json({
      code: 201, // <---- 201 is the code for refreshed token, dashboard app uses 201
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
    console.error(error);
    return NextResponse.json({
      code: 500,
      data: null,
      message: "Internal server error",
    });
  }
}
