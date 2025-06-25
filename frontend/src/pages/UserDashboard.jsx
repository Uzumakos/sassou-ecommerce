import { ListOrdered, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import UserOrdersTab from "../components/UserOrdersTab";
import { useUserStore } from "../stores/useUserStore";

const tabs = [
	{ id: "orders", label: "My Orders", icon: ListOrdered },
];

const UserDashboard = () => {
	const [activeTab, setActiveTab] = useState("orders");
	const { user, logout } = useUserStore();

	if (!user) return <p className="text-center text-gray-300">You must be logged in</p>;

	return (
		<div className='min-h-screen relative overflow-hidden'>
			<div className='container mx-auto px-4 py-16'>
				<motion.h1
					className='text-4xl font-bold mb-8 text-emerald-400 text-center'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					User Dashboard
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
					<button
						onClick={logout}
						className='flex items-center px-4 py-2 mx-2 rounded-md bg-red-600 text-white hover:bg-red-700'
					>
						<LogOut className='mr-2 h-5 w-5' />
						Logout
					</button>
				</div>

				{activeTab === "orders" && <UserOrdersTab />}
			</div>
		</div>
	);
};

export default UserDashboard;
