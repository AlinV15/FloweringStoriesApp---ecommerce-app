import React from "react";
import { useCartStore } from "../stores/CartStore";
import { useSession } from "next-auth/react";

// Hook pentru inițializarea cart-ului user-specific
export const useUserCart = () => {
    const { data: session, status } = useSession();
    const setCurrentUser = useCartStore(state => state.setCurrentUser);
    //const loadUserCart = useCartStore(state => state.loadUserCart);

    React.useEffect(() => {
        if (status !== 'loading') {
            const userId = session?.user?.id || null;
            setCurrentUser(userId);
        }
    }, [session, status, setCurrentUser]);
};

// Toast notification utility (rămâne la fel)
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    toast.className = `fixed top-20 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all transform translate-x-0`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

// Hook for periodic stock sync (rămâne la fel)
export const useStockSync = (intervalMs: number = 30000) => {
    const syncStockWithServer = useCartStore(state => state.syncStockWithServer);

    React.useEffect(() => {
        const interval = setInterval(() => {
            syncStockWithServer();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [syncStockWithServer, intervalMs]);
};