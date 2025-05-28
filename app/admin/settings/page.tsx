'use client'
import React, { useEffect, useState } from 'react';
import { useShopSettingsStore } from '@/app/stores/SettingsStore';
import { Upload, X, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import {
    uploadToCloudinary,
    validateIconFile,
    validateImageFile,
    uploadWithProgress,
    CloudinaryError,
    getOptimizedImageUrl
} from '@/lib/utils/cloudinary';

const SettingsPage = () => {
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
        setPaymentMethod,
        setFreeShipping,
        setFaviconFile,
        setLogoFile,
        setFaviconPreview,
        setLogoPreview,
        loadSettings,
        saveSettings,
        resetForm,
        setError,
        setIsUploading,
    } = useShopSettingsStore();

    // Local state for upload progress and image loading
    const [faviconProgress, setFaviconProgress] = useState(0);
    const [logoProgress, setLogoProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [imageLoadErrors, setImageLoadErrors] = useState<{
        favicon: boolean;
        logo: boolean;
    }>({ favicon: false, logo: false });

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Auto-hide success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Reset image load errors when URLs change
    useEffect(() => {
        setImageLoadErrors({ favicon: false, logo: false });
    }, [faviconPreview, logoPreview]);

    // Enhanced favicon upload with Cloudinary
    const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Use Cloudinary validation
            validateIconFile(file);

            setFaviconFile(file);
            setIsUploading(true);
            setFaviconProgress(0);

            // Create local preview immediately
            const localPreview = URL.createObjectURL(file);
            setFaviconPreview(localPreview);

            // Upload to Cloudinary with progress tracking
            const cloudinaryUrl = await uploadWithProgress(
                file,
                'favicons',
                {
                    width: 32,
                    height: 32,
                    crop: 'fill',
                    quality: 'auto'
                },
                (progress: number) => setFaviconProgress(progress)
            );

            // Update preview with optimized Cloudinary URL
            setFaviconPreview(cloudinaryUrl);
            setSuccessMessage('Favicon uploaded successfully!');

        } catch (error) {
            console.error('Favicon upload error:', error);

            if (error instanceof CloudinaryError) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('Failed to upload favicon. Please try again.');
                }
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to upload favicon. Please try again.');
            }

            // Reset file input on error
            setFaviconFile(null);
            setFaviconPreview(settings.logo.favicon);
        } finally {
            setIsUploading(false);
            setFaviconProgress(0);
        }
    };

    // Enhanced logo upload with Cloudinary
    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Use Cloudinary validation
            validateImageFile(file);

            setLogoFile(file);
            setIsUploading(true);
            setLogoProgress(0);

            // Create local preview immediately
            const localPreview = URL.createObjectURL(file);
            setLogoPreview(localPreview);

            // Upload to Cloudinary with progress tracking
            const cloudinaryUrl = await uploadWithProgress(
                file,
                'logos',
                {
                    width: 300,
                    height: 200,
                    crop: 'fit',
                    quality: 'auto',
                },
                (progress) => setLogoProgress(progress)
            );

            // Update preview with optimized Cloudinary URL
            setLogoPreview(cloudinaryUrl);
            setSuccessMessage('Logo uploaded successfully!');

        } catch (error) {
            console.error('Logo upload error:', error);

            if (error instanceof CloudinaryError) {
                setError(error.message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to upload logo. Please try again.');
            }

            // Reset file input on error
            setLogoFile(null);
            setLogoPreview(settings.logo.headerLogo);
        } finally {
            setIsUploading(false);
            setLogoProgress(0);
        }
    };

    // Handle save with success feedback
    const handleSave = async () => {
        try {
            await saveSettings();
            setSuccessMessage('Settings saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    // Clear file inputs
    const clearFavicon = () => {
        setFaviconFile(null);
        setFaviconPreview(settings.logo.favicon);
        setFaviconProgress(0);
    };

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(settings.logo.headerLogo);
        setLogoProgress(0);
    };

    const isFormChanged = () => {
        return faviconFile !== null || logoFile !== null;
    };

    // Get the appropriate image URL with fallback
    const getFaviconUrl = () => {
        return faviconPreview || settings.logo.favicon || '/favicon.ico';
    };

    const getLogoUrl = () => {
        return logoPreview || settings.logo.headerLogo || '/default-logo.png';
    };

    // Handle image load errors
    const handleImageError = (type: 'favicon' | 'logo') => {
        setImageLoadErrors(prev => ({ ...prev, [type]: true }));
    };

    // Progress bar component
    const ProgressBar = ({ progress }: { progress: number }) => (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
                className="bg-[#9c6b63] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    // Image component with error handling
    const ImageWithFallback = ({
        src,
        alt,
        className,
        fallbackSrc,
        onError
    }: {
        src: string;
        alt: string;
        className: string;
        fallbackSrc?: string;
        onError?: () => void;
    }) => {
        const [imgSrc, setImgSrc] = useState(src);
        const [hasError, setHasError] = useState(false);

        useEffect(() => {
            setImgSrc(src);
            setHasError(false);
        }, [src]);

        const handleError = () => {
            if (!hasError && fallbackSrc) {
                setImgSrc(fallbackSrc);
                setHasError(true);
            }
            onError?.();
        };

        return (
            <img
                src={imgSrc}
                alt={alt}
                className={className}
                onError={handleError}
                loading="lazy"
            />
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#9c6b63] mb-2">Store Settings</h1>
                <p className="text-gray-600">Configure your store's appearance and functionality</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700">{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-auto text-green-500 hover:text-green-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
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

            {/* Loading State */}
            {isLoading && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                        <span className="text-blue-700">Loading settings...</span>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {/* General Settings */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">General Settings</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 text-gray-700">
                            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                                Shop Name *
                            </label>
                            <input
                                id="shopName"
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                value={settings.shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Enter your shop name"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2 text-gray-800">
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                Currency
                            </label>
                            <select
                                id="currency"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                value={settings.currency}
                                onChange={(e) => setCurrency(e.target.value as 'RON' | 'USD' | 'EUR')}
                                disabled={isLoading}
                            >
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="RON">RON (lei)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 text-gray-700">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Shop Description *
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all resize-vertical"
                            value={settings.description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your shop and what makes it special..."
                            disabled={isLoading}
                        />
                    </div>
                </section>

                {/* Brand Assets */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Brand Assets</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Favicon Upload */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800">Favicon</h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#9c6b63] transition-colors">
                                <input
                                    id="favicon"
                                    type="file"
                                    accept="image/x-icon,image/vnd.microsoft.icon,image/ico,image/icon,image/png,image/jpg,image/jpeg"
                                    className="hidden"
                                    onChange={handleFaviconChange}
                                    disabled={isLoading || isUploading}
                                />

                                {getFaviconUrl() && !imageLoadErrors.favicon ? (
                                    <div className="space-y-3">
                                        <ImageWithFallback
                                            src={getFaviconUrl()}
                                            alt="Favicon Preview"
                                            className="w-16 h-16 mx-auto object-contain border rounded"
                                            fallbackSrc="/favicon.ico"
                                            onError={() => handleImageError('favicon')}
                                        />

                                        {/* Progress bar for favicon upload */}
                                        {isUploading && faviconProgress > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-sm text-[#9c6b63]">
                                                    Uploading... {faviconProgress}%
                                                </div>
                                                <ProgressBar progress={faviconProgress} />
                                            </div>
                                        )}

                                        <div className="flex gap-2 justify-center">
                                            <label
                                                htmlFor="favicon"
                                                className="px-3 py-1 text-sm bg-[#9c6b63] text-white rounded hover:bg-[#7a4f43] cursor-pointer transition-colors disabled:opacity-50"
                                            >
                                                Change
                                            </label>
                                            {faviconFile && (
                                                <button
                                                    onClick={clearFavicon}
                                                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                                    disabled={isUploading}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                        <div>
                                            <label
                                                htmlFor="favicon"
                                                className="px-4 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] cursor-pointer transition-colors inline-block disabled:opacity-50"
                                            >
                                                Upload Favicon
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">ICO, PNG, JPG (max 1MB)</p>
                                            <p className="text-xs text-gray-400">Automatically optimized to 32x32px</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800">Header Logo</h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#9c6b63] transition-colors">
                                <input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                    disabled={isLoading || isUploading}
                                />

                                {getLogoUrl() && !imageLoadErrors.logo ? (
                                    <div className="space-y-3">
                                        <ImageWithFallback
                                            src={getLogoUrl()}
                                            alt="Logo Preview"
                                            className="w-24 h-24 mx-auto object-contain border rounded-lg"
                                            fallbackSrc="/default-logo.png"
                                            onError={() => handleImageError('logo')}
                                        />

                                        {/* Progress bar for logo upload */}
                                        {isUploading && logoProgress > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-sm text-[#9c6b63]">
                                                    Uploading... {logoProgress}%
                                                </div>
                                                <ProgressBar progress={logoProgress} />
                                            </div>
                                        )}

                                        <div className="flex gap-2 justify-center">
                                            <label
                                                htmlFor="logo"
                                                className="px-3 py-1 text-sm bg-[#9c6b63] text-white rounded hover:bg-[#7a4f43] cursor-pointer transition-colors"
                                            >
                                                Change
                                            </label>
                                            {logoFile && (
                                                <button
                                                    onClick={clearLogo}
                                                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                                    disabled={isUploading}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                                        <div>
                                            <label
                                                htmlFor="logo"
                                                className="px-4 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] cursor-pointer transition-colors inline-block"
                                            >
                                                Upload Logo
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG (max 5MB)</p>
                                            <p className="text-xs text-gray-400">Automatically optimized for web</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment & Shipping */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Payment & Shipping</h2>

                    <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                        <div className="space-y-2">
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                                Payment Methods
                            </label>
                            <select
                                id="paymentMethod"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all text-gray-800"
                                value={settings.paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal' | 'bank')}
                                disabled={isLoading}
                            >
                                <option value="stripe">Stripe Only</option>
                                <option value="paypal">PayPal Only</option>
                                <option value="bank">Bank Transfer</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Shipping Options
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    id="freeShipping"
                                    type="checkbox"
                                    className="w-4 h-4 text-[#9c6b63] bg-gray-100 border-gray-300 rounded focus:ring-[#9c6b63] focus:ring-2"
                                    checked={settings.freeShipping}
                                    onChange={(e) => setFreeShipping(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700">
                                    Offer free shipping on all orders
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <button
                        onClick={resetForm}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={isLoading || isSaving || isUploading}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Changes
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors disabled:opacity-50"
                            disabled={isLoading || isSaving || isUploading}
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;