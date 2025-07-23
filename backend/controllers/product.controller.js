import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

const ONE_HOUR = 3600; // seconds

export const getAllProducts = async (req, res) => {
	try {
		let allProducts = await redis.get("all_products");
		if (allProducts) {
			return res.json(JSON.parse(allProducts));
		}

		allProducts = await Product.find({}).lean();
		await redis.set("all_products", JSON.stringify(allProducts), "EX", ONE_HOUR);

		res.json({ products: allProducts });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		await redis.set("featured_products", JSON.stringify(featuredProducts), "EX", ONE_HOUR);

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		let recommended = await redis.get("recommended_products");
		if (recommended) {
			return res.json(JSON.parse(recommended));
		}

		const products = await Product.aggregate([
			{ $sample: { size: 4 } },
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		await redis.set("recommended_products", JSON.stringify(products), "EX", ONE_HOUR);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		console.log("📦 Received product data:", req.body);

		const { name, description, price, image, category } = req.body;

		if (!name || !price) {
			return res.status(400).json({ message: "Missing required fields: name and price" });
		}

		let cloudinaryResponse = null;

		if (image) {
			console.log("📸 Uploading image to Cloudinary...");
			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
			console.log("✅ Image uploaded:", cloudinaryResponse?.secure_url);
		}

		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url || "",
			category,
		});

		console.log("✅ Product created:", product);

		// Clear related cache
		await redis.del("all_products");
		if (product.isFeatured) await updateFeaturedProductsCache();

		res.status(201).json(product);
	} catch (error) {
		console.log("❌ Error in createProduct controller:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloudinary");
			} catch (error) {
				console.log("error deleting image from cloudinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		// Refresh caches
		await redis.del("all_products");
		await redis.del("recommended_products");
		if (product.isFeatured) await updateFeaturedProductsCache();

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function updateFeaturedProductsCache() {
	try {
		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts), "EX", ONE_HOUR);
	} catch (error) {
		console.log("error in update cache function", error);
	}
}
