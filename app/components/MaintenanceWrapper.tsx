// app/components/MaintenanceWrapper.tsx
'use client';

import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useSession } from 'next-auth/react';
import { MaintenanceMode } from './MaintenanceMode';

export function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
    const { settings, loading } = useShopSettings();
    const { data: session } = useSession();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdf8f6]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9a6a63] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Maintenance mode check - dar nu pentru admin users
    if (settings?.features.maintenanceMode && session?.user?.role !== 'admin') {
        return <MaintenanceMode settings={settings} />;
    }

    return <>{children}</>;
}