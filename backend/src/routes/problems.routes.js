import { Router } from "express";
import { listProblems } from "../controllers/problems.controllers.js";

const router = Router();
router.get("/", listProblems);

export default router;
