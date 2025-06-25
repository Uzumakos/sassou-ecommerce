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