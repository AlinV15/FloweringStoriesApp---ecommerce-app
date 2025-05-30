// contexts/ShopSettingsContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface ShopSettings {
    _id?: string;
    shopName: string;
    description: string;
    tagline?: string;
    logo: {
        favicon?: string;
        headerLogo?: string;
        footerLogo?: string;
    };
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    currency: 'RON' | 'USD' | 'EUR' | 'GBP';
    timezone: string;
    paymentMethods: string[];
    shippingSettings: {
        freeShippingThreshold: number;
        defaultShippingCost: number;
        enableLocalPickup: boolean;
    };
    contact: {
        email?: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
        };
    };
    socialMedia: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
    };
    businessHours: Array<{
        day: string;
        isOpen: boolean;
        openTime?: string;
        closeTime?: string;
    }>;
    features: {
        enableReviews: boolean;
        enableWishlist: boolean;
        enableNewsletter: boolean;
        enableNotifications: boolean;
        maintenanceMode: boolean;
    };
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        googleAnalytics?: string;
        facebookPixel?: string;
    };
}

interface ShopSettingsContextType {
    settings: ShopSettings | null;
    loading: boolean;
    error: string | null;
    updateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const ShopSettingsContext = createContext<ShopSettingsContextType | undefined>(undefined);

export function ShopSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<ShopSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch shop settings');
            }
            const data = await response.json();
            setSettings(data);

            // Apply theme colors to CSS variables
            if (data.colors) {
                document.documentElement.style.setProperty('--color-primary', data.colors.primary);
                document.documentElement.style.setProperty('--color-secondary', data.colors.secondary);
                document.documentElement.style.setProperty('--color-accent', data.colors.accent);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<ShopSettings>) => {
        try {
            const response = await fetch('/api/shop-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSettings),
            });

            if (!response.ok) {
                throw new Error('Failed to update shop settings');
            }

            const updatedSettings = await response.json();
            setSettings(updatedSettings);

            // Update CSS variables if colors changed
            if (newSettings.colors) {
                document.documentElement.style.setProperty('--color-primary', updatedSettings.colors.primary);
                document.documentElement.style.setProperty('--color-secondary', updatedSettings.colors.secondary);
                document.documentElement.style.setProperty('--color-accent', updatedSettings.colors.accent);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update settings');
            throw err;
        }
    };

    const refreshSettings = async () => {
        await fetchSettings();
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <ShopSettingsContext.Provider
            value={{
                settings,
                loading,
                error,
                updateSettings,
                refreshSettings,
            }}
        >
            {children}
        </ShopSettingsContext.Provider>
    );
}

export function useShopSettings() {
    const context = useContext(ShopSettingsContext);
    if (context === undefined) {
        throw new Error('useShopSettings must be used within a ShopSettingsProvider');
    }
    return context;
}