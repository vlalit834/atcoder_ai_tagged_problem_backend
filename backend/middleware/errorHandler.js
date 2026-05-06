import { isProd } from "../src/config/env.js";

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    success: false,
    error: err.message || "Internal server error",
  };
  if (!isProd && status > 500) payload.stack = err.stack;
  if (status > 500) {
    console.log(`[error] ${req.method} ${req.originalUrl}`, err);
  }
  res.status(status).json(payload);
}
