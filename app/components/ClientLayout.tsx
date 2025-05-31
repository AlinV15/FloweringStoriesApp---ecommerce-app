// app/components/ClientLayout.tsx (Updated with stock management)
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { ShopSettingsProvider } from '@/contexts/ShopSettingsContext';
import StockNotifications from '@/app/components/StockNotifications';
import { useStockSync } from '@/app/hooks/useStockSync';

// Stock Sync Provider Component
const StockSyncProvider = ({ children }: { children: ReactNode }) => {
    // Initialize stock sync with custom options
    const { manualSync, isActive, lastSync } = useStockSync({
        syncInterval: 30000, // Sync every 30 seconds
        syncOnMount: true,   // Sync when app loads
        syncOnFocus: true,   // Sync when window gains focus
        syncOnVisible: true  // Sync when page becomes visible
    });

    // Show stock sync status in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Stock sync active:', isActive);
            if (lastSync) {
                console.log('📅 Last sync:', new Date(lastSync).toLocaleTimeString());
            }
        }
    }, [isActive, lastSync]);

    // Expose manual sync globally for emergency use
    useEffect(() => {
        (window as any).__manualStockSync = manualSync;

        return () => {
            delete (window as any).__manualStockSync;
        };
    }, [manualSync]);

    return (
        <>
            {children}
            <StockNotifications />
        </>
    );
};

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ShopSettingsProvider>
                <StockSyncProvider>
                    {children}
                </StockSyncProvider>
            </ShopSettingsProvider>
        </SessionProvider>
    );
}