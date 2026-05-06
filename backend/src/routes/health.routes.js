import { Router } from "express";
import { ok } from "../utils/apiResponse.js";
const router = Router();

router.get("/", (req, res) => {
  ok(res, { status: "ok", uptime: process.uptime() });
});

export default router;
