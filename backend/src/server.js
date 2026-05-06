import express from "express";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
const app = createApp();

app.listen(env.PORT, (req, res) => {
  console.log(
    `Server running at http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});
