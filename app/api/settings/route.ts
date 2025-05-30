// app/api/settings/route.ts - Public endpoint for frontend to fetch shop settings
import { NextRequest, NextResponse } from 'next/server';
import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';

// Cache for settings to reduce database calls
let settingsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
    try {
        const now = Date.now();

        // Return cached settings if still valid
        if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                settings: settingsCache,
                cached: true
            });
        }

        await connectToDatabase();

        // Fetch active shop settings (you might want to add an 'active' field to your schema)
        const settings = await ShopSettings.findOne()
            .select('-createdBy -updatedBy -__v') // Exclude sensitive/internal fields
            .lean(); // For better performance

        if (!settings) {
            // Return default settings if none found
            const defaultSettings = {
                shopName: "Flowering Stories",
                tagline: "Where Stories and Blooms Unite",
                currency: "EUR",
                paymentMethods: ["stripe"],
                newsletterEnabled: true,
                instagramFeedEnabled: true,
                instagramUsername: "FloweringStories",
                heroTitle: "Where Stories and Blooms Unite",
                heroSubtitle: "Discover a unique blend of literature and nature in our curated collection of books, stationery, and floral arrangements.",
                heroImage: "/hero-image.jpg",
                heroButtonText: "Explore Collection",
                heroButtonLink: "/products",
                newsletterTitle: "Join Our Flowering Community",
                newsletterDescription: "Subscribe to our newsletter and be the first to know about new arrivals, special offers, and literary events.",
                features: [
                    {
                        title: "Curated Collections",
                        description: "Every book in our collection is hand-selected to inspire, delight, and transport you to new worlds.",
                        icon: "BookOpen",
                        enabled: true
                    },
                    {
                        title: "Floral Companions",
                        description: "Our unique floral arrangements complement your reading experience and bring natural beauty to your space.",
                        icon: "LucideFlower",
                        enabled: true
                    },
                    {
                        title: "Perfect Gifting",
                        description: "Thoughtfully crafted gift sets combining literature and floral elements for your special occasions.",
                        icon: "Gift",
                        enabled: true
                    }
                ]
            };

            return NextResponse.json({
                success: true,
                settings: defaultSettings,
                isDefault: true
            });
        }

        // Update cache
        settingsCache = settings;
        cacheTimestamp = now;

        return NextResponse.json({
            success: true,
            settings
        });

    } catch (error) {
        console.error('Error fetching public settings:', error);

        // Return minimal default settings on error
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch settings',
            settings: {
                shopName: "Flowering Stories",
                currency: "EUR",
                newsletterEnabled: true,
                instagramFeedEnabled: true
            }
        }, { status: 500 });
    }
}

// Optional: Add a method to clear cache when settings are updated
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Simple cache invalidation endpoint (could be secured)
        if (body.action === 'clearCache') {
            settingsCache = null;
            cacheTimestamp = 0;

            return NextResponse.json({
                success: true,
                message: 'Cache cleared'
            });
        }

        return NextResponse.json({
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        return NextResponse.json({
            error: 'Failed to process request'
        }, { status: 500 });
    }
}