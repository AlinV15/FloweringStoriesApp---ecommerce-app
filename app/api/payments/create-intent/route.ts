// SOLUȚIA 1: Funcție helper internă + flag în request
// /api/payments/create-intent/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
});

// ✅ Funcție helper pentru logica cu settings
async function createPaymentSessionWithSettings(req: NextRequest) {
    await connectToDatabase();
    const { orderId, lineItems } = await req.json();

    if (!orderId || !lineItems) {
        return NextResponse.json(
            { error: 'Order ID and line items are required' },
            { status: 400 }
        );
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
        );
    }

    // Preia settings pentru shipping logic
    let shippingSettings = {
        freeShippingThreshold: 100,
        defaultShippingCost: 15
    };

    try {
        const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/settings`);
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            shippingSettings = settings.shippingSettings || shippingSettings;
        }
    } catch (error) {
        console.log('📝 Using default shipping settings');
    }

    // Calculează shipping
    let shippingCost = 0;
    if (order.deliveryMethod === 'courier') {
        const subtotal = lineItems.reduce((total: number, item: any) => {
            return total + (item.unitAmount * item.quantity);
        }, 0);

        shippingCost = subtotal >= shippingSettings.freeShippingThreshold
            ? 0
            : shippingSettings.defaultShippingCost;
    }

    // Construiește line items cu shipping
    const stripeLineItems = [
        ...lineItems.map((item: any) => ({
            price_data: {
                currency: "eur",
                product_data: { name: item.name },
                unit_amount: Math.round(item.unitAmount * 100)
            },
            quantity: item.quantity
        })),

        ...(shippingCost > 0 ? [{
            price_data: {
                currency: "eur",
                product_data: {
                    name: `Shipping (${shippingCost >= shippingSettings.freeShippingThreshold ? 'Free' : 'Standard'})`
                },
                unit_amount: Math.round(shippingCost * 100)
            },
            quantity: 1
        }] : [])
    ];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`;
    const cancelUrl = `${baseUrl}/cancel`;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: stripeLineItems,
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            orderId: orderId.toString(),
            shippingCost: shippingCost.toString()
        }
    });

    return NextResponse.json({ url: session.url });
}

// ✅ Funcția POST principală cu switching logic
export async function POST(req: NextRequest) {
    try {
        // Verifică dacă client-ul vrea versiunea cu settings
        const url = new URL(req.url);
        const useSettings = url.searchParams.get('useSettings') === 'true';

        if (useSettings) {
            return await createPaymentSessionWithSettings(req);
        }

        // Logica originală
        await connectToDatabase();
        const { orderId, lineItems } = await req.json();

        if (!orderId || !lineItems) {
            return NextResponse.json(
                { error: 'Order ID and line items are required' },
                { status: 400 }
            );
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // ... restul logicii originale
        let shippingCost = 0;
        if (order.deliveryMethod === 'courier') {
            const subtotal = lineItems.reduce((total: number, item: any) => {
                return total + (item.unitAmount * item.quantity);
            }, 0);
            shippingCost = subtotal >= 100 ? 0 : 15; // Hardcoded fallback
        }

        const stripeLineItems = [
            ...lineItems.map((item: any) => ({
                price_data: {
                    currency: "eur",
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.unitAmount * 100)
                },
                quantity: item.quantity
            })),
            ...(shippingCost > 0 ? [{
                price_data: {
                    currency: "eur",
                    product_data: { name: "Shipping Cost" },
                    unit_amount: Math.round(shippingCost * 100)
                },
                quantity: 1
            }] : [])
        ];

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: stripeLineItems,
            mode: "payment",
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`,
            cancel_url: `${baseUrl}/cancel`,
            metadata: { orderId: orderId.toString() }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("❌ Stripe session creation error:", error);
        return NextResponse.json(
            { error: "Failed to create payment session" },
            { status: 500 }
        );
    }
}