import { Router } from "express";
import { listTags } from "../controllers/problems.controllers.js";

const router = Router();
router.get("/", listTags);
export default router;
