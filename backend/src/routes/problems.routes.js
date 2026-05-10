import { Router } from "express";
import {
  listProblems,
  listAllProblems,
  listDifficulties,
  userSubmissions,
} from "../controllers/problems.controllers.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const router = Router();
router.get("/", listProblems);
router.get("/all", asyncHandler(listAllProblems));
router.get("/difficulties", asyncHandler(listDifficulties));
router.get("/user/:username/submissions", asyncHandler(userSubmissions));
export default router;
