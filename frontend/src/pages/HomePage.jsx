import { useEffect } from "react";
import { motion } from "framer-motion";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import Hero from "../pages/Hero";
import Footer from "../components/Footer";

const categories = [
	{ href: "/skin care", name: "Skin Care", imageUrl: "/lwil_hero.jpg" },
	{ href: "/hair care", name: "Hair Care", imageUrl: "/package1.jpg" },
	{ href: "/candle", name: "Candle", imageUrl: "/puppy1.jpg" },
	{ href: "/soap", name: "Soap", imageUrl: "/savon2.jpg" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, loading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<Hero />

			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
					Explore Our Categories
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
					Discover our latest product trends
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{/* ✅ Loading, Empty or Data states */}
				<div className='mt-16'>
					{loading ? (
						<motion.div
							className='flex justify-center items-center mt-10'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ repeat: Infinity, repeatType: "loop", duration: 1 }}
						>
							<motion.div
								className='w-8 h-8 rounded-full bg-emerald-400 mr-2'
								animate={{ y: [0, -10, 0] }}
								transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
							/>
							<motion.div
								className='w-8 h-8 rounded-full bg-emerald-500 mr-2'
								animate={{ y: [0, -15, 0] }}
								transition={{ repeat: Infinity, duration: 0.6, delay: 0.2, ease: "easeInOut" }}
							/>
							<motion.div
								className='w-8 h-8 rounded-full bg-emerald-600'
								animate={{ y: [0, -10, 0] }}
								transition={{ repeat: Infinity, duration: 0.6, delay: 0.4, ease: "easeInOut" }}
							/>
						</motion.div>
					) : Array.isArray(products) && products.length > 0 ? (
						<FeaturedProducts featuredProducts={products} />
					) : (
						<p className='text-center text-gray-500 mt-10'>
							No featured products available.
						</p>
					)}
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default HomePage;
