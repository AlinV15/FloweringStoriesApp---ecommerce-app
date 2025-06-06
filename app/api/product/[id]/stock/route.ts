import Product from "@/lib/models/Product";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// api/product/[id]/stock/route.ts - Update stock directly
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const prms = await params
        await connectToDatabase();

        const { stock } = await request.json();
        const productId = prms.id;

        if (stock < 0) {
            return NextResponse.json(
                { success: false, message: 'Stock cannot be negative' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            { stock },
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
            message: 'Stock updated successfully',
            product: {
                _id: product._id,
                name: product.name,
                stock: product.stock
            }
        });

    } catch (error) {
        console.error('Error updating stock:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

