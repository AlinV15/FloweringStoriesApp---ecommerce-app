import { NextRequest, NextResponse } from 'next/server';
import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';
import { shopSettingsSchema } from '@/lib/validators';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        await connectToDatabase();

        // Get current settings or create default
        let settings = await ShopSettings.findOne({});

        if (!settings) {
            settings = await ShopSettings.create({
                shopName: 'Flowering Stories',
                description: 'Your beautiful online store',
                currency: 'EUR',
                paymentMethods: ['stripe'],
                features: {
                    enableReviews: true,
                    enableWishlist: true,
                    enableNewsletter: true,
                    enableNotifications: true,
                    maintenanceMode: false
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// POST - Create new settings (admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectToDatabase();
        const body = await req.json();

        // Validate data
        const validationResult = shopSettingsSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.flatten()
            }, { status: 400 });
        }

        const newSettings = await ShopSettings.create(validationResult.data);

        return NextResponse.json({
            success: true,
            message: 'Settings created successfully',
            settings: newSettings
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
    }
}