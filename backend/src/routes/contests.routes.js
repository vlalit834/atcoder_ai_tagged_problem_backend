import { Router } from "express";
import { listContests } from "../controllers/problems.controllers.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const router = Router();
router.get("/", asyncHandler(listContests));
export default router;
