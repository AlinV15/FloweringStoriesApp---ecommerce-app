// app/api/admin/settings/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectToDatabase();
        const settings = await ShopSettings.findOne({});

        if (!settings) {
            return NextResponse.json({ error: 'No settings found' }, { status: 404 });
        }

        // Add export metadata
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportedBy: session.user.email,
            version: '1.0',
            settings: settings.toObject()
        };

        return NextResponse.json(exportData);
    } catch (error) {
        console.error('Error exporting settings:', error);
        return NextResponse.json({ error: 'Failed to export settings' }, { status: 500 });
    }
}
