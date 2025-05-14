import { NextResponse } from "next/server";
import { bossAuth } from "src/utils/boss-auth";

export async function POST() {
  let response: NextResponse;

  try {
    await bossAuth.signOut();
    response = NextResponse.json({
      code: 200,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error signing out:", error);
    response = NextResponse.json(
      {
        code: 500,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }

  // Clear HttpOnly auth cookies
  response.cookies.set("accessToken", "", { maxAge: -1, path: "/" });
  response.cookies.set("refreshToken", "", { maxAge: -1, path: "/" });
  // Clear the client-readable flag cookie
  response.cookies.set("isAuthenticated", "", { maxAge: -1, path: "/" });

  return response;
}
