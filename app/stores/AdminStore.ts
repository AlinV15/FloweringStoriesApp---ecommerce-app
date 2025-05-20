// stores/adminStore.ts
import { create } from 'zustand';

interface AdminState {
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    totalUsers: number;
    setStats: (stats: Partial<AdminState>) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    setStats: (stats) => set((state) => ({ ...state, ...stats })),
}));
