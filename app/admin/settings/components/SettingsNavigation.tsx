// app/admin/settings/components/SettingsNavigation.tsx
'use client'
import React from 'react';
import { Settings, Eye, History, Download, Upload } from 'lucide-react';

interface SettingsNavigationProps {
    activeTab: 'settings' | 'history' | 'backup';
    onTabChange: (tab: 'settings' | 'history' | 'backup') => void;
}

const SettingsNavigation: React.FC<SettingsNavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        {
            id: 'settings' as const,
            label: 'Settings Management',
            icon: Settings,
            description: 'Configure your store settings'
        },
        {
            id: 'history' as const,
            label: 'Version History',
            icon: History,
            description: 'View and restore previous versions'
        },
        {
            id: 'backup' as const,
            label: 'Backup & Restore',
            icon: Download,
            description: 'Export and import settings'
        }
    ];

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-4xl mx-auto px-6">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive
                                        ? 'border-[#9c6b63] text-[#9c6b63]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default SettingsNavigation;