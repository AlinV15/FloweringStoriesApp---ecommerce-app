// app/admin/settings/components/SettingsManager.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useShopSettingsStore } from '@/app/stores/SettingsStore';
import SettingsPreview from './SettingsPreview';
import SettingsForm from './SettingsForm';
import { ArrowLeft, AlertCircle, Settings } from 'lucide-react';

type ViewMode = 'preview' | 'edit';

const SettingsManager: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('preview');
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

    const {
        settings,
        isLoading,
        error,
        loadSettings,
        hasUnsavedChanges
    } = useShopSettingsStore();

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleEditMode = () => {
        if (hasUnsavedChanges() && viewMode === 'edit') {
            setShowUnsavedWarning(true);
            return;
        }
        setViewMode('edit');
    };

    const handleBackToPreview = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedWarning(true);
            return;
        }
        setViewMode('preview');
    };

    const confirmLeaveWithoutSaving = () => {
        setShowUnsavedWarning(false);
        setViewMode('preview');
    };

    const handleSuccessfulSave = () => {
        setViewMode('preview');
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c6b63]"></div>
                    <span className="ml-3 text-[#9c6b63] font-medium">Loading settings...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800 mb-1">Error Loading Settings</h3>
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => loadSettings()}
                            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Navigation */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {viewMode === 'edit' && (
                                <button
                                    onClick={handleBackToPreview}
                                    className="flex items-center gap-2 px-3 py-2 text-[#9c6b63] hover:bg-[#f5e1dd] rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}

                            <div className="flex items-center gap-3">
                                <Settings className="w-6 h-6 text-[#9c6b63]" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {viewMode === 'preview' ? 'Store Settings' : 'Edit Settings'}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {viewMode === 'preview'
                                            ? 'Manage your store configuration'
                                            : 'Update your store settings'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Status Indicator */}
                        {viewMode === 'edit' && hasUnsavedChanges() && (
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="text-sm font-medium">Unsaved changes</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-6">
                {viewMode === 'preview' && (
                    <SettingsPreview
                        settings={settings}
                        onEdit={handleEditMode}
                    />
                )}

                {viewMode === 'edit' && (
                    <SettingsForm
                        mode="edit"
                        onSuccess={handleSuccessfulSave}
                        onCancel={handleBackToPreview}
                    />
                )}
            </div>

            {/* Unsaved Changes Warning Modal */}
            {showUnsavedWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Unsaved Changes</h3>
                                <p className="text-gray-600">
                                    You have unsaved changes that will be lost. Are you sure you want to continue?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowUnsavedWarning(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLeaveWithoutSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsManager;