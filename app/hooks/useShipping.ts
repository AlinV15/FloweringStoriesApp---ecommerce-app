import { useShopSettings } from '@/contexts/ShopSettingsContext';

export function useShipping() {
    const { settings } = useShopSettings();

    const calculateShipping = (orderTotal: number, items?: any[]) => {
        if (!settings) return 0;

        const { shippingSettings } = settings;

        // Free shipping threshold
        if (orderTotal >= shippingSettings.freeShippingThreshold) {
            return 0;
        }

        return shippingSettings.defaultShippingCost;
    };

    const getShippingOptions = () => {
        if (!settings) return [];

        const options = [
            {
                id: 'standard',
                name: 'Standard Shipping',
                cost: settings.shippingSettings.defaultShippingCost,
                description: `Delivery in 3-5 business days`
            }
        ];

        if (settings.shippingSettings.enableLocalPickup) {
            options.push({
                id: 'pickup',
                name: 'Local Pickup',
                cost: 0,
                description: 'Pick up from our store'
            });
        }

        return options;
    };

    return {
        calculateShipping,
        getShippingOptions,
        freeShippingThreshold: settings?.shippingSettings.freeShippingThreshold || 0,
        defaultShippingCost: settings?.shippingSettings.defaultShippingCost || 0
    };
}
