import { useEffect, useState } from "react";
import axios from "axios";

const OrdersTab = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await axios.get("/api/orders"); // 🔁 Tu peux adapter si besoin
				setOrders(res.data.orders);
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
									{order.products.map((item, idx) => (
										<li key={idx}>
											{item.product?.name || "Unnamed"} × {item.quantity} – ${item.price}
										</li>
									))}
								</ul>
							</td>
							<td className="px-4 py-2 font-semibold">${order.totalAmount.toFixed(2)}</td>
							<td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default OrdersTab;
