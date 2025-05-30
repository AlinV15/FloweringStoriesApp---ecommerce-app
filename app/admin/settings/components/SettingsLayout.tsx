// app/admin/settings/components/SettingsLayout.tsx - MVP Version
'use client'
import React, { useState } from 'react';
import SettingsNavigation from './SettingsNavigation';
import SettingsManager from './SettingsManager';
import SettingsHistory from './SettingsHistory';
import SettingsBackup from './SettingsBackup';

type SettingsTab = 'settings' | 'history' | 'backup';

const SettingsLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('settings');

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
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default SettingsLayout;