'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ShopSettingsProvider } from '@/contexts/ShopSettingsContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ShopSettingsProvider>
                {children}
            </ShopSettingsProvider>
        </SessionProvider>
    );
}