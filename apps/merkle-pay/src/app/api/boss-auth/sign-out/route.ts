import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../utils/boss-auth";

export async function POST(request: NextRequest) {
  let response: NextResponse;

  try {
    // Pass the headers from the incoming request to signOut
    // This allows better-auth's bearer plugin to find the session token

    await auth.api.signOut({
      headers: request.headers,
    });
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
  response.cookies.set("sessionToken", "", { maxAge: -1, path: "/" });
  response.cookies.set("jwtToken", "", { maxAge: -1, path: "/" });
  // Clear the client-readable flag cookie
  response.cookies.set("isAuthenticated", "", { maxAge: -1, path: "/" });

  return response;
}
