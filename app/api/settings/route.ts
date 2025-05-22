import { NextRequest, NextResponse } from 'next/server';
import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';
import { shopSettingsSchema } from '@/lib/validators';

export async function GET(_: NextRequest) {
    try {
        // Căutăm setările magazinului
        await connectToDatabase()
        const settings = await ShopSettings.findOne();
        if (!settings) {
            return NextResponse.json({ error: 'Shop settings not found' }, { status: 404 });
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching shop settings:', error);
        return NextResponse.json({ error: 'Failed to fetch shop settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase()
        const body = await req.json();
        const result = shopSettingsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        // Creăm setările magazinului
        const newSettings = await ShopSettings.create(result.data);
        return NextResponse.json(newSettings, { status: 201 });
    } catch (error) {
        console.error('Error creating shop settings:', error);
        return NextResponse.json({ error: 'Failed to create shop settings' }, { status: 500 });
    }
}
