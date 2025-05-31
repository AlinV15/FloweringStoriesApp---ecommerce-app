// /api/payments/create-intent/route.ts - VERSIUNEA CORECTATĂ

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
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

        // Verifică că order-ul există și preia datele complete
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        console.log('🛒 Order details:', {
            id: order._id,
            deliveryMethod: order.deliveryMethod,
            totalAmount: order.totalAmount
        });

        // ✅ Calculează shipping cost
        let shippingCost = 0;

        if (order.deliveryMethod === 'courier') {
            // Calculează subtotal pentru a determina shipping
            const subtotal = lineItems.reduce((total: number, item: any) => {
                return total + (item.unitAmount * item.quantity);
            }, 0);

            console.log('📦 Subtotal for shipping calculation:', subtotal);

            // OPȚIUNEA 1: Logică hardcoded (rapid)
            // shippingCost = subtotal >= 100 ? 0 : 15;

            // OPȚIUNEA 2: Din settings store (mai elegant)
            try {
                const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/settings`);
                if (settingsResponse.ok) {
                    const settings = await settingsResponse.json();
                    const threshold = settings.shippingSettings?.freeShippingThreshold || 100;
                    const defaultCost = settings.shippingSettings?.defaultShippingCost || 15;
                    shippingCost = subtotal >= threshold ? 0 : defaultCost;
                }
            } catch (error) {
                console.log('📝 Using fallback shipping settings');
                shippingCost = subtotal >= 100 ? 0 : 15;
            }
        }

        console.log('🚚 Calculated shipping cost:', shippingCost);

        // ✅ Construiește line items cu shipping
        const stripeLineItems = [
            // Produsele existente
            ...lineItems.map((item: any) => ({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.unitAmount * 100) // în cenți
                },
                quantity: item.quantity
            })),

            // ✅ Adaugă shipping ca line item separat (dacă > 0)
            ...(shippingCost > 0 ? [{
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Shipping Cost",
                        description: order.deliveryMethod === 'courier' ? 'Courier Delivery' : 'Delivery'
                    },
                    unit_amount: Math.round(shippingCost * 100) // în cenți
                },
                quantity: 1
            }] : [])
        ];

        console.log('💰 Stripe line items:', stripeLineItems);

        // ✅ Verifică că totalul matches
        const calculatedTotal = lineItems.reduce((total: number, item: any) => {
            return total + (item.unitAmount * item.quantity);
        }, 0) + shippingCost;

        console.log('🧮 Total verification:', {
            orderTotal: order.totalAmount,
            calculatedTotal: calculatedTotal,
            matches: Math.abs(order.totalAmount - calculatedTotal) < 0.01
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`;
        const cancelUrl = `${baseUrl}/cancel`;

        // Creează Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: stripeLineItems,
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderId: orderId.toString(),
                deliveryMethod: order.deliveryMethod,
                shippingCost: shippingCost.toString()
            }
        });

        console.log('✅ Stripe session created successfully');

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("❌ Stripe session creation error:", error);
        return NextResponse.json(
            { error: "Failed to create payment session" },
            { status: 500 }
        );
    }
}

// ALTERNATIVĂ: Dacă vrei să folosești settings store automat
export async function POST_WITH_SETTINGS(req: NextRequest) {
    try {
        await connectToDatabase();
        const { orderId, lineItems } = await req.json();

        if (!orderId || !lineItems) {
            return NextResponse.json(
                { error: 'Order ID and line items are required' },
                { status: 400 }
            );
        }

        // Verifică order-ul
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // ✅ Preia settings pentru shipping logic
        let shippingSettings = {
            freeShippingThreshold: 100,
            defaultShippingCost: 15
        };

        try {
            // Încearcă să preia din settings store
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

    } catch (error) {
        console.error("Stripe session creation error:", error);
        return NextResponse.json(
            { error: "Failed to create payment session" },
            { status: 500 }
        );
    }
}