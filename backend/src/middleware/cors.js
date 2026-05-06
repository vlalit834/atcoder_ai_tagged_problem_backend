import cors from "cors";
import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin: env.ALLOWED_ORIGINS.includes("*") ? true : env.ALLOWED_ORIGINS,
  credentials: true,
});
