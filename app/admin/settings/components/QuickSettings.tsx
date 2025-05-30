// components/admin/QuickSettings.tsx
'use client';

import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { MaintenanceToggle } from './MaintenanceToggle';
import { useState } from 'react';

export function QuickSettings() {
    const { settings } = useShopSettings();

    if (!settings) return null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-6">Quick Settings</h2>
            </div>

            <MaintenanceToggle />

            {/* Alte toggle-uri rapide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureToggle
                    feature="enableReviews"
                    title="Product Reviews"
                    description="Allow customers to leave reviews on products"
                />

                <FeatureToggle
                    feature="enableWishlist"
                    title="Wishlist"
                    description="Let customers save products to their wishlist"
                />

                <FeatureToggle
                    feature="enableNewsletter"
                    title="Newsletter"
                    description="Show newsletter signup forms"
                />

                <FeatureToggle
                    feature="enableNotifications"
                    title="Notifications"
                    description="Send notifications to customers"
                />
            </div>
        </div>
    );
}
type Features = {
    enableReviews: boolean;
    enableWishlist: boolean;
    enableNewsletter: boolean;
    enableNotifications: boolean;
};

function FeatureToggle({
    feature,
    title,
    description
}: {
    feature: keyof Features;
    title: string;
    description: string;
}) {
    const { settings, updateSettings } = useShopSettings();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async () => {
        if (!settings || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateSettings({
                features: {
                    ...settings.features,
                    [feature]: !settings.features[feature]
                }
            });
        } catch (error) {
            console.error(`Error toggling ${feature}:`, error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!settings) return null;

    const isEnabled = settings.features[feature];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>
        </div>
    );
}