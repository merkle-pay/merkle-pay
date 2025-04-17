import { prisma } from "./prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    jwt({
      jwt: {
        issuer: process.env.NEXT_PUBLIC_APP_NAME!,
        audience: process.env.NEXT_PUBLIC_APP_NAME!,
        expirationTime: "30d",
        definePayload: ({ user }) => {
          return {
            id: user.id,
            email: user.email,
            level: user.level,
            business_name: user.business_name,
            blockchains: user.blockchains,
            wallets: user.wallets,
          };
        },
      },
    }),
    bearer(),
  ],
  user: {
    modelName: "boss",
    additionalFields: {
      level: {
        type: "number",
        required: true,
        default: 99,
      },
      business_name: {
        type: "string",
        required: true,
      },
      blockchains: {
        type: "string[]",
        default: ["solana"],
      },
      wallets: {
        type: "string[]", //! convention: blockchain - name-address
      },
      backup_email: {
        type: "string",
      },
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    storeSessionInDatabase: true,
    updateAge: 60 * 60 * 24, // 1 day
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    disableSignUp: process.env.ENABLE_SIGNUP === "NO",
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      enabled:
        !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    },
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Merkle Pay Demo",
});
