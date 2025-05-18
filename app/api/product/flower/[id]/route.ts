import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Flower from "@/lib/models/Book";
import Product from "@/lib/models/Product";
import { flowerSchema, productSchema } from "@/lib/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/product/flower/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const flwr = await Flower.findById(params.id);
    if (!flwr) return NextResponse.json({ error: "Book not found" }, { status: 404 });
    return NextResponse.json(flwr);
}

// PUT si inputul pentru book si product
const inputSchema = z.object({
    flwer: flowerSchema.partial(),
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }
    await connectToDatabase();
    const body = await req.json();

    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { flwer, product } = parsed.data;

    const updatedFlwr = await Flower.findByIdAndUpdate(params.id, flwer, { new: true });
    if (!updatedFlwr) return NextResponse.json({ error: "Flower not found" }, { status: 404 });

    const updatedProduct = await Product.findOneAndUpdate(
        { refId: new mongoose.Types.ObjectId(params.id), type: "flower" },
        { ...product },
        { new: true }
    );

    return NextResponse.json({ updatedFlwr, updatedProduct });
}



// DELETE /api/product/book/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }
    await connectToDatabase();

    // Ștergem întâi produsul asociat
    const deletedProduct = await Product.findOneAndDelete({
        refId: new mongoose.Types.ObjectId(params.id),
        type: "flower"
    });

    // Apoi ștergem cartea
    const deletedFlower = await Flower.findByIdAndDelete(params.id);

    if (!deletedFlower) {
        return NextResponse.json({ error: "Flower not found (product might have been deleted)" }, { status: 404 });
    }

    return NextResponse.json({
        message: "Flower and associated Product deleted",
        deletedProductId: deletedProduct?._id,
        deletedBookId: deletedFlower._id
    });
}
