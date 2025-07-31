import { useEffect, useState } from "react";
import axios from "../lib/axios";

const UserOrdersTab = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await axios.get("/orders/user"); // FIXED: Changed from "/orders/my-orders" to "/orders/user"
				setOrders(res.data.orders);
			} catch (err) {
			console.error("Error fetching user orders:", err);
			setError("Failed to load your orders");
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (loading) return <p className="text-center text-gray-300">Loading orders...</p>;
	if (error) return <p className="text-center text-red-500">{error}</p>;
	if (orders.length === 0) return <p className="text-center text-gray-300">You have no orders yet.</p>;

	return (
		<div className="space-y-6">
			{orders.map((order) => (
				<div
					key={order._id}
					className="border border-emerald-600 rounded-lg p-4 bg-gray-800 shadow-md"
				>
					<h3 className="text-lg font-semibold text-emerald-400 mb-2">
						Order #{order._id.slice(-6).toUpperCase()} – Total: ${order.totalAmount}
					</h3>
					<ul className="list-disc list-inside text-gray-200">
						{order.products.map((item, index) => (
						<li key={item.product?._id || index}>
							{item.product?.name
							? `${item.product.name} – ${item.quantity} x $${item.price}`
							: <span className="text-red-400 italic">Unknown product – {item.quantity} x ${item.price}</span>
							}
						</li>
						))}
					</ul>
					<p className="text-sm text-gray-400 mt-2">
						Placed on: {new Date(order.createdAt).toLocaleDateString()}
					</p>
				</div>
			))}
		</div>
	);
};

export default UserOrdersTab;