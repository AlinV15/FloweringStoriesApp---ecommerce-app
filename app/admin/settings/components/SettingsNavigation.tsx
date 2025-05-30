// app/admin/settings/components/SettingsNavigation.tsx - MVP Version
'use client'
import React from 'react';
import { Settings, History, Download } from 'lucide-react';

type SettingsTab = 'settings' | 'history' | 'backup';

interface SettingsNavigationProps {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
}

const SettingsNavigation: React.FC<SettingsNavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        {
            id: 'settings' as const,
            label: 'Settings',
            icon: Settings,
            description: 'Configure your store'
        },
        {
            id: 'history' as const,
            label: 'History',
            icon: History,
            description: 'View changes'
        },
        {
            id: 'backup' as const,
            label: 'Backup',
            icon: Download,
            description: 'Export/Import'
        }
    ];

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-6">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`group flex items-center gap-3 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${isActive
                                        ? 'border-[#9c6b63] text-[#9c6b63]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#9c6b63]' : 'text-gray-400'
                                    }`} />
                                <div className="text-left">
                                    <div className="font-medium">{tab.label}</div>
                                    <div className="text-xs text-gray-500 hidden md:block">
                                        {tab.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default SettingsNavigation;