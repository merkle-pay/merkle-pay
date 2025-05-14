import * as jose from "jose";
import { Boss } from "../../prisma/client";
import { jwtDecode } from "jwt-decode";

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
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  });

  return {
    payload,
    protectedHeader,
  };
};

export const isJwtValid = async (token: string) => {
  const decoded = jwtDecode(token);

  if (!decoded) {
    return {
      isTokenExpired: true,
      isTokenValid: false,
    };
  }

  const { payload, protectedHeader } = await verifyJwt(token);

  console.log("payload", payload);
  console.log("protectedHeader", protectedHeader);

  return {
    isTokenExpired: decoded.exp && decoded.exp < Date.now() / 1000,
    isTokenValid: true,
  };
};
