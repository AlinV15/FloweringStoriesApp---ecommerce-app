import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
});

// Funcție pentru trimiterea email-ului de confirmare
async function sendOrderConfirmationEmail(orderId: string) {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/send-order-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Order confirmation email sent via webhook for order:', orderId);
            return true;
        } else {
            console.error('❌ Failed to send email via webhook:', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending email via webhook:', error);
        return false;
    }
}

export async function POST(req: NextRequest) {
    const rawBody = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing Stripe signature" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            bodyBuffer,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;
            console.log('📦 Processing completed checkout session for order:', orderId);

            if (orderId) {
                // Actualizează statusul comenzii conform structurii tale
                const updatedOrder = await Order.findByIdAndUpdate(
                    orderId,
                    {
                        status: "pending", // Păstrează pending conform enum-ului tău
                        "payment.status": "succeeded",
                        "payment.stripePaymentIntentId": session.payment_intent as string,
                        "payment.amount": session.amount_total ? session.amount_total / 100 : 0, // Convertește din cents
                        "payment.currency": session.currency || 'eur'
                    },
                    { new: true }
                );

                if (updatedOrder) {
                    console.log(`✅ Order ${orderId} payment confirmed and status updated`);

                    // Trimite email-ul de confirmare automat
                    const emailSent = await sendOrderConfirmationEmail(orderId);

                    if (emailSent) {
                        console.log(`📧 Confirmation email sent for order ${orderId}`);
                    } else {
                        console.log(`⚠️ Email sending failed for order ${orderId}, but order was processed successfully`);
                    }
                } else {
                    console.error(`❌ Could not find or update order ${orderId}`);
                }
            } else {
                console.error('❌ No orderId found in session metadata');
            }
        }

        // Handle other webhook events if needed
        if (event.type === "payment_intent.payment_failed") {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log('❌ Payment failed for payment intent:', paymentIntent.id);

            // Marchează comanda ca eșuată
            if (paymentIntent.metadata?.orderId) {
                await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
                    "payment.status": "failed"
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}