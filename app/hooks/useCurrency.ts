// hooks/useCurrency.ts
import { useShopSettings } from '@/contexts/ShopSettingsContext';

const currencySymbols = {
    RON: 'lei',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

export function useCurrency() {
    const { settings } = useShopSettings();

    const formatPrice = (amount: number) => {
        if (!settings) return `${amount}`;

        const currency = settings.currency;
        // const symbol = currencySymbols[currency];

        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatPriceSimple = (amount: number) => {
        if (!settings) return `${amount}`;

        const symbol = currencySymbols[settings.currency];
        return `${amount.toFixed(2)} ${symbol}`;
    };

    return {
        currency: settings?.currency || 'EUR',
        symbol: currencySymbols[settings?.currency || 'EUR'],
        formatPrice,
        formatPriceSimple
    };
}