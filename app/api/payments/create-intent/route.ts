import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil" // sau versiunea ta
});

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { orderId, lineItems } = await req.json();

        if (!orderId || !lineItems) {
            return NextResponse.json(
                { error: 'Order ID and line items are required' },
                { status: 400 }
            );
        }

        // Verifică că order-ul există
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // ✅ Construiește URL-uri complete
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`;
        const cancelUrl = `${baseUrl}/cancel`;

        console.log('Success URL:', successUrl);
        console.log('Cancel URL:', cancelUrl);

        // Creează Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems.map((item: any) => ({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.unitAmount * 100) // în cenți
                },
                quantity: item.quantity
            })),
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderId: orderId.toString()
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe session creation error:", error);
        return NextResponse.json(
            { error: "Failed to create payment session" },
            { status: 500 }
        );
    }
}