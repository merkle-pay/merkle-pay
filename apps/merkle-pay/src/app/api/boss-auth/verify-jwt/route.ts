import { NextRequest, NextResponse } from "next/server";

import { auth as bossAuth } from "src/utils/boss-auth";
import { jwtVerify, createLocalJWKSet } from "jose";

export async function POST(request: NextRequest) {
  try {
    const jwks = await bossAuth.api.getJwks();

    const JWKS = createLocalJWKSet({
      keys: jwks.keys,
    });

    const { jwt } = await request.json();

    await jwtVerify(jwt, JWKS);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({
    success: false,
  });
}
