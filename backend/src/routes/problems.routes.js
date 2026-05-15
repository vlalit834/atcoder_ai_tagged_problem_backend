import { Router } from "express";
import {
  listProblems,
  listAllProblems,
  listDifficulties,
  userSubmissions,
} from "../controllers/problems.controllers.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { cacheControl, noCache } from "../middleware/cache.js";
const router = Router();
router.get("/", cacheControl(3600), asyncHandler(listProblems));
router.get("/all", cacheControl(1800), asyncHandler(listAllProblems));
router.get("/difficulties", cacheControl(3600), asyncHandler(listDifficulties));
router.get(
  "/user/:username/submissions",
  cacheControl(300),
  asyncHandler(userSubmissions),
);
export default router;