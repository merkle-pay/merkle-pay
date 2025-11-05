import { query, queryOne } from "../lib/db";
import bcrypt from "bcryptjs";
import { signJwt } from "./jwt";
import { Boss } from "../types/database";

export const bossAuth = {
  async getBossByEmailOrUsername(email?: string, username?: string) {
    if (email) {
      return queryOne<Boss>(
        `SELECT * FROM "Boss" WHERE email = $1`,
        [email]
      );
    }
    if (username) {
      return queryOne<Boss>(
        `SELECT * FROM "Boss" WHERE username = $1`,
        [username]
      );
    }
    return null;
  },
  async getBossById(id: number) {
    return queryOne<Boss>(
      `SELECT * FROM "Boss" WHERE id = $1`,
      [id]
    );
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
      await query(
        `INSERT INTO "Boss" (email, username, password_hash, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [email, username, hash]
      );
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

    await query(
      `INSERT INTO "Token" (token, boss_id, boss_email, is_access_token, is_refresh_token, scope, is_valid, "expiresAt", "createdAt", "updatedAt")
       VALUES
       ($1, $2, $3, true, false, NULL, true, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ($5, $6, $7, false, true, NULL, true, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        accessToken,
        boss.id,
        boss.email,
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        refreshToken,
        boss.id,
        boss.email,
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      ]
    );

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

    await query(
      `INSERT INTO "Token" (token, boss_id, boss_email, is_access_token, is_refresh_token, scope, is_valid, "expiresAt", "createdAt", "updatedAt")
       VALUES
       ($1, $2, $3, true, false, NULL, true, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ($5, $6, $7, false, true, NULL, true, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        accessToken,
        boss.id,
        boss.email,
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        refreshToken,
        boss.id,
        boss.email,
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      ]
    );

    return {
      boss,
      accessToken,
      refreshToken,
    };
  },
};
