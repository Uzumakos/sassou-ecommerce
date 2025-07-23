import { redis } from "../lib/redis.js";

export const clearCacheManually = async (req, res) => {
	try {
		await redis.del("featured_products");
		await redis.del("recommended_products");
		await redis.del("all_products");

		res.json({ message: "Cache cleared successfully" });
	} catch (error) {
		console.log("Error clearing cache manually:", error.message);
		res.status(500).json({ message: "Failed to clear cache", error: error.message });
	}
};
