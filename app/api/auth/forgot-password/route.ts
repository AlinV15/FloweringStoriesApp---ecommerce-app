// /app/api/auth/forgot-password/route.ts - VERSIUNEA FINALĂ
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // Validare email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        // Verifică dacă user-ul există
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Nu dezvălui că user-ul nu există (securitate)
            return NextResponse.json(
                { success: true, message: 'If an account with that email exists, we sent you a reset link.' },
                { status: 200 }
            );
        }

        // Generează token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 oră

        // Salvează token-ul în DB
        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpiry,
            updatedAt: new Date()
        });

        // Trimite email
        try {
            await sendResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return NextResponse.json(
                { success: false, message: 'Failed to send reset email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Password reset email sent successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

// Funcție pentru trimiterea email-ului
async function sendResetEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - Flowering Stories',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6eeec;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #9a6a63; font-size: 28px; margin: 0;">Flowering Stories</h1>
                        <p style="color: #9a6a63; opacity: 0.7; margin: 5px 0 0 0;">Password Reset Request</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f6eeec 0%, #fefdfc 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                        <h2 style="color: #9a6a63; margin: 0 0 15px 0;">Reset Your Password</h2>
                        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                            We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%); 
                                      color: white; 
                                      text-decoration: none; 
                                      padding: 12px 30px; 
                                      border-radius: 8px; 
                                      display: inline-block; 
                                      font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${resetUrl}" style="color: #9a6a63; word-break: break-all;">${resetUrl}</a>
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                            This link will expire in 1 hour for security reasons.
                        </p>
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            If you didn't request this password reset, please ignore this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Password Reset Request - Flowering Stories
            
            We received a request to reset your password.
            
            Click this link to reset your password: ${resetUrl}
            
            This link will expire in 1 hour.
            
            If you didn't request this password reset, please ignore this email.
        `
    };

    await transporter.sendMail(mailOptions);
}