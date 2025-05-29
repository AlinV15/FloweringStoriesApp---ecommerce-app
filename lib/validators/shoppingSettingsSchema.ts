// lib/validators/shopSettingsSchema.ts
import { z } from 'zod';

// Helper schemas for reusability
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color');
const urlSchema = z.string().url().optional().or(z.literal(''));
const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format');

// Logo validation
const logoSchema = z.object({
    favicon: urlSchema,
    headerLogo: urlSchema,
    footerLogo: urlSchema,
}).optional();

// Colors validation
const colorsSchema = z.object({
    primary: colorSchema,
    secondary: colorSchema,
    accent: colorSchema,
}).optional();

// Address validation
const addressSchema = z.object({
    street: z.string().min(1).max(200).optional(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().min(1).max(100).optional(),
    postalCode: z.string().min(1).max(20).optional(),
    country: z.string().min(1).max(100).default('Romania'),
}).optional();

// Contact validation
const contactSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(1).max(20).optional().or(z.literal('')),
    address: addressSchema,
}).optional();

// Social media validation
const socialMediaSchema = z.object({
    facebook: urlSchema,
    instagram: urlSchema,
    twitter: urlSchema,
    tiktok: urlSchema,
}).optional();

// Business hours validation
const businessHoursSchema = z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isOpen: z.boolean().default(true),
    openTime: timeSchema.optional(),
    closeTime: timeSchema.optional(),
})).optional();

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
    keywords: z.array(z.string()).optional(),
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

    // Payment & Shipping
    paymentMethods: z.array(z.enum(['stripe', 'paypal', 'bank', 'cod']))
        .min(1, 'At least one payment method is required')
        .default(['stripe']),
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
});

// Partial schema for updates (all fields optional)
export const shopSettingsUpdateSchema = shopSettingsSchema.partial();

// Schema for public settings (what frontend can access)
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