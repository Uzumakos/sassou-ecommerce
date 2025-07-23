import {
	BarChart3,
	PlusCircle,
	ShoppingBag,
	ReceiptText,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import OrdersTab from "../components/OrdersTab";
import { useProductStore } from "../stores/useProductStore";
// ✅ Auth store

const tabs = [
	{ id: "create", label: "Create Product", icon: PlusCircle },
	{ id: "products", label: "Products", icon: ShoppingBag },
	{ id: "analytics", label: "Analytics", icon: BarChart3 },
	{ id: "orders", label: "Orders", icon: ReceiptText },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);


	const handleClearCache = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to clear the Redis cache?\nThis may affect featured products."
		);
		if (!confirmed) return;

		try {
			await axios.delete("/admin/clear-cache");
			toast.success("Redis cache cleared successfully!");
		} catch (error) {
			console.error("Failed to clear Redis cache:", error);
			toast.error("Failed to clear cache");
		}
	};

	return (
		<div className='min-h-screen relative overflow-hidden'>
			<div className='relative z-10 container mx-auto px-4 py-16'>
				<motion.h1
					className='text-4xl font-bold mb-8 text-emerald-400 text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					Admin Dashboard
				</motion.h1>

				<div className='flex justify-center mb-8'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
								activeTab === tab.id
									? "bg-emerald-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							<tab.icon className='mr-2 h-5 w-5' />
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === "create" && <CreateProductForm />}
				{activeTab === "products" && <ProductsList />}
				{activeTab === "analytics" && <AnalyticsTab />}
				{activeTab === "orders" && (
					<>
						<OrdersTab />
						<div className='mt-6 flex justify-center'>
							<button
								onClick={handleClearCache}
								className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition'
							>
								<Trash2 size={18} />
								Clear Redis Cache
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AdminPage;
