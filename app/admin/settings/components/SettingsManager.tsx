// app/admin/settings/components/SettingsManager.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useShopSettingsStore } from '@/app/stores/SettingsStore';
import SettingsPreview from './SettingsPreview';
import SettingsForm from './SettingsForm';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

type ViewMode = 'preview' | 'edit' | 'create';

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

    const handleModeChange = (newMode: ViewMode) => {
        if (hasUnsavedChanges() && viewMode !== 'preview') {
            setShowUnsavedWarning(true);
            return;
        }
        setViewMode(newMode);
    };

    const confirmModeChange = (newMode: ViewMode) => {
        setShowUnsavedWarning(false);
        setViewMode(newMode);
    };

    const handleBackToPreview = () => {
        handleModeChange('preview');
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c6b63]"></div>
                    <span className="ml-3 text-[#9c6b63]">Loading settings...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Navigation Header for Edit/Create modes */}
            {(viewMode === 'edit' || viewMode === 'create') && (
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={handleBackToPreview}
                        className="flex items-center gap-2 px-4 py-2 text-[#9c6b63] hover:bg-[#f5e1dd] rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Preview
                    </button>

                    <div className="text-lg font-semibold text-[#9c6b63]">
                        {viewMode === 'edit' ? 'Edit Settings' : 'Create New Settings'}
                    </div>
                </div>
            )}

            {/* Content based on view mode */}
            {viewMode === 'preview' && (
                <SettingsPreview
                    settings={settings}
                    onEdit={() => handleModeChange('edit')}
                    onCreateNew={() => handleModeChange('create')}
                />
            )}

            {(viewMode === 'edit' || viewMode === 'create') && (
                <SettingsForm
                    mode={viewMode}
                    onSuccess={handleBackToPreview}
                    onCancel={handleBackToPreview}
                />
            )}

            {/* Unsaved Changes Warning Modal */}
            {showUnsavedWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                            <h3 className="text-lg font-semibold">Unsaved Changes</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            You have unsaved changes. Are you sure you want to leave without saving?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowUnsavedWarning(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => confirmModeChange('preview')}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Leave Without Saving
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsManager;