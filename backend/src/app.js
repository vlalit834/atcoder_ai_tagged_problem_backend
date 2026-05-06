import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { ok } from "./utils/apiResponse.js";
import healthRoutes from "./routes/health.routes.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
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
  return app;
}
