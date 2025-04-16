import { jwtVerify, createLocalJWKSet } from "jose";
import { auth as bossAuth } from "./boss-auth";

export async function verifyJwt(jwt: string) {
  try {
    const jwks = await bossAuth.api.getJwks();
    const JWKS = createLocalJWKSet({
      keys: jwks.keys,
    });
    await jwtVerify(jwt, JWKS);
    return true;
  } catch (error) {
    console.error(error);
  }

  return false;
}
