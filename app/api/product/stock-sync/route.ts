import Product from "@/lib/models/Product";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// api/product/stock-sync/route.ts - Sync multiple products stock
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const { productIds } = await request.json();

        if (!productIds || !Array.isArray(productIds)) {
            return NextResponse.json(
                { success: false, message: 'Invalid product IDs' },
                { status: 400 }
            );
        }

        const products = await Product.find(
            { _id: { $in: productIds } },
            { _id: 1, name: 1, stock: 1, price: 1, discount: 1 }
        );

        return NextResponse.json({
            success: true,
            products
        });

    } catch (error) {
        console.error('Error syncing stock:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

