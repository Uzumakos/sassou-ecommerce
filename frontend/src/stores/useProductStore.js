import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,
	error: null,

	setProducts: (products) => set({ products }),

	// ✅ ADMIN: Fetch all products (requires auth)
	fetchAdminProducts: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/products"); // protected route
			set({ products: response.data.products || [], loading: false });
		} catch (error) {
			console.error("❌ Admin fetch failed:", error);
			toast.error(error.response?.data?.message || "Not authorized or failed to fetch products");
			set({ products: [], loading: false, error: "Admin fetch failed" });
		}
	},

	// ✅ PUBLIC: Fetch featured products (homepage)
	fetchFeaturedProducts: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/products/featured");
			set({ products: response.data.products || [], loading: false });
		} catch (error) {
			console.error("❌ Featured fetch failed:", error);
			toast.error(error.response?.data?.message || "Failed to fetch featured products");
			set({ loading: false, error: "Featured fetch failed" });
		}
	},

	// ✅ PUBLIC: Fetch by category
	fetchProductsByCategory: async (category) => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products || [], loading: false });
		} catch (error) {
			console.error("❌ Category fetch failed:", error);
			toast.error(error.response?.data?.message || "Failed to fetch category products");
			set({ loading: false, error: "Category fetch failed" });
		}
	},

	// ✅ Create product (admin only)
	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((prev) => ({
				products: [...prev.products, res.data],
				loading: false,
			}));
			toast.success("Product created successfully!");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create product");
			set({ loading: false });
		}
	},

	// ✅ Delete product (admin only)
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prev) => ({
				products: prev.products.filter((p) => p._id !== productId),
				loading: false,
			}));
			toast.success("Product deleted");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete product");
			set({ loading: false });
		}
	},

	// ✅ Toggle featured (admin only)
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			set((prev) => ({
				products: prev.products.map((product) =>
					product._id === productId
						? { ...product, isFeatured: response.data.isFeatured }
						: product
				),
				loading: false,
			}));
			toast.success("Product updated");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update product");
			set({ loading: false });
		}
	},
}));
