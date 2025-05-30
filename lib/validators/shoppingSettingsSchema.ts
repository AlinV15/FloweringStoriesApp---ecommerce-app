// lib/validators/shopSettingsSchema.ts
import { z } from 'zod';

// Helper schemas for reusability
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color');
const urlSchema = z.string().url().optional().or(z.literal(''));
const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format');

// Logo validation - updated to match Mongoose schema
const logoSchema = z.object({
    favicon: z.string().optional().or(z.literal('')),
    headerLogo: z.string().optional().or(z.literal('')),
    footerLogo: z.string().optional().or(z.literal('')),
    _id: z.string().optional(), // MongoDB adds this
}).optional();

// Colors validation
const colorsSchema = z.object({
    primary: colorSchema,
    secondary: colorSchema,
    accent: colorSchema,
}).optional();

// Address validation
const addressSchema = z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().default('Romania'),
}).optional();

// Contact validation
const contactSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: addressSchema,
}).optional();

// Social media validation
const socialMediaSchema = z.object({
    facebook: z.string().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    tiktok: z.string().optional().or(z.literal('')),
}).optional();

// Business hours validation - make it optional to allow empty arrays
const businessHoursSchema = z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isOpen: z.boolean().default(true),
    openTime: z.string().optional().or(z.literal('')),
    closeTime: z.string().optional().or(z.literal('')),
})).optional().default([]);

// Shipping settings validation
const shippingSettingsSchema = z.object({
    freeShippingThreshold: z.number().min(0).max(10000).default(100),
    defaultShippingCost: z.number().min(0).max(1000).default(15),
    enableLocalPickup: z.boolean().default(true),
}).optional();

// Features validation
const featuresSchema = z.object({
    enableReviews: z.boolean().default(true),
    enableWishlist: z.boolean().default(true),
    enableNewsletter: z.boolean().default(true),
    enableNotifications: z.boolean().default(true),
    maintenanceMode: z.boolean().default(false),
}).optional();

// SEO validation
const seoSchema = z.object({
    metaTitle: z.string().max(60).optional().or(z.literal('')),
    metaDescription: z.string().max(160).optional().or(z.literal('')),
    keywords: z.array(z.string()).optional().default([]),
    googleAnalytics: z.string().optional().or(z.literal('')),
    facebookPixel: z.string().optional().or(z.literal('')),
}).optional();

// Main shop settings schema
export const shopSettingsSchema = z.object({
    // Basic Info
    shopName: z.string()
        .min(1, 'Shop name is required')
        .max(100, 'Shop name must be less than 100 characters')
        .trim(),
    description: z.string()
        .min(1, 'Description is required')
        .max(500, 'Description must be less than 500 characters')
        .trim(),
    tagline: z.string()
        .max(100, 'Tagline must be less than 100 characters')
        .optional()
        .or(z.literal('')),

    // Branding
    logo: logoSchema,
    colors: colorsSchema,

    // Business Settings
    currency: z.enum(['RON', 'USD', 'EUR', 'GBP'], {
        errorMap: () => ({ message: 'Currency must be RON, USD, EUR, or GBP' })
    }).default('EUR'),
    timezone: z.string().default('Europe/Bucharest'),

    // Payment & Shipping - make paymentMethods optional to allow empty arrays
    paymentMethods: z.array(z.enum(['stripe', 'paypal', 'bank', 'cod']))
        .optional()
        .default(['stripe']),

    // ADDED: Extra fields that come from your store/form
    paymentMethod: z.string().optional(), // This seems to be a legacy field
    freeShipping: z.boolean().optional(), // This too

    shippingSettings: shippingSettingsSchema,

    // Contact & Social
    contact: contactSchema,
    socialMedia: socialMediaSchema,

    // Business Hours
    businessHours: businessHoursSchema,

    // Features
    features: featuresSchema,

    // SEO
    seo: seoSchema,

    // ADDED: MongoDB fields that might come in requests
    _id: z.string().optional(),
    __v: z.number().optional(),
    createdAt: z.string().or(z.date()).optional(),
    updatedAt: z.string().or(z.date()).optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
});

// Partial schema for updates (all fields optional)
export const shopSettingsUpdateSchema = shopSettingsSchema.partial();

// Schema for public settings (what frontend can access) - exclude MongoDB internal fields
export const publicSettingsSchema = shopSettingsSchema.pick({
    shopName: true,
    description: true,
    tagline: true,
    logo: true,
    colors: true,
    currency: true,
    contact: true,
    socialMedia: true,
    businessHours: true,
    features: true,
    seo: true,
});

export type ShopSettings = z.infer<typeof shopSettingsSchema>;
export type ShopSettingsUpdate = z.infer<typeof shopSettingsUpdateSchema>;
export type PublicSettings = z.infer<typeof publicSettingsSchema>;