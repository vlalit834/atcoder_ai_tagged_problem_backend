import { Router } from "express";
import { listTags } from "../controllers/problems.controllers.js";
import { cacheControl } from "../middleware/cache.js";

const router = Router();
router.get("/", cacheControl(600), listTags);
export default router;
