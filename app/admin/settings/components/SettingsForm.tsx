'use client'
import React, { useEffect, useState } from 'react';
import { useShopSettingsStore } from '@/app/stores/SettingsStore';
import {
    Upload, X, Save, RotateCcw, AlertCircle, CheckCircle, Plus, Trash2,
    Palette, CreditCard, Truck, Clock, Globe, Search, Mail, Phone, MapPin,
    Facebook, Instagram, Twitter, MessageCircle, Eye, Heart, Bell, Settings
} from 'lucide-react';
import {
    validateIconFile,
    validateImageFile,
    uploadWithProgress,
    CloudinaryError,
} from '@/lib/utils/cloudinary';

interface SettingsFormProps {
    mode: 'edit' | 'create';
    onSuccess: () => void;
    onCancel: () => void;
}

// Helper function to ensure controlled values
const safeValue = (value: any, defaultValue: string = '') => {
    return value ?? defaultValue;
};

const SettingsForm: React.FC<SettingsFormProps> = ({ mode, onSuccess, onCancel }) => {
    const {
        settings,
        isLoading,
        isSaving,
        isUploading,
        error,
        faviconFile,
        logoFile,
        faviconPreview,
        logoPreview,
        setShopName,
        setDescription,
        setCurrency,
        setFaviconFile,
        setLogoFile,
        setFaviconPreview,
        setLogoPreview,
        setBusinessHours,
        saveSettings,
        resetForm,
        setError,
        setIsUploading,
    } = useShopSettingsStore();

    const [faviconProgress, setFaviconProgress] = useState(0);
    const [logoProgress, setLogoProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('general');

    // Safe initialization with default values
    const [localColors, setLocalColors] = useState({
        primary: safeValue(settings.colors?.primary, '#9a6a63'),
        secondary: safeValue(settings.colors?.secondary, '#c1a5a2'),
        accent: safeValue(settings.colors?.accent, '#f6eeec')
    });

    const [localContact, setLocalContact] = useState({
        email: safeValue(settings.contact?.email, ''),
        phone: safeValue(settings.contact?.phone, ''),
        address: {
            street: safeValue(settings.contact?.address?.street, ''),
            city: safeValue(settings.contact?.address?.city, ''),
            state: safeValue(settings.contact?.address?.state, ''),
            postalCode: safeValue(settings.contact?.address?.postalCode, ''),
            country: safeValue(settings.contact?.address?.country, 'Romania')
        }
    });

    const [localSocial, setLocalSocial] = useState({
        facebook: safeValue(settings.socialMedia?.facebook, ''),
        instagram: safeValue(settings.socialMedia?.instagram, ''),
        twitter: safeValue(settings.socialMedia?.twitter, ''),
        tiktok: safeValue(settings.socialMedia?.tiktok, '')
    });

    const [localSEO, setLocalSEO] = useState({
        metaTitle: safeValue(settings.seo?.metaTitle, ''),
        metaDescription: safeValue(settings.seo?.metaDescription, ''),
        keywords: settings.seo?.keywords || [],
        googleAnalytics: safeValue(settings.seo?.googleAnalytics, ''),
        facebookPixel: safeValue(settings.seo?.facebookPixel, '')
    });

    const [localShipping, setLocalShipping] = useState({
        freeShippingThreshold: settings.shippingSettings?.freeShippingThreshold ?? 100,
        defaultShippingCost: settings.shippingSettings?.defaultShippingCost ?? 15,
        enableLocalPickup: settings.shippingSettings?.enableLocalPickup ?? true
    });

    const [localFeatures, setLocalFeatures] = useState({
        enableReviews: settings.features?.enableReviews ?? true,
        enableWishlist: settings.features?.enableWishlist ?? true,
        enableNewsletter: settings.features?.enableNewsletter ?? true,
        enableNotifications: settings.features?.enableNotifications ?? true,
        maintenanceMode: settings.features?.maintenanceMode ?? false
    });

    type PaymentMethod = 'stripe' | 'paypal' | 'bank' | 'cod';
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(settings.paymentMethods || ['stripe']);
    const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        // Pentru edit mode, nu mai facem loadSettings() aici
        // deoarece datele sunt deja încărcate în SettingsManager
        if (mode === 'create') {
            resetForm();
        }
    }, [mode]); // Eliminăm loadSettings și resetForm din dependencies

    useEffect(() => {
        // Update local states when settings change - with safe defaults
        // Dar doar dacă settings chiar s-au schimbat (nu la fiecare render)
        if (settings && Object.keys(settings).length > 0) {
            setLocalColors({
                primary: safeValue(settings.colors?.primary, '#9a6a63'),
                secondary: safeValue(settings.colors?.secondary, '#c1a5a2'),
                accent: safeValue(settings.colors?.accent, '#f6eeec')
            });

            setLocalContact({
                email: safeValue(settings.contact?.email, ''),
                phone: safeValue(settings.contact?.phone, ''),
                address: {
                    street: safeValue(settings.contact?.address?.street, ''),
                    city: safeValue(settings.contact?.address?.city, ''),
                    state: safeValue(settings.contact?.address?.state, ''),
                    postalCode: safeValue(settings.contact?.address?.postalCode, ''),
                    country: safeValue(settings.contact?.address?.country, 'Romania')
                }
            });

            setLocalSocial({
                facebook: safeValue(settings.socialMedia?.facebook, ''),
                instagram: safeValue(settings.socialMedia?.instagram, ''),
                twitter: safeValue(settings.socialMedia?.twitter, ''),
                tiktok: safeValue(settings.socialMedia?.tiktok, '')
            });

            setLocalSEO({
                metaTitle: safeValue(settings.seo?.metaTitle, ''),
                metaDescription: safeValue(settings.seo?.metaDescription, ''),
                keywords: settings.seo?.keywords || [],
                googleAnalytics: safeValue(settings.seo?.googleAnalytics, ''),
                facebookPixel: safeValue(settings.seo?.facebookPixel, '')
            });

            setLocalShipping({
                freeShippingThreshold: settings.shippingSettings?.freeShippingThreshold ?? 100,
                defaultShippingCost: settings.shippingSettings?.defaultShippingCost ?? 15,
                enableLocalPickup: settings.shippingSettings?.enableLocalPickup ?? true
            });

            setLocalFeatures({
                enableReviews: settings.features?.enableReviews ?? true,
                enableWishlist: settings.features?.enableWishlist ?? true,
                enableNewsletter: settings.features?.enableNewsletter ?? true,
                enableNotifications: settings.features?.enableNotifications ?? true,
                maintenanceMode: settings.features?.maintenanceMode ?? false
            });

            if (settings.paymentMethods && settings.paymentMethods.length > 0) {
                setPaymentMethods(settings.paymentMethods);
            }
        }
    }, [settings.shopName, settings._id]); // Folosim doar câmpuri specifice ca dependencies

    const businessHours = settings.businessHours || [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '16:00' },
        { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '16:00' },
    ];

    const handleSave = async () => {
        try {
            // Update store with all local states
            useShopSettingsStore.setState({
                settings: {
                    ...settings,
                    colors: localColors,
                    contact: localContact,
                    socialMedia: localSocial,
                    seo: localSEO,
                    shippingSettings: localShipping,
                    features: localFeatures,
                    paymentMethods
                }
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            await saveSettings();
            setSuccessMessage(`Settings ${mode === 'create' ? 'created' : 'updated'} successfully!`);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (error) {
            console.error('Save failed:', error);
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    };

    const updateBusinessHours = (index: number, field: string, value: any) => {
        const updated = [...businessHours];
        updated[index] = { ...updated[index], [field]: value };
        setBusinessHours(updated);
    };

    const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            validateIconFile(file);
            setFaviconFile(file);
            setIsUploading(true);
            setFaviconProgress(0);

            const localPreview = URL.createObjectURL(file);
            setFaviconPreview(localPreview);

            const cloudinaryUrl = await uploadWithProgress(
                file,
                'favicons',
                { width: 32, height: 32, crop: 'fill', quality: 'auto' },
                (progress: number) => setFaviconProgress(progress)
            );

            setFaviconPreview(cloudinaryUrl);
            setSuccessMessage('Favicon uploaded successfully!');
        } catch (error) {
            console.error('Favicon upload error:', error);
            if (error instanceof CloudinaryError || error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to upload favicon. Please try again.');
            }
            setFaviconFile(null);
            setFaviconPreview(safeValue(settings.logo?.favicon, ''));
        } finally {
            setIsUploading(false);
            setFaviconProgress(0);
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            validateImageFile(file);
            setLogoFile(file);
            setIsUploading(true);
            setLogoProgress(0);

            const localPreview = URL.createObjectURL(file);
            setLogoPreview(localPreview);

            const cloudinaryUrl = await uploadWithProgress(
                file,
                'logos',
                { width: 300, height: 200, crop: 'fit', quality: 'auto' },
                (progress) => setLogoProgress(progress)
            );

            setLogoPreview(cloudinaryUrl);
            setSuccessMessage('Logo uploaded successfully!');
        } catch (error) {
            console.error('Logo upload error:', error);
            if (error instanceof CloudinaryError || error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to upload logo. Please try again.');
            }
            setLogoFile(null);
            setLogoPreview(safeValue(settings.logo?.headerLogo, ''));
        } finally {
            setIsUploading(false);
            setLogoProgress(0);
        }
    };

    const addKeyword = () => {
        if (newKeyword.trim() && !localSEO.keywords.includes(newKeyword.trim())) {
            setLocalSEO({
                ...localSEO,
                keywords: [...localSEO.keywords, newKeyword.trim()]
            });
            setNewKeyword('');
        }
    };

    const removeKeyword = (index: number) => {
        setLocalSEO({
            ...localSEO,
            keywords: localSEO.keywords.filter((_, i) => i !== index)
        });
    };

    const togglePaymentMethod = (method: string) => {
        if (paymentMethods.includes(method as PaymentMethod)) {
            if (paymentMethods.length > 1) {
                setPaymentMethods(paymentMethods.filter(m => m !== method));
            }
        } else {
            setPaymentMethods([...paymentMethods, method as PaymentMethod]);
        }
    };

    const ProgressBar = ({ progress }: { progress: number }) => (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
                className="bg-[#9c6b63] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === id
                ? 'bg-[#9c6b63] text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#9c6b63] mb-2">
                    {mode === 'create' ? 'Create New Settings' : 'Edit Store Settings'}
                </h1>
                <p className="text-gray-600">
                    {mode === 'create'
                        ? 'Set up your store configuration'
                        : 'Update your store\'s appearance and functionality'
                    }
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700">{successMessage}</span>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="mb-8 border-b">
                <nav className="flex space-x-2 overflow-x-auto pb-4">
                    <TabButton id="general" label="General" icon={Settings} />
                    <TabButton id="branding" label="Branding" icon={Palette} />
                    <TabButton id="payment" label="Payment & Shipping" icon={CreditCard} />
                    <TabButton id="contact" label="Contact & Social" icon={Mail} />
                    <TabButton id="hours" label="Business Hours" icon={Clock} />
                    <TabButton id="features" label="Features" icon={Heart} />
                    <TabButton id="seo" label="SEO" icon={Search} />
                </nav>
            </div>

            <div className="space-y-8">
                {/* General Settings Tab */}
                {activeTab === 'general' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">General Settings</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Shop Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    value={safeValue(settings.shopName, '')}
                                    onChange={(e) => setShopName(e.target.value)}
                                    placeholder="Enter your shop name"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Currency</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    value={safeValue(settings.currency, 'EUR')}
                                    onChange={(e) => setCurrency(e.target.value as 'RON' | 'USD' | 'EUR')}
                                    disabled={isLoading}
                                >
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="RON">RON (lei)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Shop Description *</label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all resize-vertical"
                                value={safeValue(settings.description, '')}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your shop and what makes it special..."
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tagline</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                value={safeValue(settings.tagline, '')}
                                onChange={(e) => useShopSettingsStore.setState({
                                    settings: { ...settings, tagline: e.target.value }
                                })}
                                placeholder="A catchy tagline for your shop"
                                disabled={isLoading}
                            />
                        </div>
                    </section>
                )}

                {/* Branding Tab */}
                {activeTab === 'branding' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Branding & Colors</h2>

                        {/* Logo Upload */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900">Favicon</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {faviconPreview ? (
                                        <div className="space-y-4">
                                            <img src={faviconPreview} alt="Favicon preview" className="w-16 h-16 mx-auto" />
                                            <button
                                                onClick={() => setFaviconPreview(null)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                            <div>
                                                <label className="cursor-pointer">
                                                    <span className="text-sm text-gray-600">Upload favicon (32x32px)</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".ico,.png,.jpg,.jpeg"
                                                        onChange={handleFaviconChange}
                                                        disabled={isUploading}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    {faviconProgress > 0 && <ProgressBar progress={faviconProgress} />}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900">Header Logo</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {logoPreview ? (
                                        <div className="space-y-4">
                                            <img src={logoPreview} alt="Logo preview" className="max-w-full h-24 mx-auto object-contain" />
                                            <button
                                                onClick={() => setLogoPreview(null)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                            <div>
                                                <label className="cursor-pointer">
                                                    <span className="text-sm text-gray-600">Upload logo (300x200px recommended)</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".png,.jpg,.jpeg,.svg"
                                                        onChange={handleLogoChange}
                                                        disabled={isUploading}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    {logoProgress > 0 && <ProgressBar progress={logoProgress} />}
                                </div>
                            </div>
                        </div>

                        {/* Color Scheme */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Color Scheme</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={localColors.primary}
                                            onChange={(e) => setLocalColors({ ...localColors, primary: e.target.value })}
                                            className="w-12 h-12 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={localColors.primary}
                                            onChange={(e) => setLocalColors({ ...localColors, primary: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={localColors.secondary}
                                            onChange={(e) => setLocalColors({ ...localColors, secondary: e.target.value })}
                                            className="w-12 h-12 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={localColors.secondary}
                                            onChange={(e) => setLocalColors({ ...localColors, secondary: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Accent Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={localColors.accent}
                                            onChange={(e) => setLocalColors({ ...localColors, accent: e.target.value })}
                                            className="w-12 h-12 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={localColors.accent}
                                            onChange={(e) => setLocalColors({ ...localColors, accent: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Payment & Shipping Tab */}
                {activeTab === 'payment' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Payment & Shipping</h2>

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Payment Methods *</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'stripe', name: 'Stripe', icon: CreditCard },
                                    { id: 'paypal', name: 'PayPal', icon: Globe },
                                    { id: 'bank', name: 'Bank Transfer', icon: Truck },
                                    { id: 'cod', name: 'Cash on Delivery', icon: MapPin }
                                ].map(({ id, name, icon: Icon }) => (
                                    <label key={id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={paymentMethods.includes(id as PaymentMethod)}
                                            onChange={() => togglePaymentMethod(id)}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <Icon className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium">{name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Free Shipping Threshold (€)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10000"
                                    value={localShipping.freeShippingThreshold}
                                    onChange={(e) => setLocalShipping({
                                        ...localShipping,
                                        freeShippingThreshold: Number(e.target.value)
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Default Shipping Cost (€)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1000"
                                    value={localShipping.defaultShippingCost}
                                    onChange={(e) => setLocalShipping({
                                        ...localShipping,
                                        defaultShippingCost: Number(e.target.value)
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                />
                            </div>
                            <div className="flex items-center space-x-3 pt-8">
                                <input
                                    type="checkbox"
                                    id="localPickup"
                                    checked={localShipping.enableLocalPickup}
                                    onChange={(e) => setLocalShipping({
                                        ...localShipping,
                                        enableLocalPickup: e.target.checked
                                    })}
                                    className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                />
                                <label htmlFor="localPickup" className="font-medium text-gray-700">Enable Local Pickup</label>
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact & Social Tab */}
                {activeTab === 'contact' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Contact & Social Media</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={localContact.email}
                                    onChange={(e) => setLocalContact({
                                        ...localContact,
                                        email: e.target.value
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    placeholder="contact@yourstore.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    value={localContact.phone}
                                    onChange={(e) => setLocalContact({
                                        ...localContact,
                                        phone: e.target.value
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    placeholder="+40 123 456 789"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Address</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Street</label>
                                    <input
                                        type="text"
                                        value={localContact.address.street}
                                        onChange={(e) => setLocalContact({
                                            ...localContact,
                                            address: { ...localContact.address, street: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="Street address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        value={localContact.address.city}
                                        onChange={(e) => setLocalContact({
                                            ...localContact,
                                            address: { ...localContact.address, city: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">State/Region</label>
                                    <input
                                        type="text"
                                        value={localContact.address.state}
                                        onChange={(e) => setLocalContact({
                                            ...localContact,
                                            address: { ...localContact.address, state: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="State or region"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input
                                        type="text"
                                        value={localContact.address.postalCode}
                                        onChange={(e) => setLocalContact({
                                            ...localContact,
                                            address: { ...localContact.address, postalCode: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="Postal code"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Social Media</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Facebook className="w-4 h-4 text-blue-600" />
                                        Facebook
                                    </label>
                                    <input
                                        type="url"
                                        value={localSocial.facebook}
                                        onChange={(e) => setLocalSocial({
                                            ...localSocial,
                                            facebook: e.target.value
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Instagram className="w-4 h-4 text-pink-600" />
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={localSocial.instagram}
                                        onChange={(e) => setLocalSocial({
                                            ...localSocial,
                                            instagram: e.target.value
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="https://instagram.com/youraccount"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Twitter className="w-4 h-4 text-blue-400" />
                                        Twitter
                                    </label>
                                    <input
                                        type="url"
                                        value={localSocial.twitter}
                                        onChange={(e) => setLocalSocial({
                                            ...localSocial,
                                            twitter: e.target.value
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="https://twitter.com/youraccount"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <MessageCircle className="w-4 h-4 text-black" />
                                        TikTok
                                    </label>
                                    <input
                                        type="url"
                                        value={localSocial.tiktok}
                                        onChange={(e) => setLocalSocial({
                                            ...localSocial,
                                            tiktok: e.target.value
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                        placeholder="https://tiktok.com/@youraccount"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Business Hours Tab */}
                {activeTab === 'hours' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Business Hours</h2>

                        <div className="space-y-3">
                            {businessHours.map((hours, index) => (
                                <div key={hours.day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-28">
                                        <span className="capitalize font-medium text-gray-900">{hours.day}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={hours.isOpen}
                                            onChange={(e) => updateBusinessHours(index, 'isOpen', e.target.checked)}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <span className="text-sm text-gray-600">Open</span>
                                    </div>

                                    {hours.isOpen ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="time"
                                                value={safeValue(hours.openTime, '09:00')}
                                                onChange={(e) => updateBusinessHours(index, 'openTime', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63]"
                                            />
                                            <span className="text-gray-500">to</span>
                                            <input
                                                type="time"
                                                value={safeValue(hours.closeTime, '18:00')}
                                                onChange={(e) => updateBusinessHours(index, 'closeTime', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63]"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 italic">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Store Features</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900">Customer Features</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={localFeatures.enableReviews}
                                            onChange={(e) => setLocalFeatures({
                                                ...localFeatures,
                                                enableReviews: e.target.checked
                                            })}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <Eye className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium">Enable Product Reviews</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={localFeatures.enableWishlist}
                                            onChange={(e) => setLocalFeatures({
                                                ...localFeatures,
                                                enableWishlist: e.target.checked
                                            })}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <Heart className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium">Enable Wishlist</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={localFeatures.enableNewsletter}
                                            onChange={(e) => setLocalFeatures({
                                                ...localFeatures,
                                                enableNewsletter: e.target.checked
                                            })}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium">Enable Newsletter Signup</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-900">System Features</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={localFeatures.enableNotifications}
                                            onChange={(e) => setLocalFeatures({
                                                ...localFeatures,
                                                enableNotifications: e.target.checked
                                            })}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <Bell className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium">Enable Push Notifications</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={localFeatures.maintenanceMode}
                                            onChange={(e) => setLocalFeatures({
                                                ...localFeatures,
                                                maintenanceMode: e.target.checked
                                            })}
                                            className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                        />
                                        <Settings className="w-5 h-5 text-gray-500" />
                                        <span className="font-medium">Maintenance Mode</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {localFeatures.maintenanceMode && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <span className="text-yellow-800 font-medium">Warning: Maintenance Mode is enabled</span>
                                </div>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Your store will be temporarily unavailable to customers when maintenance mode is active.
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">SEO & Analytics</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                                <input
                                    type="text"
                                    maxLength={60}
                                    value={localSEO.metaTitle}
                                    onChange={(e) => setLocalSEO({
                                        ...localSEO,
                                        metaTitle: e.target.value
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    placeholder="SEO-friendly page title"
                                />
                                <p className="text-xs text-gray-500">{localSEO.metaTitle.length}/60 characters</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Google Analytics ID</label>
                                <input
                                    type="text"
                                    value={localSEO.googleAnalytics}
                                    onChange={(e) => setLocalSEO({
                                        ...localSEO,
                                        googleAnalytics: e.target.value
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    placeholder="GA4-XXXXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                            <textarea
                                rows={3}
                                maxLength={160}
                                value={localSEO.metaDescription}
                                onChange={(e) => setLocalSEO({
                                    ...localSEO,
                                    metaDescription: e.target.value
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all resize-vertical"
                                placeholder="Brief description of your store for search engines"
                            />
                            <p className="text-xs text-gray-500">{localSEO.metaDescription.length}/160 characters</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">SEO Keywords</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                    placeholder="Add a keyword"
                                />
                                <button
                                    type="button"
                                    onClick={addKeyword}
                                    className="px-4 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {localSEO.keywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                    >
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(index)}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
                            <input
                                type="text"
                                value={localSEO.facebookPixel}
                                onChange={(e) => setLocalSEO({
                                    ...localSEO,
                                    facebookPixel: e.target.value
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                placeholder="123456789012345"
                            />
                        </div>
                    </section>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isLoading || isSaving || isUploading}
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading || isSaving || isUploading}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Changes
                        </button>

                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors disabled:opacity-50"
                            disabled={isLoading || isSaving || isUploading}
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {mode === 'create' ? 'Create Settings' : 'Save Settings'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>)
};

export default SettingsForm;