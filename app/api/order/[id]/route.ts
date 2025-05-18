import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { updateOrderSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

    await connectToDatabase();
    const order = await Order.findById(params.id).populate("user").populate("items").populate("address");
    if (!order) return NextResponse.json({ error: "Comanda nu a fost găsită" }, { status: 404 });

    const isOwner = order.user?.toString() === session.user.id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    return NextResponse.json(order);
}


export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

    await connectToDatabase();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: "Comanda nu există" }, { status: 404 });

    const isOwner = order.user?.toString() === session.user.id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    await order.deleteOne();
    return NextResponse.json({ message: "Comanda ștearsă" });
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot modifica comenzile" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await Order.findByIdAndUpdate(params.id, parsed.data, { new: true });
    if (!updated) {
        return NextResponse.json({ error: "Comanda nu există" }, { status: 404 });
    }

    return NextResponse.json(updated);
}
