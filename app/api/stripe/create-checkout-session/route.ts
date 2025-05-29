import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { config } from "dotenv";
config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
});

export async function POST(req: NextRequest) {
    const { orderId, lineItems } = await req.json();

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems.map((item: any) => ({
                price_data: {
                    currency: "ron",
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.unitAmount * 100 // în bani (bani = lei * 100)
                },
                quantity: item.quantity
            })),
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&order=${orderId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
            metadata: {
                orderId: orderId
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("Stripe error:", err);
        return NextResponse.json({ error: "Stripe session creation failed" }, { status: 500 });
    }
}
