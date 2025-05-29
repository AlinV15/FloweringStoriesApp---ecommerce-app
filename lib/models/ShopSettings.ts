// lib/models/ShopSettings.ts
import mongoose from 'mongoose';

const shopSettingsSchema = new mongoose.Schema({
    // Basic Info
    shopName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    tagline: {
        type: String,
        maxlength: 100
    },

    // Branding
    logo: {
        favicon: String,
        headerLogo: String,
        footerLogo: String,
    },
    colors: {
        primary: { type: String, default: '#9a6a63' },
        secondary: { type: String, default: '#c1a5a2' },
        accent: { type: String, default: '#f6eeec' }
    },

    // Business Settings
    currency: {
        type: String,
        enum: ['RON', 'USD', 'EUR', 'GBP'],
        default: 'EUR',
    },
    timezone: {
        type: String,
        default: 'Europe/Bucharest'
    },

    // Payment & Shipping
    paymentMethods: [{
        type: String,
        enum: ['stripe', 'paypal', 'bank', 'cod'], // cash on delivery
    }],
    shippingSettings: {
        freeShippingThreshold: { type: Number, default: 100 },
        defaultShippingCost: { type: Number, default: 15 },
        enableLocalPickup: { type: Boolean, default: true }
    },

    // Contact & Social
    contact: {
        email: String,
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: { type: String, default: 'Romania' }
        }
    },
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        tiktok: String
    },

    // Business Hours
    businessHours: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        isOpen: { type: Boolean, default: true },
        openTime: String, // "09:00"
        closeTime: String, // "18:00"
    }],

    // Features
    features: {
        enableReviews: { type: Boolean, default: true },
        enableWishlist: { type: Boolean, default: true },
        enableNewsletter: { type: Boolean, default: true },
        enableNotifications: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false }
    },

    // SEO
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        googleAnalytics: String,
        facebookPixel: String
    }
}, {
    timestamps: true,
    collection: 'shopsettings' // Ensure single collection
});

export default mongoose.models.ShopSettings || mongoose.model('ShopSettings', shopSettingsSchema);