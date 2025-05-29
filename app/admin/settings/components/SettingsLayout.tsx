// app/admin/settings/components/SettingsLayout.tsx - Main layout component
'use client'
import React, { useState } from 'react';
import SettingsNavigation from './SettingsNavigation';
import SettingsManager from './SettingsManager';
import SettingsHistory from './SettingsHistory';
import SettingsBackup from './SettingsBackup';

const SettingsLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'backup'>('settings');

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SettingsManager />;
            case 'history':
                return <SettingsHistory />;
            case 'backup':
                return <SettingsBackup />;
            default:
                return <SettingsManager />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SettingsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="py-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsLayout;