import { create } from 'zustand';
import { Subcategory } from '../types';

interface SubcategoryStore {
    subcategories: Subcategory[];
    loading: boolean;
    error: string | null;
    fetchSubcategories: () => Promise<void>;
    setSubcategories: (subcategories: Subcategory[]) => void;
    getSubcategoryById: (id: string) => Subcategory | undefined;
    getSubcategoryByType: (type: string) => Subcategory[];
    deleteSubcategory: (id: string) => Promise<boolean>;
}

const useSubcategoryStore = create<SubcategoryStore>((set, get) => ({
    subcategories: [],
    loading: false,
    error: null,
    setSubcategories: (subcategories: Subcategory[]) => set({ subcategories }),
    fetchSubcategories: async () => {
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/subcategory');
            if (!res.ok) throw new Error("Failed to fetch subcategories");
            const data = await res.json();
            set({ subcategories: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
    getSubcategoryById: (id: string) => {
        const { subcategories } = get();
        return subcategories.find((subcategory) => subcategory._id === id);
    },
    getSubcategoryByType: (type: string) => {
        const { subcategories } = get();
        return subcategories.filter((subcategory) => subcategory.type === type);
    },
    deleteSubcategory: async (id: string) => {
        try {
            // Delete the subcategory
            const deleteRes = await fetch(`/api/subcategory/${id}`, {
                method: 'DELETE',
            });

            if (!deleteRes.ok) {
                throw new Error("Failed to delete category");
            }

            // After successful deletion, refresh the subcategories
            await get().fetchSubcategories();
            return true;
        } catch (err: any) {
            set({ error: err.message });
            return false;
        }
    },
}));

export default useSubcategoryStore;