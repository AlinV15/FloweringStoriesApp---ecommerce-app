
// storeuseProductStore.ts
import { create } from 'zustand';
import { ProductEntry } from '@/app/types/index';
import { getBestseller, getFeaturedProductsBayesian, getNewestProduct } from '@/lib/utils/rating';

interface ProductStore {
    products: ProductEntry[];

    allProducts: ProductEntry[]; // ✅ adăugat aici
    loading: boolean;
    error: string | null;
    fetchProducts: () => Promise<void>;
    setProducts: (products: ProductEntry[]) => void;
    setAllProducts: (products: ProductEntry[]) => void; // ✅ adăugat
    getFeatured: () => ProductEntry[];
    getBestseller: () => ProductEntry | null;
    getNewest: () => ProductEntry | null;
    updateProduct: (id: string, data: Partial<ProductEntry>) => Promise<ProductEntry | null>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    allProducts: [], // ✅ inițializare
    loading: false,
    error: null,

    setProducts: (products: ProductEntry[]) => set({ products }),
    setAllProducts: (products: ProductEntry[]) => set({ allProducts: products, products }), // ✅ setare completă

    fetchProducts: async () => {
        set({ loading: true, error: null });

        try {
            const res = await fetch('/api/product');
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            console.log("Fetched products:", data.products); // Debugging line

            set({
                allProducts: data.products,
                products: data.products,
                loading: false
            }); // ✅ actualizezi ambele
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },


    getFeatured: () => {
        const { products } = get();
        return getFeaturedProductsBayesian(products, 4, 0);
    },

    getBestseller: () => getBestseller(get().products),
    getNewest: () => getNewestProduct(get().products),
    updateProduct: async (id: string, data: Partial<ProductEntry>) => {
        try {
            const res = await fetch(`/api/product/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update product");

            const updatedProduct = await res.json();

            // Update the product in the local state
            set(state => ({
                products: state.products.map(p =>
                    p._id === id ? { ...p, ...updatedProduct.product } : p
                )
            }));

            return updatedProduct.product;
        } catch (err: any) {
            set({ error: err.message });
            return null;
        }
    },
}));


