import { Router } from "express";
import { ok, fail } from "../utils/apiResponse.js";
import { getDb } from "../db/connection.js";

const router = Router();

router.get("/", (req, res) => {
  const checks = {
    server: "ok",
    uptime_seconds: Math.floor(process.uptime()),
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  };

  try {
    const result = getDb().prepare("SELECT COUNT(*) AS c FROM problems").get();
    checks.database = "ok";
    checks.problem_count = result.c;
  } catch (err) {
    checks.database = "error";
    checks.database_error = err.message;
    return fail(res, checks, 503);
  }

  ok(res, checks);
});

export default router;