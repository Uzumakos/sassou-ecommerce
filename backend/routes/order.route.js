import express from "express";
import { getAllOrders, getUserOrders, getOrderById } from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all orders (Admin only)
router.get("/", protectRoute, adminRoute, getAllOrders);

// Get user's orders
router.get("/user", protectRoute, getUserOrders);

// Get single order by ID
router.get("/:id", protectRoute, getOrderById);

export default router;