import Order from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find()
			.sort({ createdAt: -1 })
			.populate("user", "name")
			.populate("products.product", "name");

		res.status(200).json({ orders });
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ message: "Failed to fetch orders" });
	}
};

export const getUserOrders = async (req, res) => {
	try {
		const userId = req.user._id;
		const orders = await Order.find({ user: userId })
			.sort({ createdAt: -1 })
			.populate("products.product", "name");

		res.status(200).json({ orders });
	} catch (error) {
		console.error("Error fetching user orders:", error);
		res.status(500).json({ message: "Failed to fetch your orders" });
	}
};

// Add this missing function
export const getOrderById = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user", "name email")
			.populate("products.product", "name price");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Check if user owns the order or is admin
		if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied" });
		}

		res.status(200).json(order);
	} catch (error) {
		console.error("Error fetching order:", error);
		res.status(500).json({ message: "Failed to fetch order" });
	}
};