import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllOrders, getUserOrders } from "../controllers/orders.controller.js";

const router = express.Router();

// GET /api/orders – Admin only
router.get("/", protectRoute, adminRoute, getAllOrders);

// Logged-in user: their orders only
router.get("/my-orders", protectRoute, getUserOrders);


export default router;
