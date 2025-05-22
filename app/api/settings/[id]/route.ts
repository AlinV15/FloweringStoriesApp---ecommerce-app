import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';
import { shopSettingsSchema } from '@/lib/validators';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

export async function PUT(req: NextRequest) {
    try {
        // Extragem datele din corpul cererii
        await connectToDatabase()
        const body = await req.json();

        // Validarea datelor folosind Zod
        const result = shopSettingsSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        // Căutăm și actualizăm setările magazinului
        const updatedSettings = await ShopSettings.findOneAndUpdate(
            {},
            { $set: result.data },
            { new: true, upsert: true } // Dacă nu există, va crea un document nou
        );

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error('Error updating shop settings:', error);
        return NextResponse.json({ error: 'Failed to update shop settings' }, { status: 500 });
    }
}


export async function DELETE(_: NextRequest) {
    try {
        await connectToDatabase()
        const deletedSettings = await ShopSettings.deleteOne({});
        if (!deletedSettings.deletedCount) {
            return NextResponse.json({ error: 'No settings to delete' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Shop settings deleted' });
    } catch (error) {
        console.error('Error deleting shop settings:', error);
        return NextResponse.json({ error: 'Failed to delete shop settings' }, { status: 500 });
    }
}
