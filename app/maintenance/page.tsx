// app/maintenance/page.tsx
import { Metadata } from 'next';

// Această pagină nu folosește ShopSettingsContext pentru a evita loop-uri
// În schimb, fetch-uiește direct datele
async function getShopSettings() {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/shop-settings`, {
            cache: 'no-store'
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching settings for maintenance page:', error);
    }

    // Fallback settings
    return {
        shopName: 'Our Store',
        description: 'We are currently under maintenance',
        logo: {},
        colors: {
            primary: '#9a6a63',
            secondary: '#c1a5a2',
            accent: '#f6eeec'
        },
        contact: {}
    };
}

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getShopSettings();

    return {
        title: `Maintenance - ${settings.shopName}`,
        description: 'We are currently performing scheduled maintenance',
    };
}

export default async function MaintenancePage() {
    const settings = await getShopSettings();

    return (
        <html lang="en">
            <head>
                <style dangerouslySetInnerHTML={{
                    __html: `
            :root {
              --color-primary: ${settings.colors.primary};
              --color-secondary: ${settings.colors.secondary};
              --color-accent: ${settings.colors.accent};
            }
          `
                }} />
            </head>
            <body>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                        {settings.logo.headerLogo && (
                            <img
                                src={settings.logo.headerLogo}
                                alt={settings.shopName}
                                className="h-16 w-auto mx-auto mb-6"
                            />
                        )}

                        <h1
                            className="text-3xl font-bold mb-4"
                            style={{ color: settings.colors.primary }}
                        >
                            {settings.shopName}
                        </h1>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">We'll be back soon!</h2>
                            <p className="text-gray-600">
                                We're currently performing scheduled maintenance to improve your experience.
                                Please check back later.
                            </p>
                        </div>

                        <div
                            className="p-4 rounded-lg mb-6"
                            style={{ backgroundColor: settings.colors.accent }}
                        >
                            <p className="text-sm text-gray-700">
                                Thank you for your patience while we make improvements to serve you better.
                            </p>
                        </div>

                        {settings.contact.email && (
                            <div className="text-sm text-gray-500">
                                <p>Questions? Contact us at</p>
                                <a
                                    href={`mailto:${settings.contact.email}`}
                                    className="font-medium hover:underline"
                                    style={{ color: settings.colors.primary }}
                                >
                                    {settings.contact.email}
                                </a>
                            </div>
                        )}

                        {settings.contact.phone && (
                            <div className="text-sm text-gray-500 mt-2">
                                <p>Or call us at</p>
                                <a
                                    href={`tel:${settings.contact.phone}`}
                                    className="font-medium hover:underline"
                                    style={{ color: settings.colors.primary }}
                                >
                                    {settings.contact.phone}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}