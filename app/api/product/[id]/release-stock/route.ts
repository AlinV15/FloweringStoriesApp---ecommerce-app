import Product from "@/lib/models/Product";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// api/product/[id]/release-stock/route.ts - Release stock API
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const prms = await params
        await connectToDatabase();

        const { quantity } = await request.json();
        const productId = prms.id;

        if (!quantity || quantity <= 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid quantity' },
                { status: 400 }
            );
        }

        // Find and update product stock
        const product = await Product.findByIdAndUpdate(
            productId,
            {
                $inc: { stock: quantity } // Increase stock
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Stock released successfully',
            newStock: product.stock
        });

    } catch (error) {
        console.error('Error releasing stock:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}


