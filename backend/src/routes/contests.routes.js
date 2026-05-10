import { Router } from "express";
import { listContests } from "../controllers/problems.controllers.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { cacheControl } from "../middleware/cache.js";
const router = Router();
router.get("/", cacheControl(3600), asyncHandler(listContests));
export default router;
