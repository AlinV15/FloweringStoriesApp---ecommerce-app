// app/admin/settings/components/SettingsBackup.tsx
'use client'
import React, { useState } from 'react';
import { Download, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';

const SettingsBackup: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const exportSettings = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/admin/settings/export');
            if (!response.ok) throw new Error('Export failed');

            const data = await response.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `shop-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Settings exported successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to export settings' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/json') {
            setImportFile(file);
            setMessage(null);
        } else {
            setMessage({ type: 'error', text: 'Please select a valid JSON file' });
        }
    };

    const importSettings = async () => {
        if (!importFile) return;

        setIsImporting(true);
        try {
            const text = await importFile.text();
            const settings = JSON.parse(text);

            const response = await fetch('/api/admin/settings/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!response.ok) throw new Error('Import failed');

            setMessage({ type: 'success', text: 'Settings imported successfully!' });
            setImportFile(null);

            // Refresh page after successful import
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to import settings. Invalid file format.' });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#9c6b63] mb-2">Settings Backup</h1>
                <p className="text-gray-600">Export and import your store settings</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            <div className="space-y-8">
                {/* Export Section */}
                <section className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Download className="w-6 h-6 text-[#9c6b63]" />
                        <h2 className="text-xl font-semibold text-[#9c6b63]">Export Settings</h2>
                    </div>

                    <p className="text-gray-600 mb-4">
                        Download your current store settings as a JSON file for backup or migration purposes.
                    </p>

                    <button
                        onClick={exportSettings}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export Settings
                            </>
                        )}
                    </button>
                </section>

                {/* Import Section */}
                <section className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Upload className="w-6 h-6 text-[#9c6b63]" />
                        <h2 className="text-xl font-semibold text-[#9c6b63]">Import Settings</h2>
                    </div>

                    <p className="text-gray-600 mb-4">
                        Upload a settings JSON file to restore or migrate settings. This will overwrite your current settings.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#9c6b63] file:text-white hover:file:bg-[#7a4f43] file:cursor-pointer cursor-pointer"
                                disabled={isImporting}
                            />
                        </div>

                        {importFile && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">{importFile.name}</span>
                                <button
                                    onClick={importSettings}
                                    disabled={isImporting}
                                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {isImporting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3 h-3" />
                                            Import
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-yellow-800">Warning:</p>
                                <p className="text-yellow-700">
                                    Importing settings will completely replace your current configuration.
                                    Make sure to export your current settings first as a backup.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsBackup;