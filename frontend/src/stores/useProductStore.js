import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,
	error: null,

	setProducts: (products) => set({ products }),

	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
			toast.success("Product created successfully");
		} catch (error) {
			console.error("Error creating product:", error);
			toast.error(error.response?.data?.error || "Failed to create product");
			set({ loading: false });
		}
	},

	fetchAllProducts: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/products");
			set({ 
				products: response.data.products || response.data || [], 
				loading: false,
				error: null 
			});
		} catch (error) {
			console.error("Error fetching products:", error);
			set({ 
				error: "Failed to fetch products", 
				loading: false,
				products: [] 
			});
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},

	fetchProductsByCategory: async (category) => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ 
				products: response.data.products || response.data || [], 
				loading: false,
				error: null 
			});
		} catch (error) {
			console.error("Error fetching products by category:", error);
			set({ 
				error: "Failed to fetch products", 
				loading: false,
				products: [] 
			});
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},

	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prevState) => ({
				products: prevState.products.filter((product) => product._id !== productId),
				loading: false,
			}));
			toast.success("Product deleted successfully");
		} catch (error) {
			console.error("Error deleting product:", error);
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to delete product");
		}
	},

	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			set((prevState) => ({
				products: prevState.products.map((product) =>
					product._id === productId 
						? { ...product, isFeatured: response.data.isFeatured } 
						: product
				),
				loading: false,
			}));
			toast.success("Product updated successfully");
		} catch (error) {
			console.error("Error toggling featured product:", error);
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to update product");
		}
	},

	fetchFeaturedProducts: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/products/featured");
			set({ 
				products: response.data || [], 
				loading: false,
				error: null 
			});
		} catch (error) {
			console.error("Error fetching featured products:", error);
			set({ 
				error: "Failed to fetch products", 
				loading: false,
				products: [] 
			});
		}
	},
}));