// app/api/admin/recent-orders/route.ts
import connectToDatabase from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        await connectToDatabase()
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()

        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 })
    }
}
