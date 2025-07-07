// app/api/admin/recent-orders/route.ts
import connectToDatabase from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { NextResponse } from 'next/server'


export async function GET() {
    try {
        await connectToDatabase()

        const orders = await Order.find()
            .populate('user', 'firstName lastName email') // Populează user cu câmpurile necesare
            .sort({ createdAt: -1 })
            .limit(10) // Mărit la 10 pentru mai multe ordere
            .lean()

        // Transform data pentru a fi mai ușor de folosit în frontend 
        const transformedOrders = orders.map((order) => ({
            _id: (order._id as string | { toString(): string }).toString(),
            clientName: order.clientName,
            guestName: order.guestName,
            guestEmail: order.guestEmail,
            user: order.user ? {
                firstName: order.user.firstName,
                lastName: order.user.lastName,
                email: order.user.email
            } : null,
            status: order.status,
            totalAmount: order.totalAmount,
            payment: order.payment ? {
                status: order.payment.status,
                amount: order.payment.amount,
                currency: order.payment.currency
            } : null,
            deliveryMethod: order.deliveryMethod,
            createdAt: order.createdAt?.toISOString()
        }))

        return NextResponse.json(transformedOrders)
    } catch (error) {
        console.error('Error fetching recent orders:', error)
        return NextResponse.json({
            error: 'Failed to fetch recent orders',
            details: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
        }, { status: 500 })
    }
}