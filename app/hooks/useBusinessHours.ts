// hooks/useBusinessHours.ts
import { useShopSettings } from '@/contexts/ShopSettingsContext';

export function useBusinessHours() {
    const { settings } = useShopSettings();

    const isStoreOpen = () => {
        if (!settings) return true;

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // mon, tue, etc
        const currentTime = now.toTimeString().substring(0, 5); // HH:MM

        const todayHours = settings.businessHours.find(
            hours => hours.day.substring(0, 3) === currentDay
        );

        if (!todayHours || !todayHours.isOpen) {
            return false;
        }

        if (!todayHours.openTime || !todayHours.closeTime) {
            return true;
        }

        return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
    };

    const getTodayHours = () => {
        if (!settings) return null;

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

        return settings.businessHours.find(
            hours => hours.day.substring(0, 3) === currentDay
        );
    };

    return {
        isStoreOpen,
        getTodayHours,
        businessHours: settings?.businessHours || []
    };
}