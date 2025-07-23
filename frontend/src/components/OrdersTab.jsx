import { useEffect, useState } from "react";
import axios from "../lib/axios"; // Fixed: Use your configured axios instance

const OrdersTab = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				// Try different possible endpoints
				let res;
				try {
					res = await axios.get("/orders"); // Try without /api prefix first
				} catch (err) {
					if (err.response?.status === 404) {
						res = await axios.get("/api/orders"); // Fallback to /api/orders
					} else {
						throw err;
					}
				}
				
				setOrders(res.data.orders || res.data || []);
			} catch (err) {
				console.error("Error fetching orders:", err);
				setError("Failed to load orders");
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (loading) return <p className="text-gray-300 text-center">Loading orders...</p>;
	if (error) return <p className="text-red-500 text-center">{error}</p>;

	if (orders.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-400">No orders found</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm text-left text-gray-300">
				<thead className="text-xs uppercase bg-gray-700 text-gray-300">
					<tr>
						<th className="px-4 py-3">Customer</th>
						<th className="px-4 py-3">Products</th>
						<th className="px-4 py-3">Total</th>
						<th className="px-4 py-3">Date</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((order) => (
						<tr key={order._id} className="border-b border-gray-600">
							<td className="px-4 py-2">
								{order.user?.name || "Unknown"}
							</td>
							<td className="px-4 py-2">
								<ul className="list-disc pl-5">
									{order.products?.map((item, idx) => (
										<li key={idx}>
											{item.product?.name || "Unnamed"} × {item.quantity} – ${(item.price || 0).toFixed(2)}
										</li>
									)) || <li>No products</li>}
								</ul>
							</td>
							<td className="px-4 py-2 font-semibold">${(order.totalAmount || 0).toFixed(2)}</td>
							<td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default OrdersTab;