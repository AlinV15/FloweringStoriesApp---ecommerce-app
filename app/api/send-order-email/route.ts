// app/api/send-order-email/route.ts - Final și curat
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import OrderItem from '@/lib/models/OrderItem';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import Address from '@/lib/models/Address';

// Configurează Nodemailer cu variabilele tale
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials not configured');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
};

// Template HTML pentru email
const createEmailTemplate = (orderData: any) => {
    const itemsHtml = orderData.populatedItems?.map((item: any) => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 15px 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.product?.image || '/placeholder.png'}" alt="${item.product?.name || 'Product'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h4 style="margin: 0; color: #9a6a63; font-size: 16px;">${item.product?.name || 'Product'}</h4>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${item.product?.type || ''}</p>
                    </div>
                </div>
            </td>
            <td style="padding: 15px 10px; text-align: center; color: #9a6a63; font-weight: bold;">
                ${item.quantity || 1}
            </td>
            <td style="padding: 15px 10px; text-align: right; color: #9a6a63; font-weight: bold;">
                €${item.product?.price?.toFixed(2) || '0.00'}
            </td>
            <td style="padding: 15px 10px; text-align: right; color: #9a6a63; font-weight: bold;">
                €${item.lineAmount?.toFixed(2) || '0.00'}
            </td>
        </tr>
    `).join('') || '';

    const customerName = orderData.user ?
        `${orderData.user.firstName || ''} ${orderData.user.lastName || ''}`.trim() :
        orderData.guestName || 'Customer';

    const customerEmail = orderData.user ?
        orderData.user.email :
        orderData.guestEmail || '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Flowering Stories</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Nunito', Arial, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                    🌸 Flowering Stories
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                    Thank you for your order!
                </p>
            </div>

            <!-- Order Confirmation -->
            <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background-color: #e8f5e8; border-radius: 50%; line-height: 60px; margin-bottom: 15px;">
                        <span style="color: #4caf50; font-size: 30px;">✓</span>
                    </div>
                    <h2 style="color: #9a6a63; margin: 0 0 10px 0; font-size: 24px;">Order Confirmed!</h2>
                    <p style="color: #666; margin: 0; font-size: 16px;">
                        Your order <strong>#${orderData._id?.toString().slice(-8) || 'N/A'}</strong> has been successfully placed.
                    </p>
                </div>

                <!-- Customer Information -->
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #9a6a63; margin: 0 0 15px 0; font-size: 18px;">Customer Information</h3>
                    <p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${customerName}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${customerEmail}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Delivery:</strong> ${orderData.deliveryMethod === 'courier' ? 'Courier Delivery' : 'Store Pickup'}</p>
                    ${orderData.address ? `
                    <p style="margin: 5px 0; color: #333;"><strong>Address:</strong> ${orderData.address.street || ''}, ${orderData.address.city || ''}, ${orderData.address.postalCode || ''}, ${orderData.address.country || ''}</p>
                    ` : ''}
                </div>

                <!-- Order Items -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #9a6a63; margin: 0 0 15px 0; font-size: 18px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; border: 1px solid #f0f0f0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 15px 10px; text-align: left; color: #9a6a63; font-weight: 600;">Item</th>
                                <th style="padding: 15px 10px; text-align: center; color: #9a6a63; font-weight: 600;">Qty</th>
                                <th style="padding: 15px 10px; text-align: right; color: #9a6a63; font-weight: 600;">Price</th>
                                <th style="padding: 15px 10px; text-align: right; color: #9a6a63; font-weight: 600;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #f8f9fa; border-top: 2px solid #9a6a63;">
                                <td colspan="3" style="padding: 15px 10px; text-align: right; color: #9a6a63; font-weight: bold; font-size: 18px;">
                                    Total Amount:
                                </td>
                                <td style="padding: 15px 10px; text-align: right; color: #9a6a63; font-weight: bold; font-size: 18px;">
                                    €${orderData.totalAmount?.toFixed(2) || '0.00'}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- What's Next -->
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #9a6a63; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
                    <ol style="color: #666; padding-left: 20px; line-height: 1.6;">
                        <li>We'll prepare your order and notify you when it's ready</li>
                        <li>${orderData.deliveryMethod === 'courier' ? 'Your order will be delivered to the provided address' : 'You can pick up your order from our store'}</li>
                        <li>You'll receive tracking information via email</li>
                    </ol>
                </div>

                <!-- Contact Information -->
                <div style="text-align: center; padding: 20px 0; border-top: 1px solid #f0f0f0;">
                    <p style="color: #666; margin: 0 0 10px 0;">Questions about your order?</p>
                    <p style="color: #9a6a63; margin: 0; font-weight: 600;">
                        Email us at <a href="mailto:contact@floweringstories.com" style="color: #9a6a63;">contact@floweringstories.com</a>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                    Thank you for choosing Flowering Stories!
                </p>
                <p style="color: #999; margin: 0; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const order = await Order.findById(orderId)
            .populate('user')
            .populate('address')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            })
            .lean();

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        const orderAny = order as any;
        if (orderAny.payment?.status !== 'succeeded') {
            return NextResponse.json(
                { success: false, message: 'Order payment not confirmed yet' },
                { status: 400 }
            );
        }

        if (orderAny.email?.confirmationSent) {
            return NextResponse.json(
                { success: false, message: 'Confirmation email already sent' },
                { status: 400 }
            );
        }

        const orderData = {
            ...orderAny,
            populatedItems: orderAny.items || []
        };

        const recipientEmail = orderAny.user?.email || orderAny.guestEmail;

        if (!recipientEmail) {
            return NextResponse.json(
                { success: false, message: 'No recipient email found' },
                { status: 400 }
            );
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'Flowering Stories',
                address: process.env.EMAIL_FROM!
            },
            to: recipientEmail,
            subject: `Order Confirmation #${orderAny._id?.toString().slice(-8)} - Flowering Stories`,
            html: createEmailTemplate(orderData),
        };

        const info = await transporter.sendMail(mailOptions);

        await Order.findByIdAndUpdate(orderId, {
            'email.confirmationSent': true,
            'email.confirmationSentAt': new Date()
        });

        console.log('✅ Order confirmation email sent:', info.messageId);

        return NextResponse.json({
            success: true,
            message: 'Order confirmation email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending order confirmation email:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to send order confirmation email',
                error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}