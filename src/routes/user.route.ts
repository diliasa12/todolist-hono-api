import { Context, Hono } from "hono";
import db from "../db/db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { user } from "../handlers/user.service";
import { NewUser } from "../db/schema";
import auth from "../middlewares/auth.middleware";
import { User } from "../utils/validation";
const userRoute = new Hono();

userRoute.get("/:id", auth, async (c) => {
  const id = c.req.param("id");
  const [data] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, id));
  c.status(200);
  return c.json({ succes: true, data });
});
userRoute.post("/register", async (c) => {
  const content: NewUser = await c.req.json();
  const data = User.parse(content);
  const result = await user.register(data);
  if (!result) {
    c.status(400);
    return c.json({ success: false, message: "Request body doesn't exist" });
  }
  c.status(201);
  return c.json({ succes: true, data: result });
});
userRoute.post("/login", async (c) => {
  const data: { email: string; password: string } = await c.req.json();
  if (!data) {
    c.status(400);
    return c.json({ succes: false, message: "data doesnt exist" });
  }

  const result = await user.login(data);
  c.status(200);
  return c.json(result);
});

userRoute.delete("/logout", auth, async (c: Context) => {
  console.log("masuk");

  const { refreshToken } = await c.req.json();
  if (!refreshToken) return c.json("require refreshToken in req body", 400);
  const result = await user.logout(refreshToken);
  console.log(result);
  return c.json(result, 200);
});

userRoute.patch("/update/:id", auth, async (c) => {
  const { email, username } = await c.req.json();
  const id = c.req.param("id");
  const result = await user.update({ email, username }, id);

  return c.json({ success: true, result }, 202);
});
userRoute.patch("/password/:id", auth, async (c) => {
  const { password } = await c.req.json();
  const id = c.req.param("id");
  const result = await user.passUpdate(password, id);
  c.status(202);
  return c.json(result);
});
export default userRoute;
