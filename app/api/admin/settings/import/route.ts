// app/api/admin/settings/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';

import { shopSettingsSchema } from '@/lib/validators/shoppingSettingsSchema';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectToDatabase();
        const importData = await req.json();

        // Extract settings from import data
        const settingsToImport = importData.settings || importData;

        // Validate imported settings
        const validationResult = shopSettingsSchema.safeParse(settingsToImport);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Invalid settings format',
                details: validationResult.error.flatten()
            }, { status: 400 });
        }

        // Use validated settings data directly (no _id present)
        const settingsData = validationResult.data;

        // Update or create settings
        const updatedSettings = await ShopSettings.findOneAndUpdate(
            {},
            {
                ...settingsData,
                updatedAt: new Date(),
                updatedBy: session.user.id
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Settings imported successfully',
            settings: updatedSettings
        });

    } catch (error) {
        console.error('Error importing settings:', error);
        return NextResponse.json({ error: 'Failed to import settings' }, { status: 500 });
    }
}
