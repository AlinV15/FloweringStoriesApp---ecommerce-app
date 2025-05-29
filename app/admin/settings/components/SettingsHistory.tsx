'use client'
import React, { useState, useEffect } from 'react';
import { History, Calendar, User, Eye, RotateCcw, X } from 'lucide-react';

interface SettingsHistory {
    _id: string;
    version: number;
    changes: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    createdAt: string;
    updatedBy: string;
    settings: any;
}

const SettingsHistory: React.FC = () => {
    const [history, setHistory] = useState<SettingsHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<SettingsHistory | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await fetch('/api/admin/settings/history');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Failed to load settings history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getChangeDescription = (changes: SettingsHistory['changes']) => {
        if (changes.length === 0) return 'Initial creation';
        if (changes.length === 1) return `Updated ${changes[0].field}`;
        return `Updated ${changes.length} fields`;
    };

    const revertToVersion = async (versionId: string) => {
        if (!confirm('Are you sure you want to revert to this version? This will overwrite current settings.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/settings/revert/${versionId}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Successfully reverted to selected version');
                window.location.reload();
            } else {
                alert('Failed to revert settings');
            }
        } catch (error) {
            console.error('Revert failed:', error);
            alert('Failed to revert settings');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c6b63]"></div>
                <span className="ml-3 text-[#9c6b63]">Loading history...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-8 h-8 text-[#9c6b63]" />
                <div>
                    <h1 className="text-3xl font-bold text-[#9c6b63]">Settings History</h1>
                    <p className="text-gray-600">Track changes and revert to previous versions</p>
                </div>
            </div>

            <div className="space-y-4">
                {history.map((version) => (
                    <div
                        key={version._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-[#9c6b63] text-white px-2 py-1 rounded text-sm font-medium">
                                        v{version.version}
                                    </span>
                                    <span className="font-medium">
                                        {getChangeDescription(version.changes)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(version.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {version.updatedBy}
                                    </div>
                                </div>

                                {version.changes.length > 0 && (
                                    <div className="bg-gray-50 rounded p-3">
                                        <h4 className="font-medium text-sm mb-2">Changes:</h4>
                                        <div className="space-y-1">
                                            {version.changes.slice(0, 3).map((change, index) => (
                                                <div key={index} className="text-sm">
                                                    <span className="font-medium">{change.field}:</span>
                                                    <span className="text-red-600 line-through ml-2">
                                                        {String(change.oldValue).substring(0, 30)}
                                                        {String(change.oldValue).length > 30 ? '...' : ''}
                                                    </span>
                                                    <span className="text-green-600 ml-2">
                                                        {String(change.newValue).substring(0, 30)}
                                                        {String(change.newValue).length > 30 ? '...' : ''}
                                                    </span>
                                                </div>
                                            ))}
                                            {version.changes.length > 3 && (
                                                <div className="text-sm text-gray-500">
                                                    +{version.changes.length - 3} more changes
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => {
                                        setSelectedVersion(version);
                                        setShowPreview(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>

                                <button
                                    onClick={() => revertToVersion(version._id)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Revert
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {history.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No settings history available</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && selectedVersion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                Settings Preview - Version {selectedVersion.version}
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                                {JSON.stringify(selectedVersion.settings, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsHistory;