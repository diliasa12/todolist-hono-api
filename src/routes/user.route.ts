import { Hono } from "hono";
import db from "../db/db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { user } from "../services/user.service";
import { NewUser } from "../../types";
const userRoute = new Hono();
userRoute.get("/:id", async (c) => {
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
  const data: NewUser = await c.req.json();
  console.log(data);
  const result: { id: string; username: string; email: string }[] | null =
    await user.register(data);
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
export default userRoute;
