import { Hono } from "hono";
import "dotenv/config";
import { openAPIRouteHandler } from "hono-openapi";
import userRoute from "./routes/user.route";
import { logger } from "hono/logger";
const app = new Hono();

app.use(logger());
app.route("/api", userRoute);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  }),
);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
