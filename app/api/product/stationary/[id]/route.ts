import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Stationary from "@/lib/models/Stationary";
import Product from "@/lib/models/Product";
import { stationarySchema, productSchema } from "@/lib/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/product/flower/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    const par = await params;
    const id = par.id;
    // console.log("ID:", id);
    await connectToDatabase();
    const stnry = await Stationary.findById(id);
    //  console.log(stnry);
    if (!stnry) return NextResponse.json({ error: "Stationary not found" }, { status: 404 });
    return NextResponse.json(stnry);
}

// PUT si inputul pentru book si product
const inputSchema = z.object({
    stationary: stationarySchema.partial(),
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

    const { stationary, product } = parsed.data;

    const updatedFlwr = await Stationary.findByIdAndUpdate(params.id, stationary, { new: true });
    if (!updatedFlwr) return NextResponse.json({ error: "Flower not found" }, { status: 404 });

    const updatedProduct = await Product.findOneAndUpdate(
        { refId: new mongoose.Types.ObjectId(params.id), type: "stationary" },
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
        type: "stationary"
    });

    // Apoi ștergem cartea
    const deletedStationary = await Stationary.findByIdAndDelete(params.id);

    if (!deletedStationary) {
        return NextResponse.json({ error: "Stationary not found (product might have been deleted)" }, { status: 404 });
    }

    return NextResponse.json({
        message: "Stationary and associated Product deleted",
        deletedProductId: deletedProduct?._id,
        deletedBookId: deletedStationary._id
    });
}
