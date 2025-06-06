// app/api/admin/settings/[id]/route.ts - For individual setting operations
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import ShopSettings from '@/lib/models/ShopSettings';
import connectToDatabase from '@/lib/mongodb';

import { shopSettingsUpdateSchema } from '@/lib/validators/shoppingSettingsSchema';
import { authOptions } from '@/lib/auth'

// Rate limiting for individual updates
const updateAttempts = new Map<string, { count: number; resetTime: number }>();

function checkUpdateRateLimit(userId: string) {
    const now = Date.now();
    const userAttempts = updateAttempts.get(userId);
    const maxAttempts = 20; // 20 updates per hour per user
    const windowMs = 60 * 60 * 1000; // 1 hour

    if (!userAttempts || now > userAttempts.resetTime) {
        updateAttempts.set(userId, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (userAttempts.count >= maxAttempts) {
        return { allowed: false, remaining: 0 };
    }

    userAttempts.count++;
    return { allowed: true, remaining: maxAttempts - userAttempts.count };
}

// GET - Fetch specific setting by ID
export async function GET(_: NextRequest,

    { params }: { params: Promise<{ id: string }> } // ✅ Updated to Promise
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectToDatabase();
        const { id: settingId } = await params; // ✅ Await params and destructure

        const settings = await ShopSettings.findById(settingId);
        if (!settings) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            settings
        });

    } catch (error) {
        console.error('Error fetching setting:', error);
        return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
    }
}

// PUT - Update specific setting by ID
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ Updated to Promise
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Rate limiting
        const rateLimit = checkUpdateRateLimit(session.user.id);
        if (!rateLimit.allowed) {
            return NextResponse.json({
                error: 'Too many update attempts. Please try again later.',
                retryAfter: Math.ceil(((updateAttempts.get(session.user.id)?.resetTime ?? Date.now()) - Date.now()) / 1000)
            }, { status: 429 });
        }

        await connectToDatabase();
        const { id: settingId } = await params; // ✅ Await params and destructure
        const body = await req.json();

        console.log('Received body:', JSON.stringify(body, null, 2));

        // Validate input
        const validationResult = shopSettingsUpdateSchema.safeParse(body);
        if (!validationResult.success) {
            console.log('Validation failed:', validationResult.error.flatten());
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.flatten(),
                issues: validationResult.error.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                    code: issue.code
                }))
            }, { status: 400 });
        }

        const validatedData = validationResult.data;

        // Clean the data - remove MongoDB internal fields and legacy fields before saving
        const {
            _id,
            __v,
            createdAt,
            updatedAt,
            createdBy,
            paymentMethod, // Legacy field - remove
            freeShipping,  // Legacy field - remove
            ...cleanData
        } = validatedData;

        // Special handling for logo - remove _id if it exists
        if (cleanData.logo && typeof cleanData.logo === 'object') {
            const { _id: logoId, ...logoWithoutId } = cleanData.logo;
            cleanData.logo = logoWithoutId;
        }

        // Ensure paymentMethods has at least one value if it's being set
        if (cleanData.paymentMethods !== undefined && cleanData.paymentMethods.length === 0) {
            cleanData.paymentMethods = ['stripe'];
        }

        console.log('Clean data for MongoDB:', JSON.stringify(cleanData, null, 2));

        // Special validations for business hours
        if (cleanData.businessHours && cleanData.businessHours.length > 0) {
            for (const hours of cleanData.businessHours) {
                if (hours.isOpen && hours.openTime && hours.closeTime) {
                    const [openHour, openMin] = hours.openTime.split(':').map(Number);
                    const [closeHour, closeMin] = hours.closeTime.split(':').map(Number);

                    const openMinutes = openHour * 60 + openMin;
                    const closeMinutes = closeHour * 60 + closeMin;

                    if (openMinutes >= closeMinutes) {
                        return NextResponse.json({
                            error: 'Validation failed',
                            details: {
                                businessHours: [`${hours.day}: Close time must be after open time`]
                            }
                        }, { status: 400 });
                    }
                }
            }
        }

        // Update the specific setting
        const updatedSettings = await ShopSettings.findByIdAndUpdate(
            settingId,
            {
                $set: {
                    ...cleanData,
                    updatedAt: new Date(),
                    updatedBy: session.user.id
                }
            },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!updatedSettings) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            settings: updatedSettings,
            remaining: rateLimit.remaining
        });

    } catch (error) {
        console.error('Error updating setting:', error);

        // Handle validation errors
        if (
            typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            (error as { name: string }).name === 'ValidationError'
        ) {
            const validationErrors: Record<string, string> = {};
            for (const [key, value] of Object.entries((error as any).errors)) {
                validationErrors[key] = (value as any).message;
            }

            return NextResponse.json({
                error: 'Database validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        // Handle cast errors (invalid ObjectId)
        if (
            typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            (error as { name: string }).name === 'CastError'
        ) {
            return NextResponse.json({
                error: 'Invalid settings ID format'
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

// DELETE - Delete specific setting by ID
export async function DELETE(_: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ Updated to Promise
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectToDatabase();
        const { id: settingId } = await params; // ✅ Await params and destructure

        const deletedSettings = await ShopSettings.findByIdAndDelete(settingId);

        if (!deletedSettings) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Settings deleted successfully',
            deletedSettings
        });

    } catch (error) {
        console.error('Error deleting setting:', error);

        if (
            typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            (error as { name: string }).name === 'CastError'
        ) {
            return NextResponse.json({
                error: 'Invalid settings ID format'
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to delete settings' }, { status: 500 });
    }
}