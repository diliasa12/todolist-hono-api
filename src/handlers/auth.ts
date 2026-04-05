import { sign, verify } from "hono/jwt";
import "dotenv/config";

export const authServices = {
  generateAccessToken: async (userId: string) => {
    console.log(userId);
    return await sign(
      { userId, exp: Math.floor(Date.now() / 1000) + 60 * 15 },
      process.env.SECRET_KEY!,
    );
  },
  generateRefreshToken: async (userId: string) =>
    await sign(
      { userId, exp: Math.floor(Date.now() / 1000) + 60 * 15 },
      process.env.REFRESH_KEY!,
    ),
  verifyAccessToken: async (token: string) =>
    await verify(token, process.env.SECRET_KEY!, "HS256"),

  verifyRefreshToken: async (token: string) =>
    await verify(token, process.env.REFRESH_KEY!, "HS256"),
};
