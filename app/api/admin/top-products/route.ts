// app/api/admin/top-products/route.ts
import connectToDatabase from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        await connectToDatabase()
        const products = await Product.find()
            .sort({ sold: -1 }) // presupunem că ai un câmp `sold`
            .limit(5)
            .lean()

        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch top products' }, { status: 500 })
    }
}
