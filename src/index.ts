import { Hono } from "hono";
import "dotenv/config";
import userRoute from "./routes/user.route";
import { logger } from "hono/logger";
const app = new Hono();

app.use(logger());
app.route("/api", userRoute);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
