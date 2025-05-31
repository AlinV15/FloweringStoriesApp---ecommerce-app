// app/components/ClientLayout.tsx (Updated - stock notifications only for admin)
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShopSettingsProvider } from '@/contexts/ShopSettingsContext';
import StockNotifications from '@/app/components/StockNotifications';
import { useStockSync } from '@/app/hooks/useStockSync';
import { useUserCart } from '@/app/hooks/useUserCart';

// Cart Initializer Component
const CartInitializer = () => {
    useUserCart(); // Inițializează cart-ul specific pentru utilizator
    return null;
};

// Stock Sync Provider Component
const StockSyncProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    // Initialize stock sync with custom options
    const { manualSync, isActive, lastSync } = useStockSync({
        syncInterval: isAdmin ? 30000 : 60000, // Admin: 30s, Users: 60s
        syncOnMount: true,
        syncOnFocus: true,
        syncOnVisible: true
    });

    // Show stock sync status in development (only for admin)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && isAdmin) {
            console.log('🔄 Stock sync active:', isActive);
            if (lastSync) {
                console.log('📅 Last sync:', new Date(lastSync).toLocaleTimeString());
            }
        }
    }, [isActive, lastSync, isAdmin]);

    // Expose manual sync globally for emergency use (admin only)
    useEffect(() => {
        if (isAdmin) {
            (window as any).__manualStockSync = manualSync;

            return () => {
                delete (window as any).__manualStockSync;
            };
        }
    }, [manualSync, isAdmin]);

    return (
        <>
            {children}
            {/* Afișează notificările de stock doar pentru admin */}
            {isAdmin && <StockNotifications />}
        </>
    );
};

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ShopSettingsProvider>
                <CartInitializer />
                <StockSyncProvider>
                    {children}
                </StockSyncProvider>
            </ShopSettingsProvider>
        </SessionProvider>
    );
}