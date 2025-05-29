// app/admin/settings/components/SettingsPreview.tsx
'use client'
import React from 'react';
import { Eye, Edit, Plus, Clock, User, Store } from 'lucide-react';
import { ShopSettings } from '@/app/types';

interface SettingsPreviewProps {
    settings: ShopSettings;
    onEdit: () => void;
    onCreateNew: () => void;
}

interface BusinessHour {
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}
const SettingsPreview: React.FC<SettingsPreviewProps> = ({
    settings,
    onEdit,
    onCreateNew
}) => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg text-neutral-800">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#9c6b63] mb-2 flex items-center gap-2">
                        <Eye className="w-8 h-8" />
                        Settings Preview
                    </h1>
                    <p className="text-gray-600">Current store configuration</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Settings
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-4 py-2 border border-[#9c6b63] text-[#9c6b63] rounded-lg hover:bg-[#9c6b63] hover:text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create New
                    </button>
                </div>
            </div>

            {/* Settings Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* General Info Card */}
                <div className="bg-gradient-to-br from-[#f5e1dd] to-[#f3c4ba] p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="w-6 h-6 text-[#9c6b63]" />
                        <h3 className="text-lg font-semibold text-[#9c6b63]">General Info</h3>
                    </div>
                    <div className="space-y-2">
                        <p><span className="font-medium">Shop Name:</span> {settings.shopName}</p>
                        <p><span className="font-medium">Currency:</span> {settings.currency}</p>
                        <p><span className="font-medium">Timezone:</span> {settings.timezone}</p>
                    </div>
                </div>

                {/* Branding Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-blue-500 rounded"></div>
                        <h3 className="text-lg font-semibold text-blue-700">Branding</h3>
                    </div>
                    <div className="space-y-2">
                        <p><span className="font-medium">Logo:</span> {settings.logo?.headerLogo ? 'Set' : 'Not set'}</p>
                        <p><span className="font-medium">Favicon:</span> {settings.logo?.favicon ? 'Set' : 'Not set'}</p>
                        <p><span className="font-medium">Primary Color:</span>
                            <span
                                className="inline-block w-4 h-4 rounded ml-2 border"
                                style={{ backgroundColor: settings.colors?.primary || '#9a6a63' }}
                            ></span>
                        </p>
                    </div>
                </div>

                {/* Payment & Shipping Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-green-500 rounded"></div>
                        <h3 className="text-lg font-semibold text-green-700">Commerce</h3>
                    </div>
                    <div className="space-y-2">
                        <p><span className="font-medium">Payment Methods:</span> {settings.paymentMethods?.length || 0}</p>
                        <p><span className="font-medium">Free Shipping:</span> {settings.shippingSettings?.freeShippingThreshold ? `€${settings.shippingSettings.freeShippingThreshold}+` : 'Disabled'}</p>
                        <p><span className="font-medium">Local Pickup:</span> {settings.shippingSettings?.enableLocalPickup ? 'Enabled' : 'Disabled'}</p>
                    </div>
                </div>
            </div>

            {/* Detailed Preview Sections */}
            <div className="space-y-6">
                {/* Shop Description */}
                <section className="border-l-4 border-[#9c6b63] pl-4">
                    <h3 className="text-lg font-semibold text-[#9c6b63] mb-2">Shop Description</h3>
                    <p className="text-gray-700">{settings.description || 'No description set'}</p>
                    {settings.tagline && (
                        <p className="text-sm text-gray-500 italic mt-1">"{settings.tagline}"</p>
                    )}
                </section>

                {/* Contact Information */}
                {settings.contact && (
                    <section className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">Contact Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                {settings.contact.email && <p><span className="font-medium">Email:</span> {settings.contact.email}</p>}
                                {settings.contact.phone && <p><span className="font-medium">Phone:</span> {settings.contact.phone}</p>}
                            </div>
                            {settings.contact.address && (
                                <div>
                                    <p className="font-medium">Address:</p>
                                    <p className="text-sm text-gray-700">
                                        {settings.contact.address.street && `${settings.contact.address.street}, `}
                                        {settings.contact.address.city && `${settings.contact.address.city}, `}
                                        {settings.contact.address.state && `${settings.contact.address.state} `}
                                        {settings.contact.address.postalCode}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Business Hours */}
                {settings.businessHours && settings.businessHours.length > 0 && (
                    <section className="border-l-4 border-green-500 pl-4">
                        <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Business Hours
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {settings.businessHours.map((hours: BusinessHour, index: number) => (
                                <div key={index} className="flex justify-between items-center py-1">
                                    <span className="capitalize font-medium">{hours.day}:</span>
                                    <span className="text-sm">
                                        {hours.isOpen
                                            ? `${hours.openTime} - ${hours.closeTime}`
                                            : 'Closed'
                                        }
                                    </span>
                                </div>
                            ))}


                        </div>
                    </section>
                )}

                {/* Features */}
                {settings.features && (
                    <section className="border-l-4 border-purple-500 pl-4">
                        <h3 className="text-lg font-semibold text-purple-700 mb-2">Features</h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${settings.features.enableReviews ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span>Reviews</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${settings.features.enableWishlist ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span>Wishlist</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${settings.features.enableNewsletter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span>Newsletter</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${settings.features.enableNotifications ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span>Notifications</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${settings.features.maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span>Maintenance Mode</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Timestamps */}
            <div className="mt-8 pt-6 border-t flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date(settings.updatedAt || settings.createdAt).toLocaleDateString()}</span>
                </div>
                {settings.updatedBy && (
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Updated by: {settings.updatedBy}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPreview;