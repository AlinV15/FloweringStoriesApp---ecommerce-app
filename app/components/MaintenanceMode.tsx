// components/MaintenanceMode.tsx
import { ShopSettings } from '@/contexts/ShopSettingsContext';

interface MaintenanceModeProps {
    settings: ShopSettings;
}

export function MaintenanceMode({ settings }: MaintenanceModeProps) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                {settings.logo.headerLogo && (
                    <img
                        src={settings.logo.headerLogo}
                        alt={settings.shopName}
                        className="h-16 w-auto mx-auto mb-6"
                    />
                )}
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                    {settings.shopName}
                </h1>
                <h2 className="text-xl mb-4">We'll be back soon!</h2>
                <p className="text-gray-600 mb-6">
                    We're currently performing scheduled maintenance.
                    Please check back later.
                </p>

                {settings.contact.email && (
                    <p className="text-sm text-gray-500">
                        Questions? Contact us at{' '}
                        <a
                            href={`mailto:${settings.contact.email}`}
                            className="text-primary hover:underline"
                        >
                            {settings.contact.email}
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}