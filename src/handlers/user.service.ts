import { NewUser } from "../db/schema";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import db from "../db/db";
import { refreshTokens, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authServices } from "./auth";

export const user = {
  register: async (data: NewUser) => {
    if (!data) {
      return;
    }

    const { passwordHash } = data;
    const salt = genSaltSync(10);
    const password = hashSync(passwordHash, salt);
    const [result] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: password,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
      });

    const accessToken = await authServices.generateAccessToken(result.id);
    const refreshToken = await authServices.generateRefreshToken(result.id);
    await db.insert(refreshTokens).values({
      userId: result.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { result, accessToken, refreshToken };
  },

  login: async (data: { email: string; password: string }) => {
    const [result] = await db
      .select({
        id: users.id,
        password: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, data.email));

    const { password, id } = result;

    const passMatch = compareSync(data.password, password);
    if (!passMatch) return { success: false, message: "Wrong password" };

    const accessToken = await authServices.generateAccessToken(id);
    const refreshToken = await authServices.generateRefreshToken(id);

    await db.delete(refreshTokens).where(eq(refreshTokens.userId, id));
    await db.insert(refreshTokens).values({
      userId: result.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      success: true,
      message: "Login succesfull",
      accessToken,
      refreshToken,
    };
  },
  logout: async (token: string) => {
    const refreshToken = token;

    const deletedRefreshToken = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));

    if (deletedRefreshToken.rowCount === 0)
      return { success: false, message: "logout failed" };
    return { success: true, message: "Logout success" };
  },
  update: async (data: object, id: string) => {
    const updateData = data;
    await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id));

    return { succes: true, message: "user succesfully updated" };
  },
  passUpdate: async (password: string, id: string) => {
    const salt = genSaltSync(10);

    const passwordHash = hashSync(password, salt);
    console.log(passwordHash);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));
    return { success: true, message: "Password change" };
  },
};
