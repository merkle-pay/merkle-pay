import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "./jwt";
import { Boss } from "../../prisma/client";

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

    await prisma.token.createMany({
      data: [
        {
          token: accessToken,
          boss_id: boss.id,
          boss_email: boss.email,
          is_access_token: true,
          is_refresh_token: false,
          scope: null,
          is_valid: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
        {
          token: refreshToken,
          boss_id: boss.id,
          boss_email: boss.email,
          is_access_token: false,
          is_refresh_token: true,
          scope: null,
          is_valid: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      ],
    });

    return {
      boss,
      accessToken,
      refreshToken,
    };
  },
  async signOut() {
    // TODO: Implement sign out
  },
  async refreshToken({ boss }: { boss: Boss }) {
    const accessToken = await signJwt(boss);
    const refreshToken = await signJwt(boss, "60d");

    await prisma.token.createMany({
      data: [
        {
          token: accessToken,
          boss_id: boss.id,
          boss_email: boss.email,
          is_access_token: true,
          is_refresh_token: false,
          scope: null,
          is_valid: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
        {
          token: refreshToken,
          boss_id: boss.id,
          boss_email: boss.email,
          is_access_token: false,
          is_refresh_token: true,
          scope: null,
          is_valid: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      ],
    });

    return {
      boss,
      accessToken,
      refreshToken,
    };
  },
};
