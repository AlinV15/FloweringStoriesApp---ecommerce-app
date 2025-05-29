import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil"
});

export const config = {
    api: {
        bodyParser: false
    }
};

export async function POST(req: Request) {
    const rawBody = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            bodyBuffer,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        try {
            await connectToDatabase();
            const updated = await Order.findByIdAndUpdate(orderId, {
                status: "confirmed",
                "payment.status": "succeeded"
            });

            if (!updated) {
                console.warn("Comandă nu a fost găsită după plată:", orderId);
            }
        } catch (error) {
            console.error("Eroare la actualizarea comenzii:", error);
        }
    }

    return new Response("Webhook received", { status: 200 });
}