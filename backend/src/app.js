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

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(express.json());
  app.get("/", (req, res) => {
    ok(res, {
      name: "ai_tagged_atcoder_probelms_backend",
      endpoints: {
        health: "GET /health",
      },
    });
  });
  app.use("/health", healthRoutes);
  app.use("/problems", problemsRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
