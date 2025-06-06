// /api/product/stationary/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Stationary from "@/lib/models/Stationary";
import Product from "@/lib/models/Product";
import { productSchema, stationarySchema } from "@/lib/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/product/stationary/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const par = await params;
        const id = par.id;

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid stationary ID format" }, { status: 400 });
        }

        const stationary = await Stationary.findById(id);
        console.log("Stationary found:", stationary);

        if (!stationary) {
            return NextResponse.json({ error: "Stationary not found" }, { status: 404 });
        }

        const product = await Product.findOne({
            refId: new mongoose.Types.ObjectId(id),
            type: "stationary"
        });

        console.log("Associated product found:", product);

        return NextResponse.json({
            // Stationary specific fields
            brand: stationary.brand,
            color: stationary.color,
            type: stationary.type,
            dimensions: stationary.dimensions,
            material: stationary.material,

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
        console.error("Error fetching stationary:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/product/stationary/[id]
const stationaryInputSchema = z.object({
    stationary: stationarySchema.partial(),
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
            return NextResponse.json({ error: "Invalid stationary ID format" }, { status: 400 });
        }

        const body = await req.json();
        console.log("PUT stationary request body:", body);

        const parsed = stationaryInputSchema.safeParse(body);
        if (!parsed.success) {
            console.error("Validation failed:", parsed.error.flatten());
            return NextResponse.json({
                error: "Validation failed",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { stationary, product } = parsed.data;

        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            const updatedStationary = await Stationary.findByIdAndUpdate(
                id,
                stationary,
                { new: true, session: mongoSession }
            );

            if (!updatedStationary) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Stationary not found" }, { status: 404 });
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { refId: new mongoose.Types.ObjectId(id), type: "stationary" },
                { ...product },
                { new: true, session: mongoSession }
            );

            if (!updatedProduct) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Associated product not found" }, { status: 404 });
            }

            await mongoSession.commitTransaction();

            return NextResponse.json({
                stationary: updatedStationary,
                product: updatedProduct,
                message: "Stationary and product updated successfully"
            });
        } catch (transactionError) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }
    } catch (error) {
        console.error("Error updating stationary:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/product/stationary/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }
        const { id } = await params;
        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid stationary ID format" }, { status: 400 });
        }

        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            const deletedProduct = await Product.findOneAndDelete({
                refId: new mongoose.Types.ObjectId(id),
                type: "stationary"
            }, { session: mongoSession });

            const deletedStationary = await Stationary.findByIdAndDelete(id, { session: mongoSession });

            if (!deletedStationary) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Stationary not found" }, { status: 404 });
            }

            await mongoSession.commitTransaction();

            return NextResponse.json({
                message: "Stationary and associated Product deleted",
                deletedProductId: deletedProduct?._id,
                deletedStationaryId: deletedStationary._id
            });
        } catch (transactionError) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }
    } catch (error) {
        console.error("Error deleting stationary:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}