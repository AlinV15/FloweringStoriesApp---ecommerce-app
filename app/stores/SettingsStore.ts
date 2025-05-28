import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ShopSettings {
    shopName: string;
    description: string;
    logo: {
        favicon: string;
        headerLogo: string;
    };
    currency: 'RON' | 'USD' | 'EUR';
    paymentMethod: 'stripe' | 'paypal' | 'bank';
    freeShipping: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ShopSettingsState {
    // Settings data
    settings: ShopSettings;

    // UI states
    isLoading: boolean;
    isSaving: boolean;
    isUploading: boolean;
    error: string | null;

    // File states for preview
    faviconFile: File | null;
    logoFile: File | null;
    faviconPreview: string;
    logoPreview: string;

    // Actions
    setShopName: (name: string) => void;
    setDescription: (description: string) => void;
    setCurrency: (currency: 'RON' | 'USD' | 'EUR') => void;
    setPaymentMethod: (method: 'stripe' | 'paypal' | 'bank') => void;
    setFreeShipping: (enabled: boolean) => void;

    // File handling
    setFaviconFile: (file: File | null) => void;
    setLogoFile: (file: File | null) => void;
    setFaviconPreview: (url: string) => void;
    setLogoPreview: (url: string) => void;

    // API actions
    loadSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
    uploadToCloudinary: (file: File, folder: string) => Promise<string>;

    // Utility actions
    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;
    setUploading: (uploading: boolean) => void;
    setError: (error: string | null) => void;
    resetForm: () => void;
    resetPreviews: () => void;
    setIsUploading: (uploading: boolean) => void;
}

const initialSettings: ShopSettings = {
    shopName: '',
    description: '',
    logo: {
        favicon: '',
        headerLogo: '',
    },
    currency: 'EUR',
    paymentMethod: 'stripe',
    freeShipping: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const useShopSettingsStore = create<ShopSettingsState>()(
    devtools(
        (set, get) => ({
            // Initial state
            settings: initialSettings,
            isLoading: false,
            isSaving: false,
            isUploading: false,
            error: null,
            faviconFile: null,
            logoFile: null,
            faviconPreview: '',
            logoPreview: '',

            setIsUploading: (uploading: boolean) => {
                set((state) => ({
                    isUploading: uploading,
                }));
            },

            // Basic setters
            setShopName: (shopName) =>
                set((state) => ({
                    settings: { ...state.settings, shopName },
                })),

            setDescription: (description) =>
                set((state) => ({
                    settings: { ...state.settings, description },
                })),

            setCurrency: (currency) =>
                set((state) => ({
                    settings: { ...state.settings, currency },
                })),

            setPaymentMethod: (paymentMethod) =>
                set((state) => ({
                    settings: { ...state.settings, paymentMethod },
                })),

            setFreeShipping: (freeShipping) =>
                set((state) => ({
                    settings: { ...state.settings, freeShipping },
                })),

            // File handling
            setFaviconFile: (faviconFile) => set({ faviconFile }),
            setLogoFile: (logoFile) => set({ logoFile }),
            setFaviconPreview: (faviconPreview) => set({ faviconPreview }),
            setLogoPreview: (logoPreview) => set({ logoPreview }),

            // UI state setters
            setLoading: (isLoading) => set({ isLoading }),
            setSaving: (isSaving) => set({ isSaving }),
            setUploading: (isUploading) => set({ isUploading }),
            setError: (error) => set({ error }),

            // Load settings from API
            loadSettings: async () => {
                const { setLoading, setError } = get();

                try {
                    setLoading(true);
                    setError(null);

                    const response = await fetch('/api/settings');

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }


                    const data = await response.json();
                    const recentSettings = data[data.length - 1]; // Get the most recent settings

                    set((state) => ({
                        settings: { ...state.settings, ...recentSettings },
                        // Only set preview if we have actual URLs from the API
                        faviconPreview: data.logo?.favicon || '',
                        logoPreview: data.logo?.headerLogo || '',
                    }));
                } catch (error) {
                    console.error('Error loading settings:', error);
                    setError(error instanceof Error ? error.message : 'Failed to load settings');
                } finally {
                    setLoading(false);
                }
            },

            // Upload file to Cloudinary
            uploadToCloudinary: async (file: File, folder: string) => {
                const { setUploading, setError } = get();

                try {
                    setUploading(true);
                    setError(null);

                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');
                    formData.append('folder', folder);

                    const response = await fetch(
                        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to upload image');
                    }

                    const data = await response.json();
                    return data.secure_url;
                } catch (error) {
                    console.error('Error uploading to Cloudinary:', error);
                    setError('Failed to upload image');
                    throw error;
                } finally {
                    setUploading(false);
                }
            },

            // Save settings to API
            saveSettings: async () => {
                const { setSaving, setError, uploadToCloudinary, settings, faviconFile, logoFile } = get();

                try {
                    setSaving(true);
                    setError(null);

                    let updatedSettings = { ...settings };

                    // Upload favicon if changed
                    if (faviconFile) {
                        const faviconUrl = await uploadToCloudinary(faviconFile, 'favicons');
                        updatedSettings.logo.favicon = faviconUrl;
                    }

                    // Upload logo if changed
                    if (logoFile) {
                        const logoUrl = await uploadToCloudinary(logoFile, 'logos');
                        updatedSettings.logo.headerLogo = logoUrl;
                    }

                    // Save to API
                    const response = await fetch('/api/settings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedSettings),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const savedData = await response.json();

                    // Update store with saved data
                    set((state) => ({
                        settings: savedData,
                        faviconFile: null,
                        logoFile: null,
                        faviconPreview: savedData.logo?.favicon || '',
                        logoPreview: savedData.logo?.headerLogo || '',
                    }));

                    return savedData;
                } catch (error) {
                    console.error('Error saving settings:', error);
                    setError(error instanceof Error ? error.message : 'Failed to save settings');
                    throw error;
                } finally {
                    setSaving(false);
                }
            },

            // Reset form to initial state
            resetForm: () => {
                set({
                    settings: initialSettings,
                    faviconFile: null,
                    logoFile: null,
                    faviconPreview: '',
                    logoPreview: '',
                    error: null,
                });
            },

            // Reset only file previews
            resetPreviews: () => {
                set({
                    faviconFile: null,
                    logoFile: null,
                    faviconPreview: '',
                    logoPreview: '',
                });
            },
        }),
        {
            name: 'shop-settings-store',
        }
    )
);