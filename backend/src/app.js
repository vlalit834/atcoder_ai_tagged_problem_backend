import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { ok } from "./utils/apiResponse.js";
import healthRoutes from "./routes/health.routes.js";
import { corsMiddleware } from "./middleware/cors.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import problemsRoutes from "./routes/problems.routes.js";
import tagsRoutes from "./routes/tags.routes.js";
import contestsRoute from "./routes/contests.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { env } from "./config/env.js";
export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use("/health", healthRoutes);
  app.use(apiLimiter);
  app.get("/", (req, res) => {
    ok(res, {
      name: "ai_tagged_atcoder_problems_backend",
      endpoints: {
        health: "GET /health",
        problems: "GET /problems?page=1&limit=20&tag=dp",
        allProblems: "GET /problems/all",
        difficulties: "GET /problems/difficulties",
        userSubmissions: "GET /problems/user/:username/submissions",
        tags: "GET /tags",
        contests: "GET /contests?category=abc",
      },
    });
  });
  app.use("/problems", problemsRoutes);
  app.use("/tags", tagsRoutes);
  app.use("/contests", contestsRoute);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
