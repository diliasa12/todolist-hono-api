import { Hono } from "hono";
import userRoute from "./routes/user.route";

const app = new Hono();
app.route("/api/auth", userRoute);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
