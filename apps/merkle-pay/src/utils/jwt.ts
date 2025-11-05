import * as jose from "jose";
import { Boss } from "../types/database";

export const signJwt = async (boss: Boss, expiresIn: string = "24h") => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const alg = "HS256";
  const token = await new jose.SignJWT({
    email: boss.email,
    username: boss.username,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER ?? "Merkle Pay")
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
};

export const verifyJwt = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    // {
    //   email: 'guiyumin@gmail.com',
    //   username: 'yumin',
    //   iat: 1747258071,
    //   iss: 'Merkle Pay Demo',
    //   exp: 1752442071
    // }
    return {
      ...payload,
    };
  } catch (error) {
    console.log("verifyJwt error", error);
  }
  return {};
};

export const isJwtValid = async (token: string) => {
  const { email, username, exp } = await verifyJwt(token);

  return {
    isTokenExpired: exp && exp < Date.now() / 1000,
    isTokenValid: email && username ? true : false,
  };
};
