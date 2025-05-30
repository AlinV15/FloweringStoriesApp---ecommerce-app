// app/api/admin/top-products/route.ts
import connectToDatabase from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import OrderItem from '@/lib/models/OrderItem'
import Product from '@/lib/models/Product'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
    try {
        // Check if user is admin
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
        }

        await connectToDatabase()

        // Get all order items with populated product data
        const orderItems = await OrderItem.find()
            .populate({
                path: 'product',
                select: 'name price image type'
            })
            .lean()

        // Aggregate sales data by product
        const salesData = new Map()

        orderItems.forEach(item => {
            if (!item.product) return // Skip if product doesn't exist anymore

            const productId = item.product._id.toString()

            if (salesData.has(productId)) {
                const existing = salesData.get(productId)
                existing.totalSold += item.quantity
                existing.totalRevenue += item.lineAmount
            } else {
                salesData.set(productId, {
                    _id: productId,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    type: item.product.type,
                    totalSold: item.quantity,
                    totalRevenue: item.lineAmount
                })
            }
        })

        // Convert to array and sort by total sold
        const topProducts = Array.from(salesData.values())
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10) // Top 10 products

        return NextResponse.json(topProducts)

    } catch (error) {
        console.error('Error fetching top products:', error)
        return NextResponse.json({
            error: 'Failed to fetch top products',
            details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
        }, { status: 500 })
    }
}