import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { clearCacheManually } from "../controllers/admin.controller.js";

const router = express.Router();

router.delete("/clear-cache", protectRoute, adminRoute, clearCacheManually);

export default router;
