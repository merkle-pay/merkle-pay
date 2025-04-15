import { NextRequest, NextResponse } from "next/server";

import { auth as bossAuth } from "src/utils/boss-auth";
import { jwtVerify, createLocalJWKSet } from "jose";

export async function POST(request: NextRequest) {
  const jwks = await bossAuth.api.getJwks();

  const JWKS = createLocalJWKSet({
    keys: jwks.keys,
  });

  const { jwt } = await request.json();

  const { payload } = await jwtVerify(jwt, JWKS);

  return NextResponse.json({
    payload,
  });
}
