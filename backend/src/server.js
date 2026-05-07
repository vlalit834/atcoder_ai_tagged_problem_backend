import express from "express";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDb, openDb } from "./db/connection.js";

openDb();

const app = createApp();

const server = app.listen(env.PORT, (req, res) => {
  console.log(
    `Server running at http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});

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
  }, 2000).unref();
}

process.on("SIGINT", () => shutDown("SIGINT"));
process.on("SIGTERM", () => shutDown("SIGTERM"));