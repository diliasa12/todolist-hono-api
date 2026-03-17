import { createMiddleware } from "hono/factory";
import { authServices } from "../handlers/auth";
const auth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];

  await authServices
    .verifyAccessToken(token)
    .catch((err) => c.json({ error: err.message }, 401));
  await next();
});
export default auth;
