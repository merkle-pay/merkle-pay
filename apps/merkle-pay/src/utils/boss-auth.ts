import { prisma } from "./prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { captcha } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    }),
    jwt(),
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
