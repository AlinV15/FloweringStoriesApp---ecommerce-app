// /api/product/flower/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Flower from "@/lib/models/Flower";
import Product from "@/lib/models/Product";
import { productSchema, flowerSchema } from "@/lib/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/product/flower/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const par = await params;
        const id = par.id;

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid flower ID format" }, { status: 400 });
        }

        const flower = await Flower.findById(id);
        console.log("Flower found:", flower);

        if (!flower) {
            return NextResponse.json({ error: "Flower not found" }, { status: 404 });
        }

        const product = await Product.findOne({
            refId: new mongoose.Types.ObjectId(id),
            type: "flower"
        });

        console.log("Associated product found:", product);

        return NextResponse.json({
            // Flower specific fields
            color: flower.color,
            freshness: flower.freshness,
            lifespan: flower.lifespan,
            season: flower.season,
            careInstructions: flower.careInstructions,
            expiryDate: flower.expiryDate,

            // Product fields (if product exists)
            ...(product && {
                productId: product._id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                discount: product.discount,
                Description: product.Description,
                image: product.image,
                type: product.type,
                typeRef: product.typeRef
            })
        });
    } catch (error) {
        console.error("Error fetching flower:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/product/flower/[id]
const flowerInputSchema = z.object({
    flower: flowerSchema.partial(),
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }

        const { id } = await params;

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid flower ID format" }, { status: 400 });
        }

        const body = await req.json();
        console.log("PUT flower request body:", body);

        const parsed = flowerInputSchema.safeParse(body);
        if (!parsed.success) {
            console.error("Validation failed:", parsed.error.flatten());
            return NextResponse.json({
                error: "Validation failed",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { flower, product } = parsed.data;

        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            const updatedFlower = await Flower.findByIdAndUpdate(
                id,
                flower,
                { new: true, session: mongoSession }
            );

            if (!updatedFlower) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Flower not found" }, { status: 404 });
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { refId: new mongoose.Types.ObjectId(id), type: "flower" },
                { ...product },
                { new: true, session: mongoSession }
            );

            if (!updatedProduct) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Associated product not found" }, { status: 404 });
            }

            await mongoSession.commitTransaction();

            return NextResponse.json({
                flower: updatedFlower,
                product: updatedProduct,
                message: "Flower and product updated successfully"
            });
        } catch (transactionError) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }
    } catch (error) {
        console.error("Error updating flower:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/product/flower/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }
        const { id } = await params;
        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid flower ID format" }, { status: 400 });
        }

        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            const deletedProduct = await Product.findOneAndDelete({
                refId: new mongoose.Types.ObjectId(id),
                type: "flower"
            }, { session: mongoSession });

            const deletedFlower = await Flower.findByIdAndDelete(id, { session: mongoSession });

            if (!deletedFlower) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Flower not found" }, { status: 404 });
            }

            await mongoSession.commitTransaction();

            return NextResponse.json({
                message: "Flower and associated Product deleted",
                deletedProductId: deletedProduct?._id,
                deletedFlowerId: deletedFlower._id
            });
        } catch (transactionError) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }
    } catch (error) {
        console.error("Error deleting flower:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}