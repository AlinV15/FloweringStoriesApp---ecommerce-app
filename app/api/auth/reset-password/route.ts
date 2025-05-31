// /app/api/auth/reset-password/route.ts - VERSIUNEA FINALĂ
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcrypt';

export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const { token, password } = await request.json();

        // Validare input
        if (!token || !password) {
            return NextResponse.json(
                { success: false, message: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Găsește user-ul cu token-ul valid și neexpirat
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Hash password-ul nou
        const hashedPassword = await bcrypt.hash(password, 12);

        // Actualizează password-ul și șterge token-ul
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
            updatedAt: new Date()
        });

        return NextResponse.json(
            { success: true, message: 'Password reset successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

// BONUS: GET endpoint pentru validarea token-ului (opțional)
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token is required' },
                { status: 400 }
            );
        }

        // Verifică dacă token-ul este valid
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Token is valid',
                email: user.email.substring(0, 3) + '***' // Parțial ascuns pentru securitate
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Token validation error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}