import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import { orderSchema, orderItemSchema } from "@/lib/validators";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    await connectToDatabase();
    const body = await req.json();

    // Extragem items separat pentru validare + creare
    const { items, ...orderData } = body;

    const itemSchema = z.array(orderItemSchema);
    const itemsValidation = itemSchema.safeParse(items);
    const orderValidation = orderSchema.omit({ items: true, totalAmount: true }).safeParse(orderData);

    if (!itemsValidation.success || !orderValidation.success) {
        return NextResponse.json({
            error: {
                items: itemsValidation.error?.flatten?.(),
                order: orderValidation.error?.flatten?.()
            }
        }, { status: 400 });
    }

    if (!userId && (!body.guestEmail || !body.guestName)) {
        return NextResponse.json({ error: "Trebuie să furnizezi nume și email ca guest." }, { status: 400 });
    }


    try {
        // Creează fiecare OrderItem în baza de date
        const createdOrderItems = await Promise.all(
            items.map(async (item: any) => {
                const orderItem = await OrderItem.create(item);
                return orderItem._id;
            })
        );

        // Calculează total
        const total = items.reduce((acc: number, item: any) => acc + item.lineAmount, 0);

        // Creează comanda
        const order = await Order.create({
            ...orderValidation.data,
            user: userId,
            guestEmail: !userId ? body.guestEmail : undefined,
            guestName: !userId ? body.guestName : undefined,
            items: createdOrderItems,
            totalAmount: total,
            total: total,
            status: "pending",
            payment: {
                ...orderValidation.data.payment,
                amount: total,
                currency: orderValidation.data.payment.currency || "ron",
                status: "processing"
            }
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Eroare la creare comandă:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

    let orders;
    if ((session.user as any).role === "admin") {
        orders = await Order.find().populate("user").populate("items").populate("address");
    } else {
        orders = await Order.find({ user: session.user.id }).populate("items").populate("address");
    }

    return NextResponse.json(orders);
}