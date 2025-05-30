// components/admin/MaintenanceToggle.tsx
'use client';

import { useState } from 'react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';

export function MaintenanceToggle() {
  const { settings, updateSettings } = useShopSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    if (!settings || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateSettings({
        features: {
          ...settings.features,
          maintenanceMode: !settings.features.maintenanceMode
        }
      });
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      alert('Failed to update maintenance mode');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!settings) return null;

  const isMaintenanceMode = settings.features.maintenanceMode;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Maintenance Mode</h3>
          <p className="text-gray-600 text-sm">
            {isMaintenanceMode
              ? 'Your site is currently in maintenance mode'
              : 'Your site is live and accessible to visitors'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isMaintenanceMode
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
            }`}>
            {isMaintenanceMode ? 'Maintenance' : 'Live'}
          </span>

          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isMaintenanceMode ? 'bg-red-600' : 'bg-green-600'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {isMaintenanceMode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            <strong>Warning:</strong> Your site is currently showing a maintenance page to all visitors.
            Only admin users can access the site normally.
          </p>
        </div>
      )}
    </div>
  );
}



// Componenta helper pentru alte features
