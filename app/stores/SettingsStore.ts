import { create } from 'zustand';
import { ShopSettings } from '@/app/types';

interface SettingsState {
    settings: ShopSettings;
    isLoading: boolean;
    isSaving: boolean;
    isUploading: boolean;
    error: string | null;
    faviconFile: File | null;
    logoFile: File | null;
    faviconPreview: string | null;
    logoPreview: string | null;
    originalSettings: ShopSettings | null; // Track original state

    // Actions
    setShopName: (name: string) => void;
    setDescription: (description: string) => void;
    setCurrency: (currency: 'RON' | 'USD' | 'EUR') => void;
    setPaymentMethod: (method: string) => void;
    setFreeShipping: (enabled: boolean) => void;
    setFaviconFile: (file: File | null) => void;
    setLogoFile: (file: File | null) => void;
    setFaviconPreview: (url: string | null) => void;
    setLogoPreview: (url: string | null) => void;
    setBusinessHours: (hours: ShopSettings['businessHours']) => void;
    setContact: (contact: ShopSettings['contact']) => void;
    setSocialMedia: (social: ShopSettings['socialMedia']) => void;
    setFeatures: (features: Partial<ShopSettings['features']>) => void;
    setSEO: (seo: ShopSettings['seo']) => void;

    loadSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
    createSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
    resetForm: () => void;
    setError: (error: string | null) => void;
    setIsUploading: (uploading: boolean) => void;
    hasUnsavedChanges: () => boolean;
}

const defaultSettings: ShopSettings = {
    shopName: 'Flowering Stories',
    description: 'Your beautiful online store',
    tagline: '',
    logo: {
        favicon: '',
        headerLogo: '',
        footerLogo: ''
    },
    colors: {
        primary: '#9a6a63',
        secondary: '#c1a5a2',
        accent: '#f6eeec'
    },
    currency: 'EUR',
    timezone: 'Europe/Bucharest',
    paymentMethods: ['stripe'],
    shippingSettings: {
        freeShippingThreshold: 100,
        defaultShippingCost: 15,
        enableLocalPickup: true
    },
    contact: {
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Romania'
        }
    },
    socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: ''
    },
    businessHours: [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '16:00' },
        { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '16:00' }
    ],
    features: {
        enableReviews: true,
        enableWishlist: true,
        enableNewsletter: true,
        enableNotifications: true,
        maintenanceMode: false
    },
    seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        googleAnalytics: '',
        facebookPixel: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const useShopSettingsStore = create<SettingsState>((set, get) => ({
    settings: defaultSettings,
    isLoading: false,
    isSaving: false,
    isUploading: false,
    error: null,
    faviconFile: null,
    logoFile: null,
    faviconPreview: null,
    logoPreview: null,
    originalSettings: null,

    setShopName: (name) => set((state) => ({
        settings: { ...state.settings, shopName: name }
    })),

    setDescription: (description) => set((state) => ({
        settings: { ...state.settings, description }
    })),

    setCurrency: (currency) => set((state) => ({
        settings: { ...state.settings, currency }
    })),

    setPaymentMethod: (method) => set((state) => ({
        settings: { ...state.settings, paymentMethod: method }
    })),

    setFreeShipping: (enabled) => set((state) => ({
        settings: {
            ...state.settings,
            shippingSettings: {
                ...state.settings.shippingSettings,
                freeShippingThreshold: enabled ? 100 : 0
            }
        }
    })),

    setBusinessHours: (hours) => set((state) => ({
        settings: { ...state.settings, businessHours: hours }
    })),

    setContact: (contact) => set((state) => ({
        settings: { ...state.settings, contact: { ...state.settings.contact, ...contact } }
    })),

    setSocialMedia: (social) => set((state) => ({
        settings: { ...state.settings, socialMedia: { ...state.settings.socialMedia, ...social } }
    })),

    setFeatures: (features) => set((state) => ({
        settings: {
            ...state.settings,
            features: { ...state.settings.features, ...features }
        }
    })),

    setSEO: (seo) => set((state) => ({
        settings: { ...state.settings, seo: { ...state.settings.seo, ...seo } }
    })),

    setFaviconFile: (file) => set({ faviconFile: file }),
    setLogoFile: (file) => set({ logoFile: file }),
    setFaviconPreview: (url) => set({ faviconPreview: url }),
    setLogoPreview: (url) => set({ logoPreview: url }),
    setError: (error) => set({ error }),
    setIsUploading: (uploading) => set({ isUploading: uploading }),

    hasUnsavedChanges: () => {
        const { settings, originalSettings, faviconFile, logoFile } = get();
        if (!originalSettings) return false;

        return (
            JSON.stringify(settings) !== JSON.stringify(originalSettings) ||
            faviconFile !== null ||
            logoFile !== null
        );
    },

    loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/admin/settings');
            if (!response.ok) throw new Error('Failed to load settings');

            const data = await response.json();
            const settings = Array.isArray(data) ? data[0] : data;

            set({
                settings: { ...defaultSettings, ...settings },
                originalSettings: { ...defaultSettings, ...settings },
                faviconPreview: settings.logo?.favicon || null,
                logoPreview: settings.logo?.headerLogo || null
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to load settings' });
        } finally {
            set({ isLoading: false });
        }
    },

    saveSettings: async () => {
        const { settings, faviconPreview, logoPreview } = get();
        set({ isSaving: true, error: null });

        try {
            const updatedSettings = {
                ...settings,
                logo: {
                    ...settings.logo,
                    favicon: faviconPreview || settings.logo.favicon,
                    headerLogo: logoPreview || settings.logo.headerLogo
                }
            };

            const response = await fetch(`/api/admin/settings/${settings._id || ''}`, {
                method: settings._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }

            const savedSettings = await response.json();
            set({
                settings: savedSettings.settings || savedSettings,
                originalSettings: savedSettings.settings || savedSettings,
                faviconFile: null,
                logoFile: null
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to save settings' });
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },

    createSettings: async (newSettings) => {
        set({ isSaving: true, error: null });

        try {
            const settingsToCreate = { ...defaultSettings, ...newSettings };

            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsToCreate)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create settings');
            }

            const createdSettings = await response.json();
            set({
                settings: createdSettings.settings || createdSettings,
                originalSettings: createdSettings.settings || createdSettings,
                faviconFile: null,
                logoFile: null
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create settings' });
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },

    resetForm: () => {
        const { originalSettings } = get();
        if (originalSettings) {
            set({
                settings: { ...originalSettings },
                faviconFile: null,
                logoFile: null,
                faviconPreview: originalSettings.logo?.favicon || null,
                logoPreview: originalSettings.logo?.headerLogo || null,
                error: null
            });
        } else {
            set({
                settings: { ...defaultSettings },
                faviconFile: null,
                logoFile: null,
                faviconPreview: null,
                logoPreview: null,
                error: null
            });
        }
    }
}));