// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

// Simple newsletter model (you can create a proper model)
const saveSubscription = async (email: string) => {
    try {
        await connectToDatabase();

        // For now, just log to console
        // You can create a Newsletter model and save to database
        console.log('Newsletter subscription:', email);

        // Or send to external service like Mailchimp, ConvertKit, etc.
        // Example with external service:
        // const response = await fetch('https://api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': 'Bearer YOUR_API_KEY',
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     email_address: email,
        //     status: 'subscribed'
        //   })
        // });

        return true;
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return false;
    }
};

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Valid email is required' },
                { status: 400 }
            );
        }

        const success = await saveSubscription(email);

        if (success) {
            return NextResponse.json({
                success: true,
                message: 'Successfully subscribed to newsletter!'
            });
        } else {
            return NextResponse.json(
                { success: false, message: 'Failed to subscribe. Please try again.' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}