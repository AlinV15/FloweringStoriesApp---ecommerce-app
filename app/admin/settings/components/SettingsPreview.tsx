// app/admin/settings/components/SettingsPreview.tsx
'use client'
import React from 'react';
import { Eye, Edit, Clock, Store, Globe, Mail, Phone, MapPin, Palette, CreditCard } from 'lucide-react';
import { ShopSettings } from '@/app/types';

interface SettingsPreviewProps {
    settings: ShopSettings;
    onEdit: () => void;
}

interface BusinessHour {
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}

const SettingsPreview: React.FC<SettingsPreviewProps> = ({
    settings,
    onEdit
}) => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg text-neutral-800">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#9c6b63] mb-2 flex items-center gap-2">
                        <Eye className="w-8 h-8" />
                        Settings Overview
                    </h1>
                    <p className="text-gray-600">Current store configuration</p>
                </div>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-[#9c6b63] text-white rounded-lg hover:bg-[#7a4f43] transition-colors font-medium"
                >
                    <Edit className="w-4 h-4" />
                    Edit Settings
                </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* General Info Card */}
                <div className="bg-gradient-to-br from-[#f5e1dd] to-[#f3c4ba] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Store className="w-5 h-5 text-[#9c6b63]" />
                        <h3 className="font-semibold text-[#9c6b63]">General</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Shop:</span> {settings.shopName}</p>
                        <p><span className="font-medium">Currency:</span> {settings.currency}</p>
                    </div>
                </div>

                {/* Branding Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Palette className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-700">Branding</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Logo:</span> {settings.logo?.headerLogo ? '✅ Set' : '❌ Not set'}</p>
                        <div className="flex items-center gap-1">
                            <span className="font-medium">Colors:</span>
                            <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: settings.colors?.primary || '#9a6a63' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Commerce Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-700">Commerce</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Payment:</span> {settings.paymentMethods?.length || 0} methods</p>
                        <p><span className="font-medium">Shipping:</span> {settings.shippingSettings?.freeShippingThreshold ? `€${settings.shippingSettings.freeShippingThreshold}+` : 'No free shipping'}</p>
                    </div>
                </div>

                {/* Features Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-700">Features</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Reviews:</span> {settings.features?.enableReviews ? '✅ On' : '❌ Off'}</p>
                        <p><span className="font-medium">Wishlist:</span> {settings.features?.enableWishlist ? '✅ On' : '❌ Off'}</p>
                    </div>
                </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-6">
                {/* Shop Info */}
                <section className="border-l-4 border-[#9c6b63] pl-4">
                    <h3 className="text-lg font-semibold text-[#9c6b63] mb-3">Shop Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-700 mb-2">{settings.description || 'No description set'}</p>
                            {settings.tagline && (
                                <p className="text-sm text-gray-500 italic">"{settings.tagline}"</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span>Timezone: {settings.timezone}</span>
                            </div>
                            {settings.features?.maintenanceMode && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Maintenance Mode Active</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Contact & Social */}
                {(settings.contact?.email || settings.contact?.phone || settings.socialMedia) && (
                    <section className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-lg font-semibold text-blue-700 mb-3">Contact & Social</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Contact Info */}
                            <div className="space-y-2">
                                {settings.contact?.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">{settings.contact.email}</span>
                                    </div>
                                )}
                                {settings.contact?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">{settings.contact.phone}</span>
                                    </div>
                                )}
                                {settings.contact?.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                        <div className="text-sm text-gray-700">
                                            {settings.contact.address.street && <div>{settings.contact.address.street}</div>}
                                            <div>
                                                {settings.contact.address.city && `${settings.contact.address.city}, `}
                                                {settings.contact.address.state && `${settings.contact.address.state} `}
                                                {settings.contact.address.postalCode}
                                            </div>
                                            <div className="text-gray-500">{settings.contact.address.country}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Media */}
                            {settings.socialMedia && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Social Media</h4>
                                    <div className="space-y-1">
                                        {settings.socialMedia.facebook && (
                                            <div className="text-sm text-blue-600">Facebook: Connected</div>
                                        )}
                                        {settings.socialMedia.instagram && (
                                            <div className="text-sm text-pink-600">Instagram: Connected</div>
                                        )}
                                        {settings.socialMedia.twitter && (
                                            <div className="text-sm text-blue-400">Twitter: Connected</div>
                                        )}
                                        {settings.socialMedia.tiktok && (
                                            <div className="text-sm text-gray-800">TikTok: Connected</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Business Hours */}
                {settings.businessHours && settings.businessHours.length > 0 && (
                    <section className="border-l-4 border-green-500 pl-4">
                        <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Business Hours
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {settings.businessHours.map((hours: BusinessHour, index: number) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <div className="font-medium capitalize text-sm">{hours.day}</div>
                                    <div className="text-sm text-gray-600">
                                        {hours.isOpen
                                            ? `${hours.openTime} - ${hours.closeTime}`
                                            : 'Closed'
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Payment & Shipping Details */}
                {(settings.paymentMethods || settings.shippingSettings) && (
                    <section className="border-l-4 border-yellow-500 pl-4">
                        <h3 className="text-lg font-semibold text-yellow-700 mb-3">Payment & Shipping</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Payment Methods */}
                            {settings.paymentMethods && settings.paymentMethods.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Payment Methods</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {settings.paymentMethods.map((method, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm capitalize"
                                            >
                                                {method}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Shipping Settings */}
                            {settings.shippingSettings && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Shipping Settings</h4>
                                    <div className="space-y-1 text-sm">
                                        <div>Free shipping: €{settings.shippingSettings.freeShippingThreshold}+</div>
                                        <div>Default cost: €{settings.shippingSettings.defaultShippingCost}</div>
                                        <div>Local pickup: {settings.shippingSettings.enableLocalPickup ? 'Available' : 'Not available'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* SEO Info */}
                {settings.seo && (settings.seo.metaTitle || settings.seo.metaDescription || settings.seo.keywords?.length) && (
                    <section className="border-l-4 border-indigo-500 pl-4">
                        <h3 className="text-lg font-semibold text-indigo-700 mb-3">SEO Settings</h3>
                        <div className="space-y-2">
                            {settings.seo.metaTitle && (
                                <div>
                                    <span className="font-medium text-gray-700">Meta Title: </span>
                                    <span className="text-gray-600">{settings.seo.metaTitle}</span>
                                </div>
                            )}
                            {settings.seo.metaDescription && (
                                <div>
                                    <span className="font-medium text-gray-700">Meta Description: </span>
                                    <span className="text-gray-600">{settings.seo.metaDescription}</span>
                                </div>
                            )}
                            {settings.seo.keywords && settings.seo.keywords.length > 0 && (
                                <div>
                                    <span className="font-medium text-gray-700">Keywords: </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {settings.seo.keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer with timestamp */}
            <div className="mt-8 pt-6 border-t text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date(settings.updatedAt || settings.createdAt).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsPreview;