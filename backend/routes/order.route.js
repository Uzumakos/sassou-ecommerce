import express from "express";
import { getAllOrders, getUserOrders, getOrderById } from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// IMPORTANT: Put specific routes BEFORE dynamic routes!
// Get user's orders (must come before /:id route)
router.get("/user", protectRoute, getUserOrders);

// Get all orders (Admin only)
router.get("/", protectRoute, adminRoute, getAllOrders);

// Get single order by ID (must come LAST because it's dynamic)
router.get("/:id", protectRoute, getOrderById);

export default router;