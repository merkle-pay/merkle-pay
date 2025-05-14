import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "./jwt";

export const bossAuth = {
  async getBossByEmailOrUsername(email?: string, username?: string) {
    const boss = await prisma.boss.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    return boss;
  },
  async getBossById(id: number) {
    const boss = await prisma.boss.findUnique({ where: { id } });
    return boss;
  },
  async signUp({
    email,
    username,
    password,
  }: {
    email: string;
    username: string;
    password: string;
  }) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    try {
      await prisma.boss.create({
        data: {
          email,
          username,
          password_hash: hash,
        },
      });
      return true;
    } catch (error) {
      console.error(error);
    }
    return false;
  },
  async signIn({
    email,
    username,
    password,
  }: {
    email?: string;
    username?: string;
    password: string;
  }) {
    const boss = await this.getBossByEmailOrUsername(email, username);

    if (!boss || !boss.is_email_verified) {
      return {
        boss: null,
        accessToken: null,
        refreshToken: null,
      };
    }

    const isPasswordValid = bcrypt.compareSync(password, boss.password_hash);
    if (!isPasswordValid) {
      return {
        boss: null,
        accessToken: null,
        refreshToken: null,
      };
    }

    const accessToken = await signJwt(boss);
    const refreshToken = await signJwt(boss, "60d");

    return {
      boss,
      accessToken,
      refreshToken,
    };
  },
  async signOut() {
    // TODO: Implement sign out
  },
};
