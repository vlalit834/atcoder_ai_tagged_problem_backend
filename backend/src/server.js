import express from "express";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDb, openDb } from "./db/connection.js";
import {
  getContests,
  getProblems,
  getMergedProblems,
  getProblemModels,
} from "./services/kenkoooo.service.js";

openDb();

const app = createApp();

const server = app.listen(env.PORT, (req, res) => {
  console.log(
    `Server running at http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
  prewarmCache();
});

/**
 * Pre-fetch the heavy upstream datasets right after boot and refresh them
 * periodically. The first user request then served from in-memory cache
 * (sub-50 ms) instead of waiting on a 3-5 s upstream round-trip.
 */
async function prewarmCache() {
  const t0 = Date.now();
  console.log("[prewarm] fetching upstream datasets...");
  const results = await Promise.allSettled([
    getContests(),
    getProblems(),
    getMergedProblems(),
    getProblemModels(),
  ]);
  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(
    `[prewarm] ${ok}/${results.length} datasets ready in ${Date.now() - t0} ms`,
  );
  // Refresh just before the in-memory TTL (60 min) expires
  setTimeout(prewarmCache, 55 * 60 * 1000).unref();
}

let shuttingDown = false;
function shutDown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Server] received ${signal}, shutting down`);
  const exitCleanly = (code) => {
    closeDb();
    console.log("[Server] bye");
    process.stdout.write("", () => process.exit(code));
  };
  server.close(() => exitCleanly(0));
  setTimeout(() => {
    console.log("[Server] force-closing");
    exitCleanly(0);
  }, 1000).unref();
}

process.on("SIGINT", () => shutDown("SIGINT"));
process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("[Server] unhandledRejection:", reason);
  shutDown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("[Server] uncaughtException:", err);
  shutDown("uncaughtException");
});