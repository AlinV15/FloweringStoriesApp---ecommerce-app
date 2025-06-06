// api/product/[id]/reserve-stock/route.ts - Reserve stock API
import { NextRequest, NextResponse } from 'next/server';

import Product from '@/lib/models/Product';
import connectToDatabase from '@/lib/mongodb';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        // Find and update product stock atomically
        const product = await Product.findOneAndUpdate(
            {
                _id: productId,
                stock: { $gte: quantity } // Ensure enough stock available
            },
            {
                $inc: { stock: -quantity } // Decrease stock
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Not enough stock available or product not found' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Stock reserved successfully',
            newStock: product.stock
        });

    } catch (error) {
        console.error('Error reserving stock:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}