// app/admin/settings/components/SettingsForm.tsx - Enhanced version of your existing form
'use client'
import React, { useEffect, useState } from 'react';
import { useShopSettingsStore } from '@/app/stores/SettingsStore';
import { Upload, X, Save, RotateCcw, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
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

    const [faviconProgress, setFaviconProgress] = useState(0);
    const [logoProgress, setLogoProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [businessHours, setBusinessHours] = useState([
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '16:00' },
        { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '16:00' },
    ]);

    useEffect(() => {
        if (mode === 'edit') {
            loadSettings();
        } else {
            resetForm();
        }
    }, [mode, loadSettings, resetForm]);

    useEffect(() => {
        if (settings.businessHours && settings.businessHours.length > 0) {
            setBusinessHours(settings.businessHours);
        }
    }, [settings.businessHours]);

    const handleSave = async () => {
        try {
            await saveSettings();
            setSuccessMessage(`Settings ${mode === 'create' ? 'created' : 'updated'} successfully!`);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (error) {
            console.error('Save failed:', error);
        }
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
            setFaviconPreview(settings.logo.favicon ?? null);
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
            setLogoPreview(settings.logo.headerLogo ?? null);
        } finally {
            setIsUploading(false);
            setLogoProgress(0);
        }
    };

    const updateBusinessHours = (index: number, field: string, value: any) => {
        const updated = [...businessHours];
        updated[index] = { ...updated[index], [field]: value };
        setBusinessHours(updated);
    };

    const ProgressBar = ({ progress }: { progress: number }) => (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
                className="bg-[#9c6b63] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
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

            <div className="space-y-8">
                {/* General Settings */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">General Settings</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Shop Name *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
                                value={settings.shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Enter your shop name"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Currency</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all"
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

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Shop Description *</label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63] transition-all resize-vertical"
                            value={settings.description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your shop and what makes it special..."
                            disabled={isLoading}
                        />
                    </div>
                </section>

                {/* Business Hours */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Business Hours</h2>

                    <div className="space-y-3">
                        {businessHours.map((hours, index) => (
                            <div key={hours.day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-24">
                                    <span className="capitalize font-medium">{hours.day}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={hours.isOpen}
                                        onChange={(e) => updateBusinessHours(index, 'isOpen', e.target.checked)}
                                        className="w-4 h-4 text-[#9c6b63] rounded focus:ring-[#9c6b63]"
                                    />
                                    <span className="text-sm">Open</span>
                                </div>

                                {hours.isOpen && (
                                    <>
                                        <input
                                            type="time"
                                            value={hours.openTime}
                                            onChange={(e) => updateBusinessHours(index, 'openTime', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63]"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="time"
                                            value={hours.closeTime}
                                            onChange={(e) => updateBusinessHours(index, 'closeTime', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9c6b63] focus:border-[#9c6b63]"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Brand Assets - Same as your existing code */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[#9c6b63] border-b pb-2">Brand Assets</h2>
                    {/* Your existing favicon and logo upload code here */}
                </section>

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
        </div>
    );
};

export default SettingsForm;