// components/FeatureGuard.tsx
'use client';

import { useShopSettings } from '@/contexts/ShopSettingsContext';

interface FeatureGuardProps {
    feature: 'enableReviews' | 'enableWishlist' | 'enableNewsletter' | 'enableNotifications';
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback = null }: FeatureGuardProps) {
    const { settings } = useShopSettings();

    if (!settings || !settings.features[feature]) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}