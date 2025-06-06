import Product from "@/lib/models/Product";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// api/product/[id]/check-stock/route.ts - Check current stock
export async function GET(_: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const prms = await params
        await connectToDatabase();

        const productId = prms.id;

        const product = await Product.findById(
            productId,
            { _id: 1, name: 1, stock: 1, price: 1, discount: 1 }
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product: {
                _id: product._id,
                name: product.name,
                stock: product.stock,
                price: product.price,
                discount: product.discount,
                available: product.stock > 0
            }
        });

    } catch (error) {
        console.error('Error checking stock:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}