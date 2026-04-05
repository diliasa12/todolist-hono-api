import { createMiddleware } from "hono/factory";
import { authServices } from "../handlers/auth";
import { decode } from "hono/jwt";
const auth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await authServices.verifyAccessToken(token);
    console.log("payload:", payload); // sekarang baru kelihatan isinya
    c.set("userId", payload.userId as string);
    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    console.log("verify gagal:", message); // ← ini yang penting dilihat
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
});
export default auth;
