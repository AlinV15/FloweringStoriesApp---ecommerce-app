
// storeuseProductStore.ts
import { create } from 'zustand';
import { ProductEntry } from '@/app/types/index';
import { getBestseller, getFeaturedProductsBayesian, getNewestProduct } from '@/lib/utils/rating';

interface ProductStore {
    products: ProductEntry[];
    loading: boolean;
    error: string | null;
    fetchProducts: () => Promise<void>;
    getFeatured: () => ProductEntry[];
    getBestseller: () => ProductEntry | null;
    getNewest: () => ProductEntry | null;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    loading: false,
    error: null,


    fetchProducts: async () => {
        set({ loading: true, error: null });

        try {
            const res = await fetch('/api/product'); // Endpointul tău unificat
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();

            set({ products: data.products, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
    getFeatured: () => {
        const { products } = get();
        return getFeaturedProductsBayesian(products, 4, 0);
    },
    getBestseller: () => {
        const products = get().products;
        return getBestseller(products);
    },

    getNewest: () => {
        const products = get().products;
        return getNewestProduct(products);
    }
}));

